// MobiFlow Smart Contract — Compile + Deploy to Flow EVM Testnet
// Uses: solc (Solidity compiler) + ethers.js (EVM interactions)
// No Hardhat needed!

const solc = require("solc");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  // --- Step 1: Compile Solidity ---
  console.log("🔨 Compiling MobiFlowRewards.sol...");

  const contractPath = path.join(__dirname, "..", "contracts", "MobiFlowRewards.sol");
  const source = fs.readFileSync(contractPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "MobiFlowRewards.sol": { content: source },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter((e) => e.severity === "error");
    if (errors.length > 0) {
      console.error("❌ Compilation errors:");
      errors.forEach((e) => console.error(e.formattedMessage));
      process.exit(1);
    }
  }

  const contract = output.contracts["MobiFlowRewards.sol"]["MobiFlowRewards"];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  console.log("✅ Contract compiled successfully!");

  // Save ABI for backend usage
  const artifactDir = path.join(__dirname, "..", "artifacts");
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(
    path.join(artifactDir, "MobiFlowRewards.json"),
    JSON.stringify({ abi, bytecode }, null, 2)
  );
  console.log("💾 ABI saved to artifacts/MobiFlowRewards.json");

  // --- Step 2: Deploy to Flow EVM Testnet ---
  const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    console.error("❌ DEPLOYER_PRIVATE_KEY not set in .env");
    process.exit(1);
  }

  const RPC_URL = "https://testnet.evm.nodes.onflow.org";
  console.log(`\n🌐 Connecting to Flow EVM Testnet (${RPC_URL})...`);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`📋 Deployer address: ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} FLOW`);

  if (balance === 0n) {
    console.error("❌ No FLOW balance! Get testnet FLOW from: https://testnet-faucet.onflow.org/fund-account");
    process.exit(1);
  }

  console.log("\n🚀 Deploying MobiFlowRewards...");

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const deployed = await factory.deploy();
  await deployed.waitForDeployment();

  const address = await deployed.getAddress();
  console.log(`\n✅ MobiFlowRewards deployed to: ${address}`);
  console.log(`🔗 View on Flowscan: https://evm-testnet.flowscan.io/address/${address}`);

  // Save deployed address
  fs.writeFileSync(
    path.join(artifactDir, "deployed-address.txt"),
    address
  );
  console.log(`💾 Contract address saved to artifacts/deployed-address.txt`);
}

main().catch((err) => {
  console.error("❌ Deploy failed:", err);
  process.exit(1);
});
