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
    event FlashSwap(address indexed sender, uint256 admount);

    /// @dev Calls the FlashSwap feature from IUniswapV2Callee
    /// @param _amountWeth amount of Weths that user needs borrow
    function flashSwap(uint256 _amountWeth) external;
}
