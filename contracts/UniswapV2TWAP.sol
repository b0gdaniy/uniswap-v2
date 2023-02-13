//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// UniswapV2
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/lib/contracts/libraries/FixedPoint.sol";
import "@uniswap/v2-periphery/contracts/libraries/UniswapV2OracleLibrary.sol";

import "./interfaces/IUniswapV2TWAP.sol";

contract UniswapV2TWAP is IUniswapV2TWAP {
    using FixedPoint for *;

    uint256 public constant PERIOD = 10;

    IUniswapV2Pair public immutable pair;
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;

    uint32 public blockTimestampLast;

    FixedPoint.uq112x112 public price0Average;
    FixedPoint.uq112x112 public price1Average;

    constructor(IUniswapV2Pair _pair) {
        pair = _pair;

        token0 = IERC20(_pair.token0());
        token1 = IERC20(_pair.token1());

        price0CumulativeLast = _pair.price0CumulativeLast();
        price1CumulativeLast = _pair.price1CumulativeLast();

        (, , blockTimestampLast) = _pair.getReserves();
    }

    function update() external {
        (
            uint256 price0Cumulative,
            uint256 price1Cumulative,
            uint32 blockTimestamp
        ) = UniswapV2OracleLibrary.currentCumulativePrices(address(pair));

        uint256 timeElapsed = blockTimestamp - blockTimestampLast;

        require(timeElapsed >= PERIOD, "Time elapsed < min PERIOD");

        price0Average = FixedPoint.uq112x112(
            uint224((price0Cumulative - price0CumulativeLast) / timeElapsed)
        );
        price1Average = FixedPoint.uq112x112(
            uint224((price1Cumulative - price1CumulativeLast) / timeElapsed)
        );

        price0CumulativeLast = price0Cumulative;
        price1CumulativeLast = price1Cumulative;
        blockTimestampLast = blockTimestamp;
    }

    function consult(IERC20 token, uint256 amountIn)
        external
        view
        returns (uint256 amountOut)
    {
        require(token == token0 || token == token1, "Incorrect token");

        if (token == token0) {
            amountOut = price0Average.mul(amountIn).decode144();
        } else {
            amountOut = price1Average.mul(amountIn).decode144();
        }
    }
}
