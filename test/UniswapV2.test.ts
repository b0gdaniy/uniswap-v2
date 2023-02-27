import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import {
  IERC20,
  IERC20__factory,
  IUniswapV2Factory__factory,
  UniswapV2OptimalAmount,
  IUniswapV2Factory,
  IUniswapV2Router02,
  IUniswapV2Router02__factory,
  UniswapV2,
  UniswapV2TWAP,
  IUniswapV2,
  IUniswapV2Pair,
  IUniswapV2Pair__factory,
  UniswapV2FlashSwap,
} from "../typechain-types";
import dotenv from "dotenv";
import { BigNumber } from "ethers";

dotenv.config();
const DAI_address: string = process.env.DAI!;
const USDC_address: string = process.env.USDC!;
const WETH_address: string = process.env.WETH!;

const DAI_whaleAddress: string = process.env.DAI_WHALE!;
const USDC_whaleAddress: string = process.env.USDC_WHALE!;

const UNISWAPV2_ROUTER_address: string = process.env.UNISWAPV2_ROUTER!;
const UNISWAPV2_FACTORY_address: string = process.env.UNISWAPV2_FACTORY!;
const UNISWAPV2_DAI_USDC_PAIR_address: string =
  process.env.UNISWAPV2_DAI_USDC_PAIR!;

const AMOUNT: BigNumber = ethers.constants.WeiPerEther;

describe("UniswapV2", function () {
  async function deployFixture() {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_whaleAddress],
    });
    const DAI_whale = await ethers.getSigner(DAI_whaleAddress);

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_whaleAddress],
    });
    //const DAI_whale = await ethers.getSigner(DAI_whaleAddress);

    const [otherAcc] = await ethers.getSigners();

    const UniswapV2 = await ethers.getContractFactory("UniswapV2", DAI_whale);
    const uniswapV2: UniswapV2 = await UniswapV2.deploy();
    await uniswapV2.deployed();

    const UniswapV2OptimalAmount = await ethers.getContractFactory(
      "UniswapV2OptimalAmount",
      DAI_whale
    );
    const uniswapV2OptimalAmount: UniswapV2OptimalAmount =
      await UniswapV2OptimalAmount.deploy();
    await uniswapV2OptimalAmount.deployed();

    const UniswapV2TWAP = await ethers.getContractFactory(
      "UniswapV2TWAP",
      DAI_whale
    );
    const uniswapV2TWAP: UniswapV2TWAP = await UniswapV2TWAP.deploy(
      UNISWAPV2_DAI_USDC_PAIR_address
    );
    await uniswapV2OptimalAmount.deployed();

    const uniswapv2Router: IUniswapV2Router02 =
      IUniswapV2Router02__factory.connect(UNISWAPV2_ROUTER_address, DAI_whale);

    const tokenIn: IERC20 = IERC20__factory.connect(DAI_address, DAI_whale);
    const tokenOut: IERC20 = IERC20__factory.connect(WETH_address, DAI_whale);
    const tokenUsdc: IERC20 = IERC20__factory.connect(USDC_address, DAI_whale);

    const uniswapV2factory: IUniswapV2Factory =
      IUniswapV2Factory__factory.connect(UNISWAPV2_FACTORY_address, otherAcc);
    const pairAddress = await uniswapV2factory.getPair(
      DAI_address,
      WETH_address
    );
    const pair: IERC20 = IERC20__factory.connect(pairAddress, otherAcc);

    const UniswapV2FlashSwap = await ethers.getContractFactory(
      "UniswapV2FlashSwap",
      DAI_whale
    );
    const uniswapV2FlashSwap: UniswapV2FlashSwap =
      await UniswapV2FlashSwap.deploy(DAI_address);
    await uniswapV2FlashSwap.deployed();

    return {
      uniswapV2,
      uniswapV2OptimalAmount,
      uniswapV2TWAP,
      uniswapv2Router,
      uniswapV2FlashSwap,
      uniswapV2factory,
      DAI_whale,
      otherAcc,
      tokenIn,
      tokenOut,
      tokenUsdc,
      pair,
    };
  }

  describe("Regular swap", async () => {
    it("Swap", async function () {
      const { uniswapV2, DAI_whale, otherAcc, tokenIn, tokenOut } =
        await loadFixture(deployFixture);

      const whaleDais = await tokenIn.balanceOf(DAI_whale.address);
      expect(await tokenOut.balanceOf(otherAcc.address)).to.be.eq(0);

      await tokenIn.approve(uniswapV2.address, whaleDais);
      await uniswapV2.swap(
        tokenIn.address,
        tokenOut.address,
        whaleDais,
        otherAcc.address,
        (await time.latest()) + 1000
      );

      expect(await tokenIn.balanceOf(DAI_whale.address)).to.be.eq(0);
      expect(await tokenOut.balanceOf(otherAcc.address)).to.be.greaterThan(0);
    });

    it("Adds/removes liquidity", async function () {
      const { uniswapV2, DAI_whale, otherAcc, tokenIn, tokenOut } =
        await loadFixture(deployFixture);

      let weths = await tokenIn.balanceOf(DAI_whale.address);
      let dais = await tokenOut.balanceOf(DAI_whale.address);

      await (await tokenIn.transfer(otherAcc.address, weths)).wait();
      await (await tokenOut.transfer(otherAcc.address, dais)).wait();

      dais = await tokenIn.balanceOf(otherAcc.address);
      weths = await tokenOut.balanceOf(otherAcc.address);

      await tokenIn
        .connect(otherAcc)
        .approve(uniswapV2.address, ethers.constants.MaxUint256);
      await tokenOut
        .connect(otherAcc)
        .approve(uniswapV2.address, ethers.constants.MaxUint256);
      const addLiquidity = await uniswapV2
        .connect(otherAcc)
        .addLiquidity(
          tokenIn.address,
          tokenOut.address,
          AMOUNT,
          AMOUNT,
          Date.now() + 1000
        );
      await addLiquidity.wait();

      const addedTokensEvent = (
        await uniswapV2.queryFilter(
          uniswapV2.filters.AddedTokensToLiquidity(),
          addLiquidity.blockHash
        )
      )[0];
      const amountA_1 = addedTokensEvent.args[3];
      const amountB_1 = addedTokensEvent.args[4];

      const addedLiqEvent = (
        await uniswapV2.queryFilter(
          uniswapV2.filters.AddedLiquidity(),
          addLiquidity.blockHash
        )
      )[0];
      const liq_1 = addedLiqEvent.args[1];

      expect(await tokenIn.balanceOf(otherAcc.address)).to.be.eq(
        dais.sub(amountA_1)
      );
      expect(await tokenOut.balanceOf(otherAcc.address)).to.be.eq(
        weths.sub(AMOUNT)
      );

      const removeLiquidity = await uniswapV2
        .connect(otherAcc)
        .removeLiquidity(tokenIn.address, tokenOut.address);
      await removeLiquidity.wait();

      const removedTokensEvent = (
        await uniswapV2.queryFilter(
          uniswapV2.filters.RemovedTokensFromLiquidity(),
          removeLiquidity.blockHash
        )
      )[0];
      const amountA_2 = removedTokensEvent.args[3];
      const amountB_2 = removedTokensEvent.args[4];

      const removedLiqEvent = (
        await uniswapV2.queryFilter(
          uniswapV2.filters.RemovedLiquidity(),
          removeLiquidity.blockHash
        )
      )[0];
      const liq_2 = removedLiqEvent.args[1];

      expect(await tokenIn.balanceOf(otherAcc.address)).to.be.eq(
        dais.sub(AMOUNT)
      );
      expect(await tokenOut.balanceOf(otherAcc.address)).to.be.eq(
        weths.sub(AMOUNT)
      );
    });
  });

  describe("Oprimal swap", async () => {
    it("Optimal swap", async function () {
      const { uniswapV2OptimalAmount, DAI_whale, tokenIn, tokenOut, pair } =
        await loadFixture(deployFixture);

      const whaleDais = await tokenIn.balanceOf(DAI_whale.address);
      const whaleWeths = await tokenOut.balanceOf(DAI_whale.address);

      await tokenIn.approve(uniswapV2OptimalAmount.address, whaleDais);
      await tokenOut.approve(uniswapV2OptimalAmount.address, whaleWeths);

      await uniswapV2OptimalAmount.optimalSwap(
        tokenIn.address,
        tokenOut.address,
        AMOUNT
      );

      const lp = await pair.balanceOf(uniswapV2OptimalAmount.address);
      const fromToken = await tokenIn.balanceOf(uniswapV2OptimalAmount.address);
      const toToken = await tokenOut.balanceOf(uniswapV2OptimalAmount.address);

      expect(fromToken).to.eq(BigNumber.from(0));
      expect(toToken).to.eq(BigNumber.from(0));

      expect(await tokenIn.balanceOf(DAI_whale.address)).to.be.eq(
        whaleDais.sub(AMOUNT)
      );
    });

    it("Optimal swap with another tokens", async function () {
      const { uniswapV2OptimalAmount, DAI_whale, tokenIn, tokenOut, pair } =
        await loadFixture(deployFixture);

      const whaleDais = await tokenIn.balanceOf(DAI_whale.address);
      const whaleWeths = await tokenOut.balanceOf(DAI_whale.address);

      await tokenIn.approve(uniswapV2OptimalAmount.address, whaleDais);
      await tokenOut.approve(uniswapV2OptimalAmount.address, whaleWeths);

      await uniswapV2OptimalAmount.optimalSwap(
        tokenOut.address,
        tokenIn.address,
        AMOUNT
      );

      const lp = await pair.balanceOf(uniswapV2OptimalAmount.address);
      const fromToken = await tokenIn.balanceOf(uniswapV2OptimalAmount.address);
      const toToken = await tokenOut.balanceOf(uniswapV2OptimalAmount.address);

      expect(fromToken).to.eq(BigNumber.from(0));
      expect(toToken).to.gt(BigNumber.from(0));

      expect(await tokenOut.balanceOf(DAI_whale.address)).to.be.eq(
        whaleWeths.sub(AMOUNT)
      );
    });

    it("Optimal swap can not swap withot WETH", async function () {
      const { uniswapV2OptimalAmount } =
        await loadFixture(deployFixture);

      await expect(uniswapV2OptimalAmount.optimalSwap(
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        AMOUNT
      )).to.be.revertedWith("One of tokens must be WETH");
    });

    it("Non optimal swap", async function () {
      const { uniswapV2OptimalAmount, DAI_whale, tokenIn, tokenOut, pair } =
        await loadFixture(deployFixture);

      const whaleDais = await tokenIn.balanceOf(DAI_whale.address);

      await tokenIn.approve(uniswapV2OptimalAmount.address, AMOUNT);
      await uniswapV2OptimalAmount.nonOptimalSwap(
        tokenIn.address,
        tokenOut.address,
        AMOUNT
      );

      const lp = await pair.balanceOf(uniswapV2OptimalAmount.address);
      const fromToken = await tokenIn.balanceOf(uniswapV2OptimalAmount.address);
      const toToken = await tokenOut.balanceOf(uniswapV2OptimalAmount.address);

      expect(fromToken).to.be.greaterThan(BigNumber.from(0));
      expect(toToken).to.be.eq(BigNumber.from(0));

      expect(await tokenIn.balanceOf(DAI_whale.address)).to.be.eq(
        whaleDais.sub(AMOUNT)
      );
    });
  });

  describe("Uniswap TWAP", async () => {
    it("Updated correctly", async function () {
      const {
        uniswapV2TWAP,
        uniswapv2Router,
        tokenIn,
        tokenOut,
        tokenUsdc,
        DAI_whale,
      } = await loadFixture(deployFixture);

      const now = await time.latest();

      const whaleDais = await tokenIn.balanceOf(DAI_whale.address);
      const whaleWeths = await tokenOut.balanceOf(DAI_whale.address);

      let tokenInConsult = await uniswapV2TWAP.consult(tokenIn.address, AMOUNT);
      let tokenUsdcConsult = await uniswapV2TWAP.consult(tokenUsdc.address, AMOUNT);

      await time.setNextBlockTimestamp(now + 2000);

      await (await uniswapV2TWAP.update()).wait();

      await tokenIn.approve(uniswapv2Router.address, whaleDais);
      await tokenOut.approve(uniswapv2Router.address, whaleWeths);

      await (
        await uniswapv2Router.swapExactTokensForETH(
          AMOUNT,
          1,
          [tokenIn.address, tokenOut.address],
          DAI_whaleAddress,
          BigNumber.from(now + 20000)
        )
      ).wait();

      await time.increase(20000);
      await (await uniswapV2TWAP.update()).wait();

      tokenInConsult = await uniswapV2TWAP.consult(tokenIn.address, AMOUNT);
      tokenUsdcConsult = await uniswapV2TWAP.consult(tokenUsdc.address, AMOUNT);

      expect(tokenInConsult).to.gt(1000000);
      expect(tokenUsdcConsult).to.gt(BigNumber.from("999000000000000000000000000000"));
    });

    it("Update errors work correclty", async function () {
      const {
        uniswapV2TWAP,
      } = await loadFixture(deployFixture);

      const now = await time.latest();

      await time.setNextBlockTimestamp(now + 2000);

      await (await uniswapV2TWAP.update()).wait();

      await expect(uniswapV2TWAP.update()).to.be.revertedWith("Time elapsed < min PERIOD");
    });

    it("Consult correctly", async function () {
      const {
        uniswapV2TWAP,
      } = await loadFixture(deployFixture);

      await expect(uniswapV2TWAP.consult(ethers.constants.AddressZero, 0)).to.be.revertedWith("Incorrect token");
    });
  });

  describe("Uniswap Flash Swap", async () => {
    it("Take flash swaps correctly", async function () {
      const {
        uniswapV2FlashSwap,
        uniswapV2factory,
        DAI_whale,
        tokenIn,
        tokenOut,
      } = await loadFixture(deployFixture);

      const whaleDais = await tokenIn.balanceOf(DAI_whale.address);
      const whaleWeths = await tokenOut.balanceOf(DAI_whale.address);
      await tokenIn.approve(uniswapV2FlashSwap.address, whaleDais);
      await tokenOut.approve(uniswapV2FlashSwap.address, whaleWeths);

      const pair = await uniswapV2factory.getPair(tokenIn.address, tokenOut.address);

      const borrowAmount = ethers.utils.parseEther("1");

      expect(
        await uniswapV2FlashSwap.flashSwap(borrowAmount)
      ).to.changeTokenBalance(tokenIn, pair, borrowAmount);
    });

    it("Flash swaps uniswapV2Call handler", async function () {
      const { uniswapV2FlashSwap, DAI_whale } =
        await loadFixture(deployFixture);

      await expect(
        uniswapV2FlashSwap.uniswapV2Call(DAI_whale.address, 0, 0, "0x00")
      ).to.be.revertedWith("Only UniswapV2FlashSwap!");

      await expect(
        uniswapV2FlashSwap.uniswapV2Call(
          uniswapV2FlashSwap.address,
          0,
          0,
          "0x00"
        )
      ).to.be.revertedWith("Only UniswapV2Pair!");

      await expect(
        uniswapV2FlashSwap.flashSwap(0)
      ).to.be.revertedWith("Amount == 0!");
    });

    it("Can not deploy with address(0)", async function () {
      const { DAI_whale } =
        await loadFixture(deployFixture);

      const UniswapV2FlashSwap = await ethers.getContractFactory(
        "UniswapV2FlashSwap",
        DAI_whale
      );
      await expect(
        UniswapV2FlashSwap.deploy(ethers.constants.AddressZero)).to.be.revertedWith("Invalid pair!");
    });

    it("Can not use pair instead of WETH", async function () {
      const {
        uniswapV2FlashSwap,
        uniswapV2factory,
        DAI_whale,
        tokenIn,
        tokenOut,
      } = await loadFixture(deployFixture);

      const whaleDais = await tokenIn.balanceOf(DAI_whale.address);
      const whaleWeths = await tokenOut.balanceOf(DAI_whale.address);

      await (await tokenIn.transfer(uniswapV2FlashSwap.address, whaleDais)).wait();
      await (await tokenOut.transfer(uniswapV2FlashSwap.address, whaleWeths)).wait();

      const pairAddress = await uniswapV2factory.getPair(tokenIn.address, tokenOut.address);
      const pair: IUniswapV2Pair = await ethers.getContractAt("IUniswapV2Pair", pairAddress);

      const borrowAmount = ethers.utils.parseEther("1");

      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [uniswapV2FlashSwap.address],

      });
      await hre.network.provider.send("hardhat_setBalance", [
        uniswapV2FlashSwap.address,
        "0x3635C9ADC5DEA00000",
      ]);
      const flashSwap = await ethers.getSigner(uniswapV2FlashSwap.address);

      await tokenIn.approve(uniswapV2FlashSwap.address, whaleDais);
      await tokenOut.approve(uniswapV2FlashSwap.address, whaleWeths);


      const data = ethers.utils.defaultAbiCoder.encode(
        ['address', 'address'], [ethers.constants.AddressZero, ethers.constants.AddressZero]);

      await expect(pair.connect(flashSwap).swap(0, borrowAmount, uniswapV2FlashSwap.address, data)).to.be.revertedWith("Only WETH to borrow");
    });
  });
});