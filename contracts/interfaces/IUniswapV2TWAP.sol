//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2TWAP {
    function update() external;

    function consult(IERC20 token, uint256 amountIn)
        external
        view
        returns (uint256 amountOut);
}
