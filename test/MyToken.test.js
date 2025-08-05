const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let myToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the contract
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(owner.address);
    await myToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myToken.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await myToken.name()).to.equal("MyToken");
      expect(await myToken.symbol()).to.equal("MTK");
    });

    it("Should have 18 decimals", async function () {
      expect(await myToken.decimals()).to.equal(18);
    });

    it("Should start with zero total supply", async function () {
      expect(await myToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("100");
      
      await myToken.connect(owner).mint(addr1.address, mintAmount);
      
      expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await myToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should allow owner to mintAndTransfer tokens", async function () {
      const mintAmount = ethers.utils.parseEther("50");
      
      await myToken.connect(owner).mintAndTransfer(addr1.address, mintAmount);
      
      expect(await myToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await myToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("100");
      
      await expect(
        myToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow non-owner to mintAndTransfer tokens", async function () {
      const mintAmount = ethers.utils.parseEther("100");
      
      await expect(
        myToken.connect(addr1).mintAndTransfer(addr2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should emit Transfer event when minting", async function () {
      const mintAmount = ethers.utils.parseEther("100");
      
      await expect(myToken.connect(owner).mint(addr1.address, mintAmount))
        .to.emit(myToken, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, mintAmount);
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      // Mint some tokens to addr1 for transfer tests
      const mintAmount = ethers.utils.parseEther("100");
      await myToken.connect(owner).mint(addr1.address, mintAmount);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.utils.parseEther("50");
      
      await myToken.connect(addr1).transfer(addr2.address, transferAmount);
      
      expect(await myToken.balanceOf(addr1.address)).to.equal(
        ethers.utils.parseEther("50")
      );
      expect(await myToken.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const transferAmount = ethers.utils.parseEther("150");
      
      await expect(
        myToken.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should handle allowances correctly", async function () {
      const allowanceAmount = ethers.utils.parseEther("50");
      
      await myToken.connect(addr1).approve(addr2.address, allowanceAmount);
      
      expect(await myToken.allowance(addr1.address, addr2.address)).to.equal(
        allowanceAmount
      );
      
      // Transfer using allowance
      await myToken.connect(addr2).transferFrom(
        addr1.address, 
        addr2.address, 
        allowanceAmount
      );
      
      expect(await myToken.balanceOf(addr2.address)).to.equal(allowanceAmount);
      expect(await myToken.allowance(addr1.address, addr2.address)).to.equal(0);
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await myToken.connect(owner).transferOwnership(addr1.address);
      expect(await myToken.owner()).to.equal(addr1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(
        myToken.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
