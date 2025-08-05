const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  let myToken;
  let myNFT;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  const initialPrice = ethers.utils.parseEther("10"); // 10 tokens

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the ERC-20 token first
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(owner.address);
    await myToken.deployed();

    // Deploy the NFT contract
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy(myToken.address, initialPrice, owner.address);
    await myNFT.deployed();

    // Mint some tokens to users for testing
    await myToken.connect(owner).mint(addr1.address, ethers.utils.parseEther("100"));
    await myToken.connect(owner).mint(addr2.address, ethers.utils.parseEther("100"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("MNFT");
    });

    it("Should set the correct payment token", async function () {
      expect(await myNFT.paymentToken()).to.equal(myToken.address);
    });

    it("Should set the correct initial price", async function () {
      expect(await myNFT.price()).to.equal(initialPrice);
    });

    it("Should start with token counter at 1", async function () {
      expect(await myNFT.getNextTokenId()).to.equal(1);
    });

    it("Should start with zero total supply", async function () {
      expect(await myNFT.totalSupply()).to.equal(0);
    });

    it("Should revert if token address is zero", async function () {
      const MyNFT = await ethers.getContractFactory("MyNFT");
      await expect(
        MyNFT.deploy(ethers.constants.AddressZero, initialPrice, owner.address)
      ).to.be.revertedWith("Token address cannot be zero");
    });

    it("Should revert if price is zero", async function () {
      const MyNFT = await ethers.getContractFactory("MyNFT");
      await expect(
        MyNFT.deploy(myToken.address, 0, owner.address)
      ).to.be.revertedWith("Price must be greater than zero");
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      // Approve NFT contract to spend tokens
      await myToken.connect(addr1).approve(myNFT.address, initialPrice);
    });

    it("Should allow user to mint NFT with correct payment", async function () {
      const initialBalance = await myToken.balanceOf(addr1.address);
      const ownerInitialBalance = await myToken.balanceOf(owner.address);

      await myNFT.connect(addr1).mint();

      expect(await myNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await myNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await myNFT.totalSupply()).to.equal(1);
      expect(await myNFT.getNextTokenId()).to.equal(2);
      
      // Check token transfer
      expect(await myToken.balanceOf(addr1.address)).to.equal(
        initialBalance.sub(initialPrice)
      );
      expect(await myToken.balanceOf(owner.address)).to.equal(
        ownerInitialBalance.add(initialPrice)
      );
    });

    it("Should emit NFTMinted event", async function () {
      await expect(myNFT.connect(addr1).mint())
        .to.emit(myNFT, "NFTMinted")
        .withArgs(addr1.address, 1, initialPrice);
    });

    it("Should fail if user hasn't approved tokens", async function () {
      await expect(
        myNFT.connect(addr2).mint()
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should fail if user doesn't have enough tokens", async function () {
      // Give addr2 very few tokens
      const userBalance = await myToken.balanceOf(addr2.address);
      await myToken.connect(addr2).transfer(owner.address, userBalance);
      
      await myToken.connect(addr2).approve(myNFT.address, initialPrice);
      
      await expect(
        myNFT.connect(addr2).mint()
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should allow multiple users to mint NFTs", async function () {
      await myToken.connect(addr2).approve(myNFT.address, initialPrice);

      await myNFT.connect(addr1).mint();
      await myNFT.connect(addr2).mint();

      expect(await myNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await myNFT.ownerOf(2)).to.equal(addr2.address);
      expect(await myNFT.totalSupply()).to.equal(2);
    });

    it("Should increment token IDs correctly", async function () {
      await myToken.connect(addr2).approve(myNFT.address, initialPrice.mul(2));

      await myNFT.connect(addr1).mint();
      expect(await myNFT.getNextTokenId()).to.equal(2);

      await myNFT.connect(addr2).mint();
      expect(await myNFT.getNextTokenId()).to.equal(3);
    });
  });

  describe("Price Management", function () {
    it("Should allow owner to change price", async function () {
      const newPrice = ethers.utils.parseEther("20");
      
      await expect(myNFT.connect(owner).setPrice(newPrice))
        .to.emit(myNFT, "PriceUpdated")
        .withArgs(initialPrice, newPrice);
      
      expect(await myNFT.price()).to.equal(newPrice);
    });

    it("Should not allow non-owner to change price", async function () {
      const newPrice = ethers.utils.parseEther("20");
      
      await expect(
        myNFT.connect(addr1).setPrice(newPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow setting price to zero", async function () {
      await expect(
        myNFT.connect(owner).setPrice(0)
      ).to.be.revertedWith("Price must be greater than zero");
    });

    it("Should use new price for subsequent mints", async function () {
      const newPrice = ethers.utils.parseEther("20");
      await myNFT.connect(owner).setPrice(newPrice);
      
      await myToken.connect(addr1).approve(myNFT.address, newPrice);
      
      const initialBalance = await myToken.balanceOf(addr1.address);
      await myNFT.connect(addr1).mint();
      
      expect(await myToken.balanceOf(addr1.address)).to.equal(
        initialBalance.sub(newPrice)
      );
    });
  });

  describe("Token URI", function () {
    beforeEach(async function () {
      await myToken.connect(addr1).approve(myNFT.address, initialPrice);
      await myNFT.connect(addr1).mint();
    });

    it("Should return empty string for tokenURI without base URI", async function () {
      expect(await myNFT.tokenURI(1)).to.equal("");
    });

    it("Should return correct tokenURI with base URI", async function () {
      const baseURI = "https://api.example.com/metadata/";
      await myNFT.connect(owner).setBaseURI(baseURI);
      
      expect(await myNFT.tokenURI(1)).to.equal(baseURI + "1.json");
    });

    it("Should revert for non-existent token", async function () {
      await expect(
        myNFT.tokenURI(999)
      ).to.be.revertedWith("Token does not exist");
    });

    it("Should only allow owner to set base URI", async function () {
      await expect(
        myNFT.connect(addr1).setBaseURI("https://example.com/")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Utility Functions", function () {
    it("Should correctly check user allowance", async function () {
      expect(await myNFT.hasAllowance(addr1.address)).to.be.false;
      
      await myToken.connect(addr1).approve(myNFT.address, initialPrice);
      expect(await myNFT.hasAllowance(addr1.address)).to.be.true;
    });

    it("Should correctly check user balance", async function () {
      expect(await myNFT.hasBalance(addr1.address)).to.be.true;
      
      // Transfer away all tokens
      const balance = await myToken.balanceOf(addr1.address);
      await myToken.connect(addr1).transfer(owner.address, balance);
      
      expect(await myNFT.hasBalance(addr1.address)).to.be.false;
    });
  });

  describe("Owner Rights", function () {
    it("Should not allow owner to mint NFTs without payment", async function () {
      // Owner should not have special minting privileges
      await expect(
        myNFT.connect(owner).mint()
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should require owner to pay like any other user", async function () {
      // Give owner some tokens and test normal flow
      await myToken.connect(owner).mint(owner.address, ethers.utils.parseEther("100"));
      await myToken.connect(owner).approve(myNFT.address, initialPrice);
      
      const initialBalance = await myToken.balanceOf(owner.address);
      await myNFT.connect(owner).mint();
      
      expect(await myNFT.ownerOf(1)).to.equal(owner.address);
      // Owner paid to themselves, so balance should remain the same
      expect(await myToken.balanceOf(owner.address)).to.equal(initialBalance);
    });

    it("Should allow owner to transfer ownership", async function () {
      await myNFT.connect(owner).transferOwnership(addr1.address);
      expect(await myNFT.owner()).to.equal(addr1.address);
    });
  });

  describe("ERC-721 Standard Functions", function () {
    beforeEach(async function () {
      await myToken.connect(addr1).approve(myNFT.address, initialPrice);
      await myNFT.connect(addr1).mint();
    });

    it("Should support ERC-721 interface", async function () {
      expect(await myNFT.supportsInterface("0x80ac58cd")).to.be.true; // ERC-721
    });

    it("Should allow token transfers", async function () {
      await myNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await myNFT.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should handle approvals correctly", async function () {
      await myNFT.connect(addr1).approve(addr2.address, 1);
      expect(await myNFT.getApproved(1)).to.equal(addr2.address);
      
      await myNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      expect(await myNFT.ownerOf(1)).to.equal(addr2.address);
    });
  });
});
