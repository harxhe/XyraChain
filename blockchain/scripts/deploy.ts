import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {

console.log("Deploying XyraChain...");
  const XyraChain = await ethers.getContractFactory("XyraChain");
  const contract = await XyraChain.deploy();

  await contract.waitForDeployment();

  console.log(`XyraChain deployed to: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});