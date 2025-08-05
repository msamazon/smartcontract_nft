const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration Tests", function () {
  let myToken;
  let myNFT;
  let owner;
  let user1;
  let user2;
  let user3;
  const nftPrice = ethers.utils.parseEther("25"); // 25 tokens per NFT

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy ERC-20 token
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(owner.address);
    await myToken.deployed();

    // Deploy NFT contract
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy(myToken.address, nftPrice, owner.address);
    await myNFT.deployed();
  });

  describe("Complete Workflow", function () {
    it("Should handle complete user journey from token distribution to NFT minting", async function () {
      // Step 1: Owner distributes tokens to users
      const tokensPerUser = ethers.utils.parseEther("100");
      await myToken.connect(owner).mint(user1.address, tokensPerUser);
      await myToken.connect(owner).mint(user2.address, tokensPerUser);
      await myToken.connect(owner).mint(user3.address, tokensPerUser);

      // Verify token distribution
      expect(await myToken.balanceOf(user1.address)).to.equal(tokensPerUser);
      expect(await myToken.balanceOf(user2.address)).to.equal(tokensPerUser);
      expect(await myToken.balanceOf(user3.address)).to.equal(tokensPerUser);

      // Step 2: Users approve NFT contract to spend their tokens
      await myToken.connect(user1).approve(myNFT.address, nftPrice);
      await myToken.connect(user2).approve(myNFT.address, nftPrice.mul(2));
      await myToken.connect(user3).approve(myNFT.address, nftPrice);

      // Step 3: Users mint NFTs
      await myNFT.connect(user1).mint(); // Token ID 1
      await myNFT.connect(user2).mint(); // Token ID 2
      await myNFT.connect(user2).mint(); // Token ID 3 (user2 mints again)
      await myNFT.connect(user3).mint(); // Token ID 4

      // Step 4: Verify NFT ownership
      expect(await myNFT.ownerOf(1)).to.equal(user1.address);
      expect(await myNFT.ownerOf(2)).to.equal(user2.address);
      expect(await myNFT.ownerOf(3)).to.equal(user2.address);
      expect(await myNFT.ownerOf(4)).to.equal(user3.address);

      // Step 5: Verify token balances after purchases
      expect(await myToken.balanceOf(user1.address)).to.equal(
        tokensPerUser.sub(nftPrice)
      );
      expect(await myToken.balanceOf(user2.address)).to.equal(
        tokensPerUser.sub(nftPrice.mul(2))
      );
      expect(await myToken.balanceOf(user3.address)).to.equal(
        tokensPerUser.sub(nftPrice)
      );

      // Step 6: Verify owner received payments
      const expectedOwnerBalance = nftPrice.mul(4); // 4 NFTs sold
      expect(await myToken.balanceOf(owner.address)).to.equal(expectedOwnerBalance);

      // Step 7: Verify NFT contract state
      expect(await myNFT.totalSupply()).to.equal(4);
      expect(await myNFT.getNextTokenId()).to.equal(5);
    });

    it("Should handle price changes affecting future purchases", async function () {
      // Initial setup
      await myToken.connect(owner).mint(user1.address, ethers.utils.parseEther("100"));
      await myToken.connect(owner).mint(user2.address, ethers.utils.parseEther("100"));

      // User1 mints at original price
      await myToken.connect(user1).approve(myNFT.address, nftPrice);
      await myNFT.connect(user1).mint();

      const user1BalanceAfterFirst = await myToken.balanceOf(user1.address);
      expect(user1BalanceAfterFirst).to.equal(
        ethers.utils.parseEther("100").sub(nftPrice)
      );

      // Owner changes price
      const newPrice = ethers.utils.parseEther("50");
      await myNFT.connect(owner).setPrice(newPrice);

      // User2 mints at new price
      await myToken.connect(user2).approve(myNFT.address, newPrice);
      await myNFT.connect(user2).mint();

      const user2BalanceAfter = await myToken.balanceOf(user2.address);
      expect(user2BalanceAfter).to.equal(
        ethers.utils.parseEther("100").sub(newPrice)
      );

      // Verify both NFTs exist
      expect(await myNFT.ownerOf(1)).to.equal(user1.address);
      expect(await myNFT.ownerOf(2)).to.equal(user2.address);
    });

    it("Should handle edge case: user with exact balance", async function () {
      // Give user exactly enough tokens for one NFT
      await myToken.connect(owner).mint(user1.address, nftPrice);
      
      expect(await myToken.balanceOf(user1.address)).to.equal(nftPrice);
      expect(await myNFT.hasBalance(user1.address)).to.be.true;

      // Approve and mint
      await myToken.connect(user1).approve(myNFT.address, nftPrice);
      await myNFT.connect(user1).mint();

      // User should have zero balance left
      expect(await myToken.balanceOf(user1.address)).to.equal(0);
      expect(await myNFT.ownerOf(1)).to.equal(user1.address);
      expect(await myNFT.hasBalance(user1.address)).to.be.false;
    });

    it("Should prevent minting without sufficient allowance", async function () {
      // Give user tokens but don't approve enough
      await myToken.connect(owner).mint(user1.address, ethers.utils.parseEther("100"));
      
      const insufficientAllowance = nftPrice.sub(1);
      await myToken.connect(user1).approve(myNFT.address, insufficientAllowance);
      
      expect(await myNFT.hasAllowance(user1.address)).to.be.false;
      
      await expect(
        myNFT.connect(user1).mint()
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("Multiple Users Scenario", function () {
    it("Should handle concurrent operations correctly", async function () {
      const userCount = 5;
      const users = [user1, user2, user3];
      const tokensPerUser = ethers.utils.parseEther("1000");

      // Distribute tokens to users
      for (let i = 0; i < users.length; i++) {
        await myToken.connect(owner).mint(users[i].address, tokensPerUser);
      }

      // Each user approves and mints multiple NFTs
      const nftsPerUser = 3;
      const totalApproval = nftPrice.mul(nftsPerUser);

      for (let i = 0; i < users.length; i++) {
        await myToken.connect(users[i]).approve(myNFT.address, totalApproval);
        
        for (let j = 0; j < nftsPerUser; j++) {
          await myNFT.connect(users[i]).mint();
        }
      }

      // Verify results
      const totalNFTs = users.length * nftsPerUser;
      expect(await myNFT.totalSupply()).to.equal(totalNFTs);

      // Verify each user owns the correct number of NFTs
      for (let i = 0; i < users.length; i++) {
        expect(await myNFT.balanceOf(users[i].address)).to.equal(nftsPerUser);
      }

      // Verify token balances
      const expectedRemainingBalance = tokensPerUser.sub(totalApproval);
      for (let i = 0; i < users.length; i++) {
        expect(await myToken.balanceOf(users[i].address)).to.equal(expectedRemainingBalance);
      }

      // Verify owner received all payments
      const totalRevenue = nftPrice.mul(totalNFTs);
      expect(await myToken.balanceOf(owner.address)).to.equal(totalRevenue);
    });
  });

  describe("Token URI Integration", function () {
    it("Should provide correct token URIs for multiple NFTs", async function () {
      const baseURI = "https://
