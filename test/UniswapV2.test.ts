import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { IERC20, IERC20__factory, IUniswapV2Factory__factory, IUniswapV2Router02, IUniswapV2Router02__factory, UniswapV2 } from "../typechain-types";
import dotenv from "dotenv";
import { format } from "path";
import { BigNumber } from "ethers";
import { Address } from "cluster";
import { IUniswapV2Factory } from "../typechain-types/contracts/interfaces/IUniswapv2Factory.sol";

dotenv.config();
const DAI_address: string = process.env.DAI!;
const WETH_address: string = process.env.WETH!;
const DAI_whaleAddress: string = process.env.DAI_WHALE!;
const WETH_whaleAddress: string = process.env.WETH_WHALE!;

const UNISWAPV2_ROUTER_address: string = process.env.UNISWAPV2_ROUTER!;
const UNISWAPV2_FACTORY_address: string = process.env.UNISWAPV2_FACTORY!;

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
      params: [WETH_whaleAddress],
    });
    const WETH_whale = await ethers.getSigner(DAI_whaleAddress);

    const [otherAcc] = await ethers.getSigners();

    const UniswapV2 = await ethers.getContractFactory("UniswapV2", DAI_whale);
    const uniswapV2: UniswapV2 = await UniswapV2.deploy();
    await uniswapV2.deployed();

    const UniswapV2OptimalAmount = await ethers.getContractFactory("UniswapV2OptimalAmount", DAI_whale);
    const uniswapV2OptimalAmount: UniswapV2OptimalAmount = await UniswapV2OptimalAmount.deploy();
    await uniswapV2OptimalAmount.deployed();

    const tokenIn: IERC20 = IERC20__factory.connect(DAI_address, DAI_whale);
    const tokenOut: IERC20 = IERC20__factory.connect(WETH_address, WETH_whale);

    const tokenA: IERC20 = IERC20__factory.connect(DAI_address, DAI_whale);
    const tokenB: IERC20 = IERC20__factory.connect(WETH_address, WETH_whale);

    const factory: IUniswapV2Factory = IUniswapV2Factory__factory.connect(UNISWAPV2_FACTORY_address, otherAcc);
    const pairAddress = await factory.getPair(DAI_address, WETH_address);
    const pair: IERC20 = IERC20__factory.connect(pairAddress, otherAcc);

    return { uniswapV2, uniswapV2OptimalAmount, DAI_whale, WETH_whale, otherAcc, tokenIn, tokenOut, tokenA, tokenB, pair };
  }

  it("Swap", async function () {
    const { uniswapV2, DAI_whale, otherAcc, tokenIn, tokenOut } = await loadFixture(deployFixture);

    const whaleDais = await tokenIn.balanceOf(DAI_whale.address);
    expect(await tokenOut.balanceOf(otherAcc.address)).to.be.eq(0);

    await tokenIn.approve(uniswapV2.address, whaleDais);
    await uniswapV2.swap(tokenIn.address, tokenOut.address, whaleDais, otherAcc.address, (Date.now()) + 1000);

    expect(await tokenIn.balanceOf(DAI_whale.address)).to.be.eq(0);
    expect(await tokenOut.balanceOf(otherAcc.address)).to.be.greaterThan(0);
  });

  it("Adds/removes liquidity", async function () {
    const { uniswapV2, DAI_whale, WETH_whale, otherAcc, tokenA, tokenB } = await loadFixture(deployFixture);

    await (await tokenA.transfer(otherAcc.address, await tokenA.balanceOf(DAI_whale.address))).wait();
    await (await tokenB.transfer(otherAcc.address, await tokenB.balanceOf(WETH_whale.address))).wait();

    const dais = await tokenA.balanceOf(otherAcc.address);
    const weths = await tokenB.balanceOf(otherAcc.address);

    await tokenA.connect(otherAcc).approve(uniswapV2.address, AMOUNT);
    await tokenB.connect(otherAcc).approve(uniswapV2.address, AMOUNT);
    const addLiquidity = await uniswapV2.connect(otherAcc).addLiquidity(tokenA.address, tokenB.address, AMOUNT, AMOUNT, (Date.now()) + 1000);
    await addLiquidity.wait();

    const addedTokensEvent = (await uniswapV2.queryFilter(
      uniswapV2.filters.AddedTokensToLiquidity(),
      addLiquidity.blockHash,
    ))[0];
    const amountA_1 = addedTokensEvent.args[3];
    const amountB_1 = addedTokensEvent.args[4];

    const addedLiqEvent = (await uniswapV2.queryFilter(
      uniswapV2.filters.AddedLiquidity(),
      addLiquidity.blockHash,
    ))[0];
    const liq_1 = addedLiqEvent.args[1];

    expect(await tokenA.balanceOf(otherAcc.address)).to.be.eq(dais.sub(amountA_1));
    expect(await tokenB.balanceOf(otherAcc.address)).to.be.eq(weths.sub(AMOUNT));

    const removeLiquidity = await uniswapV2.connect(otherAcc).removeLiquidity(tokenA.address, tokenB.address);
    await removeLiquidity.wait();

    const removedTokensEvent = (await uniswapV2.queryFilter(
      uniswapV2.filters.RemovedTokensFromLiquidity(),
      removeLiquidity.blockHash,
    ))[0];
    const amountA_2 = removedTokensEvent.args[3];
    const amountB_2 = removedTokensEvent.args[4];

    const removedLiqEvent = (await uniswapV2.queryFilter(
      uniswapV2.filters.RemovedLiquidity(),
      removeLiquidity.blockHash,
    ))[0];
    const liq_2 = removedLiqEvent.args[1];

    expect(await tokenA.balanceOf(otherAcc.address)).to.be.eq(dais.sub(AMOUNT));
    expect(await tokenB.balanceOf(otherAcc.address)).to.be.eq(weths.sub(AMOUNT));
  });

  it("Optimal swap", async function () {
    const { uniswapV2OptimalAmount, DAI_whale, otherAcc, tokenIn, tokenOut, pair } = await loadFixture(deployFixture);

    const whaleDais = await tokenIn.balanceOf(DAI_whale.address);

    await tokenIn.approve(uniswapV2OptimalAmount.address, AMOUNT);

    await uniswapV2OptimalAmount.optimalSwap(tokenIn.address, tokenOut.address, AMOUNT);

    const lp = await pair.balanceOf(uniswapV2OptimalAmount.address);
    const fromToken = await tokenIn.balanceOf(uniswapV2OptimalAmount.address);
    const toToken = await tokenOut.balanceOf(uniswapV2OptimalAmount.address);

    console.log(lp, " ", fromToken, " ", toToken);

    expect(fromToken).to.eq(BigNumber.from(0));
    expect(toToken).to.eq(BigNumber.from(0));

    expect(await tokenIn.balanceOf(DAI_whale.address)).to.be.eq(0);
    expect(await tokenOut.balanceOf(otherAcc.address)).to.be.greaterThan(0);
  });

  it("Non optimal swap", async function () {
    const { uniswapV2OptimalAmount, DAI_whale, otherAcc, tokenIn, tokenOut, pair } = await loadFixture(deployFixture);

    const whaleDais = await tokenIn.balanceOf(DAI_whale.address);

    await tokenIn.approve(uniswapV2OptimalAmount.address, AMOUNT);
    await uniswapV2OptimalAmount.nonOptimalSwap(tokenIn.address, tokenOut.address, AMOUNT);

    const lp = await pair.balanceOf(uniswapV2OptimalAmount.address);
    const fromToken = await tokenIn.balanceOf(uniswapV2OptimalAmount.address);
    const toToken = await tokenOut.balanceOf(uniswapV2OptimalAmount.address);

    console.log(lp, " ", fromToken, " ", toToken);

    expect(fromToken).to.be.greaterThan(BigNumber.from(0));
    expect(toToken).to.be.eq(BigNumber.from(0));

    expect(await tokenIn.balanceOf(DAI_whale.address)).to.be.eq(whaleDais.sub(AMOUNT));
    expect(await tokenOut.balanceOf(otherAcc.address)).to.be.eq(BigNumber.from(0));
  });
});