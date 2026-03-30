<div align="center">
  <img src="public/logo_transparent.png" alt="GeoCorp Logo" width="200"/>
  <h1>GeoCorp</h1>
  <p><strong>Capture. Own. Earn.</strong></p>
  <p>The first location-based strategy game where real local businesses sustain player yield.</p>
</div>

---

## 🌍 Overview

**GeoCorp** is a zero-friction DePIN (Decentralized Physical Infrastructure Network) and Consumer Crypto game built on the **Flow Blockchain**. 

Players physically explore their cities, capture real-world businesses (cafes, restaurants, gyms) using AI-validated photos, and earn passive $GEO yield. Unlike traditional GameFi models that rely on new player inflows (Ponzi mechanics), GeoCorp's endgame is a B2B ad-network where real local businesses sponsor the yield of the players who "own" their digital twin.


## 🚀 Features

*   **Walletless Onboarding:** No seed phrases, no gas fees, no friction. Sign in with Email/OTP, and we spin up a non-custodial EVM wallet in the background.
*   **AI Anti-Spoofing:** Powered by Google's Gemini 3 Flash, our backend validates every photo capture to ensure players are physically at the location and not taking photos of screens or fake buildings.
*   **Real-time Passive Yield:** Every captured business generates passive $GEO yield depending on its commercial tier. 
*   **Progressive Web App (PWA):** Installs directly to the user's home screen without navigating the restrictive app store policies regarding crypto/NFTs.
*   **Flow EVM Integration:** Fast, low-cost verifiable ownership of real-world assets (RWA) mapped as NFTs on the Flow Testnet.

## 🎯 Hackathon Tracks (PL_Genesis)

GeoCorp was built specifically to address the following challenges:
1. **Flow: The Future of Finance (Consumer Crypto):** Walletless Onboarding (OTP) & Sponsored Gas UX to bring Web3 to the real world effortlessly.
2. **Crypto (DePIN):** Gamified Mapbox map targeting physical commercial businesses to earn passive $GEO yield.
3. **AI & Robotics:** Google Gemini 3 Flash acts as an Economic Oracle, validating photo proofs in real-time and creating a cryptographic audit trail for the tokens minted.
4. **Infrastructure & Digital Rights (Protocol Labs):** All captured photo proofs are pinned permanently to IPFS via Pinata to ensure verifiable Data Ownership and prevent censorship.

## 🏗️ Architecture (Web2.5 approach)

To deliver a 60 FPS mobile experience without blockchain latency, GeoCorp uses a **Web2.5 Hybrid Architecture**:
1.  **Frontend:** React + Vite + Tailwind CSS (PWA optimized)
2.  **State & Auth:** Supabase (OTP Auth, high-speed PostgreSQL state mirroring)
3.  **AI Oracle:** Google Gemini API for real-time image analysis.
4.  **On-Chain Layer:** Solidity Smart Contracts deployed on Flow EVM.
5.  **Decentralized Storage:** Pinata (IPFS) for immutable storage of captured location photos.

## 🛠️ Run Locally

### Prerequisites
*   Node.js 18+
*   Supabase Account
*   Pinata JWT
*   Gemini API Key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ummaJAC/flowmap-rewards-main.git
   cd flowmap-rewards-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory matching exactly our `.env.example`:
   ```env
   # === AI ORACLE ===
   OPENROUTER_API_KEY=your_openrouter_key
   
   # === FLOW EVM BLOCKCHAIN ===
   DEPLOYER_PRIVATE_KEY=your_flow_evm_private_key
   
   # === IPFS (Pinata) ===
   PINATA_JWT=your_pinata_jwt
   
   # === SUPABASE ===
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Start the Development Servers**
   You need to run the backend and the frontend concurrently. Open two terminals:
   
   **Terminal 1 (Backend API):**
   ```bash
   node server/index.js
   ```
   
   **Terminal 2 (Frontend PWA):**
   ```bash
   npm run dev
   ```

## 🚨 For the Judges: How to Test

We know you are reviewing dozens of projects. We don’t want you to have to walk outside to test our geo-location app! We have implemented a **Desk Testing Mode**.

1. **Install the PWA:** For the full immersive, native-app experience, please open the live link on your phone (Safari/Chrome) and tap **"Add to Home Screen"**. It takes 3 seconds but completely changes the feel of the app compared to a mobile browser tab.
2. **Log in:** Use any email. A secure EVM wallet is instantly generated for you via OTP.
3. **Locate:** Ensure GPS is enabled so the map can load businesses near you. Tap on any nearby business and hit **"Capture Now"**.
4. **Desk-Capture:** Instead of walking to the building, simply open Google Images on your laptop, search for a business building, and take a photo of your monitor screen. Our AI Oracle (Gemini 3 Flash) has been specifically prompted to accept monitor photos for your evaluation.
5. **Earn:** Watch the AI validate your proof, pin the data to IPFS, and mint your passive $GEO yield!

## 🗺️ Roadmap & Post-Hackathon

- [x] **Initial Release & Hackathon MVP:** Core capture loop, Web2.5 yield sync, AI Vision oracle.
- [ ] **On-Chain Batching:** Fully decentralized state synchronization moving the Supabase database to periodic Flow EVM rollups.
- [ ] **B2B Revenue Portal:** Allow local restaurants and cafes to 'buy back' their location, inject fiat/stablecoins to boost foot traffic, fueling the $GEO yield.
- [ ] **Mainnet Launch:** Transition from Flow Testnet to Mainnet.

---
<div align="center">
  <i>No jargon. No manual steps. No "sign this transaction" fatigue.<br>Just intuitive, automated gaming that users can trust.</i>
</div>
