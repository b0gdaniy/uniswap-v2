//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// OpenZepelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// UniswapV2
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";

/// @title An UniswapV2 Flash Swap intrface
/// @author r0ugeEngine
/// @notice Get flash swaps for user
/// @dev Imported the Openzeppelin ERC20 interface, the UniswapV2 Calle interface implentations
interface IUniswapV2FlashSwap is IUniswapV2Callee {
    event FlashSwap(
        address indexed sender,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 admount1
    );

    /// @dev Calls the FlashSwap feature from IUniswapV2Callee
    /// @param _tokenBorrow token that user needs to borrow
    /// @param _amount amount of `_tokenBorrow` that user needs borrow
    function flashSwap(address _tokenBorrow, uint256 _amount) external;
}
