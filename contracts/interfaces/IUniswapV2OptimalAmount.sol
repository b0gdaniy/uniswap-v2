//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IUniswapV2.sol";

interface IUniswapV2OptimalAmount is IUniswapV2 {
    function optimalSwap(
        IERC20 _tokenA,
        IERC20 _tokenB,
        uint256 _amountA
    ) external;

    function nonOptimalSwap(
        IERC20 _tokenA,
        IERC20 _tokenB,
        uint256 _amountA
    ) external;

    /**
     * s = optimal swap amount
     * r = amount of reserve for a token a
     * a = amount of token a the user currently has (not added to reserve yet)
     * f = swap percent
     * s = (sqrt(((2 - f)r)^2 + 4(1 - f)ar) - (2 - f)r) / (2(1 - f))
     */
    function getSwapAmount(uint256 r, uint256 a)
        external
        pure
        returns (uint256);
}
