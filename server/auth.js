import express from 'express';
import { ethers } from 'ethers';
import { supabaseAdmin } from './supabaseClient.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper to generate a Flow EVM Wallet
function generateWallet() {
    const randomWallet = ethers.Wallet.createRandom();
    return {
        address: randomWallet.address,
        privateKey: randomWallet.privateKey
    };
}

// ── 1. Send OTP code to email (Supabase Magic Link / OTP) ──
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const normalizedEmail = email.toLowerCase().trim();

        // Use Supabase Auth to send an OTP code via email
        const { error } = await supabaseAdmin.auth.signInWithOtp({
            email: normalizedEmail,
            options: {
                shouldCreateUser: true, // Auto-create if not exists
            }
        });

        if (error) {
            console.error('Supabase OTP Error:', error);
            return res.status(400).json({ error: error.message });
        }

        console.log(`📧 OTP sent to ${normalizedEmail}`);
        res.json({ success: true, message: 'Verification code sent to your email' });
    } catch (err) {
        console.error("Send OTP Error:", err);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
});

// ── 2. Verify OTP and login/register ──
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

        const normalizedEmail = email.toLowerCase().trim();

        // Verify the OTP with Supabase Auth
        const { data, error } = await supabaseAdmin.auth.verifyOtp({
            email: normalizedEmail,
            token: code,
            type: 'email',
        });

        if (error) {
            console.error('OTP Verify Error:', error);
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        const supabaseUser = data.user;
        const session = data.session;

        if (!supabaseUser) {
            return res.status(400).json({ error: 'Verification failed' });
        }

        // Check if profile exists in our profiles table
        const { data: profile, error: profileErr } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

        if (profile) {
            // Existing user → login
            console.log(`✅ Login: ${profile.username} (${normalizedEmail})`);
            
            // Generate a long-lived custom JWT (30 days) to prevent 1-hour logouts
            const customToken = jwt.sign({ id: profile.id, email: profile.email }, process.env.JWT_SECRET || 'geocorp-super-secret-key-123', { expiresIn: '30d' });

            return res.json({
                token: customToken,
                user: {
                    id: profile.id,
                    email: profile.email,
                    username: profile.username,
                    evm_address: profile.evm_address,
                    evm_private_key: profile.evm_private_key,
                    energy: profile.energy,
                    geo_balance: profile.geo_balance,
                }
            });
        }

        // New user → create profile with EVM wallet
        const newWallet = generateWallet();
        const username = `Player_${Math.floor(Math.random() * 9000) + 1000}`;

        const { data: newProfile, error: insertErr } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: supabaseUser.id,
                email: normalizedEmail,
                username,
                evm_address: newWallet.address,
                evm_private_key: newWallet.privateKey,
                geo_balance: 50, // Welcome bonus
            })
            .select()
            .single();

        if (insertErr) {
            console.error('Profile insert error:', insertErr);
            return res.status(500).json({ error: 'Failed to create profile' });
        }

        // Log welcome bonus transaction
        await supabaseAdmin.from('transactions').insert({
            user_id: supabaseUser.id,
            type: 'reward',
            amount: 50,
            description: 'Welcome bonus',
        });

        console.log(`🆕 New user registered: ${username} (${normalizedEmail}) → ${newWallet.address}`);

        const customToken = jwt.sign({ id: newProfile.id, email: newProfile.email }, process.env.JWT_SECRET || 'geocorp-super-secret-key-123', { expiresIn: '30d' });

        res.json({
            token: customToken,
            user: {
                id: newProfile.id,
                email: newProfile.email,
                username: newProfile.username,
                evm_address: newProfile.evm_address,
                evm_private_key: newProfile.evm_private_key,
                energy: newProfile.energy,
                geo_balance: newProfile.geo_balance,
            }
        });
    } catch (err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

// ── 3. Google OAuth (Login / Register) ──
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ error: 'No credential provided' });

        // Verify with Google API using access_token
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${credential}` }
        });
        const payload = await response.json();

        if (payload.error || !payload.email) {
            return res.status(401).json({ error: 'Invalid Google token' });
        }

        const email = payload.email.toLowerCase().trim();
        const googleName = payload.name || `User_${payload.sub?.substring(0, 6)}`;

        // Create or get user in Supabase Auth
        // Use admin API to create/find user by email
        let supabaseUserId;

        // Try to find existing user by email
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = existingUsers?.users?.find(u => u.email === email);

        if (existingAuthUser) {
            supabaseUserId = existingAuthUser.id;
        } else {
            // Create user in Supabase Auth
            const { data: newAuthUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
                email,
                email_confirm: true,
            });
            if (createErr) {
                console.error('Supabase create user error:', createErr);
                return res.status(500).json({ error: 'Failed to create auth user' });
            }
            supabaseUserId = newAuthUser.user.id;
        }

        // Generate a session token for this user
        const { data: sessionData, error: sessionErr } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
        });

        // Check if profile exists
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', supabaseUserId)
            .single();

        if (profile) {
            // Generate a proper session
            const { data: signInData } = await supabaseAdmin.auth.signInWithPassword({
                email,
                password: supabaseUserId, // Use ID as password for google users
            }).catch(() => ({ data: null }));

            console.log(`✅ Google Login: ${profile.username} (${email})`);
            const customToken = jwt.sign({ id: profile.id, email: profile.email }, process.env.JWT_SECRET || 'geocorp-super-secret-key-123', { expiresIn: '30d' });
            return res.json({
                token: customToken,
                user: {
                    id: profile.id,
                    email: profile.email,
                    username: profile.username,
                    evm_address: profile.evm_address,
                    evm_private_key: profile.evm_private_key,
                    energy: profile.energy,
                    geo_balance: profile.geo_balance,
                }
            });
        }

        // New user → create profile with wallet
        const newWallet = generateWallet();
        const username = googleName || `Player_${Math.floor(Math.random() * 9000) + 1000}`;

        const { data: newProfile, error: insertErr } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: supabaseUserId,
                email,
                username,
                evm_address: newWallet.address,
                evm_private_key: newWallet.privateKey,
                geo_balance: 50,
            })
            .select()
            .single();

        if (insertErr) {
            console.error('Profile insert error:', insertErr);
            return res.status(500).json({ error: 'Failed to create profile' });
        }

        // Log welcome bonus
        await supabaseAdmin.from('transactions').insert({
            user_id: supabaseUserId,
            type: 'reward',
            amount: 50,
            description: 'Welcome bonus',
        });

        console.log(`🆕 Google Register: ${username} (${email}) → ${newWallet.address}`);

        const customToken = jwt.sign({ id: newProfile.id, email: newProfile.email }, process.env.JWT_SECRET || 'geocorp-super-secret-key-123', { expiresIn: '30d' });

        res.json({
            token: customToken,
            user: {
                id: newProfile.id,
                email: newProfile.email,
                username: newProfile.username,
                evm_address: newProfile.evm_address,
                evm_private_key: newProfile.evm_private_key,
                energy: newProfile.energy,
                geo_balance: newProfile.geo_balance,
            }
        });
    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ error: 'Server error during Google authentication' });
    }
});

export default router;
