//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IUniswapV2.sol";

/// @title An UniswapV2 Optimal Amount contract
/// @author r0ugeEngine
/// @notice Optimized swaps for full exchange of tokens
/// @dev Inherits the UniswapV2 interface implementation
/// @dev the Openzeppelin ERC20 interface implentation
interface IUniswapV2OptimalAmount is IUniswapV2 {
    /// @dev Calculate the optimal amount of swap
    /// @param _tokenA token that user needs to swap
    /// @param _tokenB token that user needs to get
    /// @param _amountA amount of `_tokenA` that user needs to swap
    function optimalSwap(
        IERC20 _tokenA,
        IERC20 _tokenB,
        uint256 _amountA
    ) external;

    /// @dev Without calculating the optimal amount of swap
    /// @param _tokenA token that user needs to swap
    /// @param _tokenB token that user needs to get
    /// @param _amountA amount of `_tokenA` that user needs to swap
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
