const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy ERC-20 Token
  console.log("\n=== Deploying MyToken (ERC-20) ===");
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(deployer.address);
  await myToken.deployed();

  console.log("MyToken deployed to:", myToken.address);
  console.log("Token Name:", await myToken.name());
  console.log("Token Symbol:", await myToken.symbol());
  console.log("Token Decimals:", await myToken.decimals());

  // Deploy NFT Contract
  console.log("\n=== Deploying MyNFT (ERC-721) ===");
  const nftPrice = ethers.utils.parseEther("10"); // 10 tokens per NFT
  
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy(myToken.address, nftPrice, deployer.address);
  await myNFT.deployed();

  console.log("MyNFT deployed to:", myNFT.address);
  console.log("NFT Name:", await myNFT.name());
  console.log("NFT Symbol:", await myNFT.symbol());
  console.log("NFT Price:", ethers.utils.formatEther(await myNFT.price()), "tokens");
  console.log("Payment Token:", await myNFT.paymentToken());

  // Optional: Mint some tokens for testing
  console.log("\n=== Initial Setup ===");
  const initialMint = ethers.utils.parseEther("1000");
  await myToken.mint(deployer.address, initialMint);
  console.log("Minted", ethers.utils.formatEther(initialMint), "tokens to deployer");

  console.log("\n=== Deployment Summary ===");
  console.log("ERC-20 Token Address:", myToken.address);
  console.log("ERC-721 NFT Address:", myNFT.address);
  console.log("NFT Price:", ethers.utils.formatEther(nftPrice), "tokens");
  console.log("Owner:", deployer.address);

  // Verification commands for Etherscan (if needed)
  console.log("\n=== Verification Commands ===");
  console.log("To verify MyToken:");
  console.log(`npx hardhat verify --network <network> ${myToken.address} "${deployer.address}"`);
  console.log("To verify MyNFT:");
  console.log(`npx hardhat verify --network <network> ${myNFT.address} "${myToken.address}" "${nftPrice}" "${deployer.address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
