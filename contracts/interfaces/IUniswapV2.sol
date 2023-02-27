//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title An UniswapV2 interface
/// @author r0ugeEngine
/// @notice Swaps tokens and add liquidity
interface IUniswapV2 {
    event Swapped(
        address indexed from,
        IERC20 indexed tokenA,
        IERC20 indexed tokenB,
        uint256[] tokensReceied
    );
    event AddedTokensToLiquidity(
        address indexed from,
        IERC20 indexed tokenA,
        IERC20 indexed tokenB,
        uint256 amountA,
        uint256 amountB
    );
    event AddedLiquidity(address indexed to, uint256 amount);
    event RemovedTokensFromLiquidity(
        address indexed to,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB
    );
    event RemovedLiquidity(address indexed from, uint256 amount);

    /// @dev Swaps `_tokenIn` to `_tokenOut`
    /// @param _tokenIn token that user needs to swap
    /// @param _tokenOut token that user needs to get
    /// @param _to user that will receive the token
    /// @param _deadline deadline of swap period
    function swap(
        IERC20 _tokenIn,
        IERC20 _tokenOut,
        uint256 _amountIn,
        address _to,
        uint256 _deadline
    ) external;

    /// @dev Adds liquidity to token pair `_tokenA` and `_tokenB`
    /// @param _tokenA first token of pair
    /// @param _tokenB second token of pair
    ///@param _amountA amount of `_tokenA` that user need to add to LP
    ///@param _amountB amount of `_tokenB` that user need to add to LP
    /// @param _deadline deadline of swap period
    function addLiquidity(
        IERC20 _tokenA,
        IERC20 _tokenB,
        uint256 _amountA,
        uint256 _amountB,
        uint256 _deadline
    ) external;

    /// @dev Removes liquidity from token pair `_tokenA` and `_tokenB`
    /// @param _tokenA first token of pair
    /// @param _tokenB second token of pair
    function removeLiquidity(address _tokenA, address _tokenB) external;
}
