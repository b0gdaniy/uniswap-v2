//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// OpenZepelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// UniswapV2
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

import "./interfaces/IUniswapV2FlashSwap.sol";

/// @title An UniswapV2 Flash Swap contract
/// @author r0ugeEngine
/// @notice Get flash swaps for user
/// @dev Inherits the UniswapV2 Calle interface implementation
/// @dev Imported the Openzeppelin ERC20 interface, the UniswapV2 Factory and Pair interfaces implentations
contract UniswapV2FlashSwap is IUniswapV2FlashSwap {
    ///@notice Uniswap V2 Factory address
    IUniswapV2Factory internal constant UNISWAP_V2_FACTORY =
        IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);
    ///@notice WETH token address
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    ///@notice Address of tokens pair
    address private immutable pair;

    constructor(address token) {
        pair = UNISWAP_V2_FACTORY.getPair(token, WETH);
        require(pair != address(0), "Invalid pair!");
    }

    /// @dev Calls the FlashSwap feature from IUniswapV2Callee
    /// @param _amountWeth amount of Weths that user needs borrow
    function flashSwap(uint256 _amountWeth) external {
        require(_amountWeth > 0, "Amount == 0!");

        bytes memory data = abi.encode(WETH, msg.sender);

        IUniswapV2Pair(pair).swap(0, _amountWeth, address(this), data);

        emit FlashSwap(msg.sender, _amountWeth);
    }

    /// @dev Can be called from IUniswapV2Pair to calculate borrow amount
    /// @param sender this address
    /// @param data that encoded in {flashSwap}
    function uniswapV2Call(
        address sender,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external {
        require(sender == address(this), "Only UniswapV2FlashSwap!");
        require(msg.sender == pair, "Only UniswapV2Pair!");

        (address tokenBorrow, address caller) = abi.decode(
            data,
            (address, address)
        );

        require(tokenBorrow == WETH, "Only WETH to borrow");

        // fees = 0.3%
        uint256 fee = (amount1 * 3) / 997 + 1;
        uint256 amountToRepay = amount1 + fee;

        IERC20(tokenBorrow).transferFrom(caller, address(this), fee);

        IERC20(tokenBorrow).transfer(pair, amountToRepay);
    }
}
