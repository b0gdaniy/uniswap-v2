//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// OpenZepelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// UniswapV2
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";

interface IUniswapV2FlashSwap is IUniswapV2Callee {
    event FlashSwap(
        address indexed sender,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 admount1
    );

    function flashSwap(address _tokenBorrow, uint256 _amount) external;
}
