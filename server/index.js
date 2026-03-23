import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';

import db from './db.js';
import authRouter from './auth.js';

dotenv.config();

// --- Pinata IPFS Upload ---
// (omitted for brevity in replacement preview)
async function uploadToIPFS(fileBuffer, fileName, mimeType) {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('file', blob, fileName);

    const metadata = JSON.stringify({ name: `GeoCorp-${fileName}` });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', options);

    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
        body: formData,
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Pinata upload failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log(`📦 IPFS Upload OK! CID: ${data.IpfsHash}`);
    return data.IpfsHash; // This is the CID
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'geocorp-super-secret-key-123';

// --- Auth Middleware ---
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// --- OpenRouter AI Setup ---
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "https://geocorp.app",
        "X-Title": "GeoCorp",
    }
});

// --- Flow EVM Smart Contract Setup ---
const FLOW_RPC = "https://testnet.evm.nodes.onflow.org";
const CONTRACT_ADDRESS = "0x616e6907FBAd7CDCC18075b67B4119119B478FEf";

let contract = null;
let wallet = null;

try {
    const artifactPath = join(__dirname, '..', 'artifacts', 'GeoCorp.json');
    const { abi } = JSON.parse(readFileSync(artifactPath, 'utf8'));
    const provider = new ethers.JsonRpcProvider(FLOW_RPC);
    wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
    console.log(`⛓️  GeoCorp NFT contract loaded: ${CONTRACT_ADDRESS}`);
    console.log(`📋 Oracle/Deployer: ${wallet.address}`);
} catch (err) {
    console.warn("⚠️  Could not load smart contract (blockchain features disabled):", err.message);
}

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

// Database Profile Info
app.get('/api/me', requireAuth, (req, res) => {
    try {
        const user = db.prepare('SELECT id, email, username, energy, evm_address, evm_private_key FROM users WHERE id = ?').get(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const businesses = db.prepare('SELECT * FROM businesses WHERE user_id = ?').all(user.id);

        const totalYield = businesses.reduce((sum, b) => sum + b.yield_rate, 0);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                energy: user.energy,
                evm_address: user.evm_address,
                evm_private_key: user.evm_private_key, // Passed purely for hackathon MVP view
                balance: totalYield * 10 // Arbitrary total balance simulation
            },
            businesses: businesses,
            metrics: {
                dailyYield: totalYield,
                propertiesOwned: businesses.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Database Leaderboard
app.get('/api/leaderboard', (req, res) => {
    try {
        const users = db.prepare(`
            SELECT u.id, u.username, u.evm_address,
                   COALESCE(SUM(b.yield_rate), 0) as daily_yield,
                   COUNT(b.id) as properties_owned
            FROM users u
            LEFT JOIN businesses b ON u.id = b.user_id
            GROUP BY u.id
            ORDER BY daily_yield DESC, properties_owned DESC
        `).all();

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'GeoCorp backend is running!',
        blockchain: contract ? `Connected to ${CONTRACT_ADDRESS}` : 'Not connected',
        ipfs: process.env.PINATA_JWT ? 'Pinata connected' : 'Not configured',
    });
});

// --- Main Validation Endpoint ---
app.post('/api/validate', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No photo provided' });
        }

        const mimeType = req.file.mimetype;
        const base64Image = req.file.buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        // Extract metadata from the request body
        const explorerAddress = req.body.explorerAddress || "0x0000000000000000000000000000000000000001";
        const lat = req.body.lat ? Math.round(parseFloat(req.body.lat) * 1e6) : 0;
        const lng = req.body.lng ? Math.round(parseFloat(req.body.lng) * 1e6) : 0;
        const reward = req.body.reward ? parseInt(req.body.reward) : 25;

        const businessName = req.body.businessName || '';
        const businessCategory = req.body.businessCategory || '';
        const SERPER_API_KEY = process.env.SERPER_API_KEY || '';

        console.log(`\n🔍 Analyzing image for mission: "${businessName}" (${businessCategory})...`);

        // ── Step 1: Fetch reference image from Google Images via Serper ──
        let referenceImageUrl = null;
        let referenceDataUrl = null; // base64-encoded version for reliable AI delivery

        // Get city name via Reverse Geocoding to improve Google Image search accuracy
        let cityName = "";
        try {
            if (req.body.lat && req.body.lng) {
                const geoLat = parseFloat(req.body.lat);
                const geoLng = parseFloat(req.body.lng);
                console.log(`🌍 Getting city name for coordinates: ${geoLat}, ${geoLng}...`);
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${geoLat}&lon=${geoLng}`, {
                    headers: { 'User-Agent': 'GeoCorp-Verification-Server/1.0' }
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || "";
                    if (cityName) console.log(`📍 Found city: ${cityName}`);
                }
            }
        } catch (e) {
            console.log("⚠️ Reverse geocoding failed, proceeding without city name.");
        }

        try {
            const serperQuery = `${businessName} ${businessCategory} ${cityName} storefront exterior building`.trim();
            console.log(`🖼️  Serper: Searching reference image for "${serperQuery}"...`);

            const serperRes = await fetch('https://google.serper.dev/images', {
                method: 'POST',
                headers: {
                    'X-API-KEY': SERPER_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: serperQuery,
                    num: 5,
                }),
            });

            if (serperRes.ok) {
                const serperData = await serperRes.json();
                const images = serperData.images || [];

                // Try to download each image result until one succeeds
                for (const img of images) {
                    try {
                        const imgRes = await fetch(img.imageUrl, {
                            headers: { 'User-Agent': 'Mozilla/5.0' },
                            signal: AbortSignal.timeout(5000),
                        });
                        if (!imgRes.ok) continue;

                        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
                        if (!contentType.startsWith('image/')) continue;

                        const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
                        if (imgBuffer.length < 1000) continue; // Skip tiny/broken images

                        referenceDataUrl = `data:${contentType};base64,${imgBuffer.toString('base64')}`;
                        referenceImageUrl = img.imageUrl;
                        console.log(`✅ Reference image downloaded (${(imgBuffer.length / 1024).toFixed(1)}KB): ${img.imageUrl.substring(0, 80)}...`);
                        break;
                    } catch (dlErr) {
                        console.log(`⚠️  Failed to download ${img.imageUrl.substring(0, 60)}...: ${dlErr.message}`);
                    }
                }

                if (!referenceDataUrl) {
                    console.log('⚠️  Could not download any reference images, falling back to single-image mode.');
                }
            } else {
                console.log(`⚠️  Serper API error (${serperRes.status}), falling back to single-image mode.`);
            }
        } catch (serperErr) {
            console.log('⚠️  Serper fetch failed:', serperErr.message, '— falling back to single-image mode.');
        }

        // ── Step 2: Build the AI prompt (dual-image or single-image) ──
        let promptText;
        let messageContent;

        if (referenceDataUrl) {
            // ★ DUAL-IMAGE MODE: Compare user photo vs Google reference
            promptText = `You are an AI Oracle for GeoCorp, a Web3 location verification game.

You are given TWO images:
- IMAGE 1 (User Photo): A photo submitted by the user who claims to be physically at "${businessName}" (Category: ${businessCategory}).
- IMAGE 2 (Google Reference): A reference image of "${businessName}" from Google Images.

CRITICAL INSTRUCTION FOR THIS TEST:
Do NOT reject the user's photo if it appears to be taken from a computer screen, monitor, or indoors. The user is testing the system from home — this is expected.

YOUR JOB:
1. Look at IMAGE 2 (the Google reference) to learn what "${businessName}" looks like — its architecture, logo, sign, color scheme, and overall appearance.
2. Then look at IMAGE 1 (the user's photo) and determine: does it show the SAME place as IMAGE 2?
3. Focus on: matching building shape, signage, logo, brand colors, store layout, architectural details, or any other recognizable features.

If IMAGE 1 matches "${businessName}" (even from a different angle, distance, time of day, or through a screen), respond ONLY in this EXACT format: 'YES|TYPE' 
where TYPE is one of: CAFE, RESTAURANT, SHOP, OFFICE, GAS, PARK, HOTEL, MALL, GYM, OTHER.

If IMAGE 1 clearly shows a DIFFERENT business or location (completely different building, different brand), respond ONLY with: 'NO'.

Examples:
- User photo matches the reference building → 'YES|CAFE'
- User photo shows a completely different restaurant → 'NO'`;

            messageContent = [
                { type: "text", text: promptText },
                { type: "image_url", image_url: { url: dataUrl } },
                { type: "image_url", image_url: { url: referenceDataUrl } },
            ];
            console.log('🔀 Mode: DUAL-IMAGE comparison (User Photo + Google Reference)');
        } else {
            // Fallback: single image mode
            promptText = `You are an AI for a verification game. The user is attempting to verify a location named "${businessName}" (Category: ${businessCategory}).

CRITICAL INSTRUCTION FOR THIS TEST: 
Do NOT reject this photo if it is a picture of a computer screen, a monitor, or taken indoors. The user is testing the system from home.

YOUR ONLY JOB:
Look closely at the image. Does it depict "${businessName}"?
- If the name is a famous landmark/building (like Berliner Dom), does the architecture match?
- If it's a store/cafe, is there a logo or sign that matches "${businessName}"?

If YES, respond ONLY IN THIS EXACT FORMAT: 'YES|OTHER'.
If the image shows a completely DIFFERENT business or building (e.g. McDonald's instead of Starbucks, or an office instead of a Cathedral), respond ONLY IN THIS EXACT FORMAT: 'NO'.`;

            messageContent = [
                { type: "text", text: promptText },
                { type: "image_url", image_url: { url: dataUrl } },
            ];
            console.log('📷 Mode: SINGLE-IMAGE (no reference available)');
        }

        // ── Step 3: Call GPT-4o-mini Vision ──
        const response = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: messageContent,
                }
            ],
            max_tokens: 30,
        });

        const aiAnswer = response.choices[0]?.message?.content?.trim().toUpperCase();
        console.log("🤖 OpenRouter Answer:", aiAnswer);

        const isApproved = aiAnswer.includes('YES');

        // Parse building type from AI response (e.g., "YES|CAFE")
        const buildingTypeMap = { CAFE: 0, RESTAURANT: 1, SHOP: 2, OFFICE: 3, GAS: 4, PARK: 5, HOTEL: 6, MALL: 7, GYM: 8, OTHER: 9 };
        let buildingType = 9; // Default: Other
        if (isApproved && aiAnswer.includes('|')) {
            const typePart = aiAnswer.split('|')[1]?.trim();
            if (typePart && buildingTypeMap[typePart] !== undefined) {
                buildingType = buildingTypeMap[typePart];
            }
        }

        // --- Blockchain: Record result on-chain ---
        let txHash = null;
        let flowscanUrl = null;

        if (contract) {
            try {
                if (isApproved) {
                    // Photo verified → upload to IPFS via Pinata, then mint NFT on-chain
                    let ipfsCid = 'upload-failed';
                    try {
                        const fileName = `building_${Date.now()}.jpg`;
                        ipfsCid = await uploadToIPFS(req.file.buffer, fileName, mimeType);
                    } catch (ipfsErr) {
                        console.error('⚠️ IPFS upload failed, minting with fallback CID:', ipfsErr.message);
                    }
                    console.log(`⛓️  Calling captureProperty(${explorerAddress}, "${ipfsCid}", ${lat}, ${lng}, ${buildingType})...`);
                    const tx = await contract.captureProperty(explorerAddress, ipfsCid, lat, lng, buildingType);
                    const receipt = await tx.wait();
                    txHash = receipt.hash;
                    flowscanUrl = `https://evm-testnet.flowscan.io/tx/${txHash}`;
                    console.log(`✅ Property NFT minted! TX: ${flowscanUrl}`);
                } else {
                    // Photo rejected → issue strike on-chain
                    console.log(`⛓️  Calling issueStrike(${explorerAddress})...`);
                    const tx = await contract.issueStrike(explorerAddress);
                    const receipt = await tx.wait();
                    txHash = receipt.hash;
                    flowscanUrl = `https://evm-testnet.flowscan.io/tx/${txHash}`;
                    console.log(`⚠️ Strike TX confirmed: ${flowscanUrl}`);
                }
            } catch (chainErr) {
                console.error("❌ Blockchain TX failed:", chainErr.message);
            }
        }

        res.json({
            success: true,
            approved: isApproved,
            message: isApproved ? 'AI verified the location!' : 'AI could not verify the target object.',
            raw_ai_response: aiAnswer,
            blockchain: {
                txHash,
                flowscanUrl,
                contract: CONTRACT_ADDRESS,
                reward: isApproved ? reward : 0,
            }
        });

    } catch (error) {
        console.error("Error during validation:", error);
        const aiAnswer = error.response?.data?.error?.message || error.message || "Unknown API Error";
        console.log("Fallback to mock validation triggered.", aiAnswer);
        res.json({
            success: true,
            approved: false,
            message: `API Error: ${aiAnswer}`,
            raw_ai_response: "NO (Fallback)",
            blockchain: { txHash: null, flowscanUrl: null, contract: CONTRACT_ADDRESS, reward: 0, buildingType: null },
        });
    }
});

// --- Player Stats Endpoint ---
app.get('/api/stats/:address', async (req, res) => {
    try {
        if (!contract) return res.status(503).json({ error: 'Blockchain not connected' });

        const [propertyCount, geoTokens, lifetimeEarned, strikeCount] = await contract.getPlayerStats(req.params.address);
        res.json({
            address: req.params.address,
            properties: Number(propertyCount),
            geoBalance: Number(geoTokens),
            totalEarned: Number(lifetimeEarned),
            strikes: Number(strikeCount),
            contract: CONTRACT_ADDRESS,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Player Properties Endpoint ---
app.get('/api/properties/:address', async (req, res) => {
    try {
        if (!contract) return res.status(503).json({ error: 'Blockchain not connected' });

        const tokenIds = await contract.getPlayerProperties(req.params.address);
        const properties = [];

        for (const tokenId of tokenIds) {
            const prop = await contract.getProperty(tokenId);
            properties.push({
                tokenId: Number(tokenId),
                ipfsCid: prop.ipfsCid,
                lat: Number(prop.lat) / 1e6,
                lng: Number(prop.lng) / 1e6,
                buildingType: Number(prop.buildingType),
                dailyYield: Number(prop.dailyYield),
                capturedAt: Number(prop.capturedAt),
                forSale: prop.forSale,
                salePrice: Number(prop.salePrice),
            });
        }

        res.json({ address: req.params.address, properties });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Marketplace Listings Endpoint ---
app.get('/api/marketplace', async (req, res) => {
    try {
        if (!contract) return res.status(503).json({ error: 'Blockchain not connected' });

        const start = parseInt(req.query.start) || 0;
        const count = parseInt(req.query.count) || 20;
        const [tokenIds, prices, sellers] = await contract.getMarketListings(start, count);

        const listings = [];
        for (let i = 0; i < tokenIds.length; i++) {
            if (Number(tokenIds[i]) === 0) continue;
            const prop = await contract.getProperty(tokenIds[i]);
            listings.push({
                tokenId: Number(tokenIds[i]),
                price: Number(prices[i]),
                seller: sellers[i],
                ipfsCid: prop.ipfsCid,
                lat: Number(prop.lat) / 1e6,
                lng: Number(prop.lng) / 1e6,
                buildingType: Number(prop.buildingType),
                dailyYield: Number(prop.dailyYield),
            });
        }

        res.json({ listings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`\n🚀 GeoCorp Server running on port ${port}`);
    console.log(`⛓️  Flow EVM Testnet | Contract: ${CONTRACT_ADDRESS}`);
    console.log(`📦 IPFS: Pinata ${process.env.PINATA_JWT ? '✅ Connected' : '❌ Not configured'}`);
    console.log(`🔗 Flowscan: https://evm-testnet.flowscan.io/address/${CONTRACT_ADDRESS}\n`);
});
