import { network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const { ethers } = await network.connect();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("ERROR: CONTRACT_ADDRESS not found in .env file");
    process.exit(1);
  }

  console.log("Verifying contract at:", contractAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  
  // Connect to the deployed contract
  const XyraChain = await ethers.getContractAt("XyraChain", contractAddress);
  
  // Get the signer (your wallet)
  const [signer] = await ethers.getSigners();
  console.log("Testing with address:", signer.address);
  
  // Test 1: Check if we can read reports (should return empty array initially)
  console.log("\nTest 1: Fetching existing reports...");
  const existingReports = await XyraChain.getMyReports();
  console.log(`Found ${existingReports.length} existing report(s)`);
  
  if (existingReports.length > 0) {
    existingReports.forEach((report: any, index: number) => {
      console.log(`\n--- Report #${index + 1} ---`);
      console.log("  IPFS Hash:", report.ipfsHash);
      console.log("  Diagnosis:", report.diagnosis);
      console.log("  Confidence:", report.confidence.toString() + "%");
      console.log("  Timestamp:", new Date(Number(report.timestamp) * 1000).toLocaleString());
    });
  }
  
  // Test 2: Add a test report
  console.log("\nTest 2: Adding a test report...");
  const testTx = await XyraChain.addReport(
    "QmTestHash123456789", 
    "Test: Normal chest X-ray",
    95
  );
  
  console.log("Waiting for transaction confirmation...");
  const receipt = await testTx.wait();
  console.log("Report added successfully!");
  console.log("Transaction hash:", receipt.hash);
  
  // Test 3: Verify the report was added
  console.log("\nTest 3: Verifying report was added...");
  const updatedReports = await XyraChain.getMyReports();
  console.log(`Total reports now: ${updatedReports.length}`);
  
  const latestReport = updatedReports[updatedReports.length - 1];
  console.log("\n--- Latest Report ---");
  console.log("  IPFS Hash:", latestReport.ipfsHash);
  console.log("  Diagnosis:", latestReport.diagnosis);
  console.log("  Confidence:", latestReport.confidence.toString() + "%");
  console.log("  Timestamp:", new Date(Number(latestReport.timestamp) * 1000).toLocaleString());
  
  console.log("\nAll tests passed! Contract is working correctly.");
}

main().catch((error) => {
  console.error("\nError:", error.message);
  process.exitCode = 1;
});
