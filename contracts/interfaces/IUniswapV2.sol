//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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

    function swap(
        IERC20 _tokenIn,
        IERC20 _tokenOut,
        uint256 _amountIn,
        address _to,
        uint256 _deadline
    ) external;

    function addLiquidity(
        IERC20 _tokenA,
        IERC20 _tokenB,
        uint256 _amountA,
        uint256 _amountB,
        uint256 _deadline
    ) external;

    function removeLiquidity(address _tokenA, address _tokenB) external;
}
