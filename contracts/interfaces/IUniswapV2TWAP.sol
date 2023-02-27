//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title An UniswapV2 TWAP interface
/// @author r0ugeEngine
/// @notice TWAP(time-weighted average price) is an oracle that can get
/// @dev Imported the Openzeppelin ERC20 interface implentation
interface IUniswapV2TWAP {
    /// @dev Updates the current price for token pair that pasted to constructor
    function update() external;

    /// @dev Consult for `token` what `amountOut` can be taken
    ///@param token token that user needs to swap
    ///@param amountIn amount that user needs to calculate amountOut
    ///@return amountOut calculated amount that user needs to get
    function consult(IERC20 token, uint256 amountIn)
        external
        view
        returns (uint256 amountOut);
}
