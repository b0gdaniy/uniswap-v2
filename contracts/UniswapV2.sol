//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

import "./interfaces/IUniswapV2.sol";

//import "./interfaces/IUniswapV2Router.sol";
//import "./interfaces/IUniswapV2Factory.sol";

contract UniswapV2 is IUniswapV2 {
    IUniswapV2Factory internal constant UNISWAP_V2_FACTORY =
        IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);
    IUniswapV2Router02 internal constant UNISWAP_V2_ROUTER =
        IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

    function swap(
        IERC20 _tokenIn,
        IERC20 _tokenOut,
        uint256 _amountIn,
        address _to,
        uint256 _deadline
    ) external {
        _swap(_tokenIn, _tokenOut, _amountIn, _to, _deadline);
    }

    function addLiquidity(
        IERC20 _tokenA,
        IERC20 _tokenB,
        uint256 _amountA,
        uint256 _amountB,
        uint256 _deadline
    ) external {
        _addLiquidity(_tokenA, _tokenB, _amountA, _amountB, _deadline);
    }

    function removeLiquidity(address _tokenA, address _tokenB) external {
        _removeLiquidity(_tokenA, _tokenB);
    }

    function _swap(
        IERC20 _tokenIn,
        IERC20 _tokenOut,
        uint256 _amount
    ) internal {
        _tokenIn.approve(address(UNISWAP_V2_ROUTER), _amount);

        address[] memory path = new address[](2);
        path[0] = address(_tokenIn);
        path[1] = address(_tokenOut);

        uint256[] memory amountsReceived = UNISWAP_V2_ROUTER
            .swapExactTokensForTokens(
                _amount,
                1,
                path,
                address(this),
                block.timestamp
            );

        emit Swapped(msg.sender, _tokenIn, _tokenOut, amountsReceived);
    }

    function _swap(
        IERC20 _tokenIn,
        IERC20 _tokenOut,
        uint256 _amountIn,
        address _to,
        uint256 _deadline
    ) internal {
        _tokenIn.transferFrom(msg.sender, address(this), _amountIn);

        _tokenIn.approve(address(UNISWAP_V2_ROUTER), _amountIn);

        address[] memory path = new address[](2);
        path[0] = address(_tokenIn);
        path[1] = address(_tokenOut);

        uint256[] memory amountsExpected = UNISWAP_V2_ROUTER.getAmountsOut(
            _amountIn,
            path
        );

        uint256[] memory amountsReceived = UNISWAP_V2_ROUTER
            .swapExactTokensForTokens(
                amountsExpected[0],
                (amountsExpected[1] * 990) / 1000,
                path,
                _to,
                _deadline
            );

        emit Swapped(msg.sender, _tokenIn, _tokenOut, amountsReceived);
    }

    function _addLiquidity(IERC20 _tokenA, IERC20 _tokenB) internal {
        uint256 balA = _tokenA.balanceOf(address(this));
        uint256 balB = _tokenB.balanceOf(address(this));

        _tokenA.approve(address(UNISWAP_V2_ROUTER), balA);
        _tokenB.approve(address(UNISWAP_V2_ROUTER), balB);

        (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        ) = UNISWAP_V2_ROUTER.addLiquidity(
                address(_tokenA),
                address(_tokenB),
                balA,
                balB,
                0,
                0,
                address(this),
                block.timestamp
            );

        emit AddedTokensToLiquidity(
            msg.sender,
            _tokenA,
            _tokenB,
            amountA,
            amountB
        );
        emit AddedLiquidity(msg.sender, liquidity);
    }

    function _addLiquidity(
        IERC20 _tokenA,
        IERC20 _tokenB,
        uint256 _amountA,
        uint256 _amountB,
        uint256 _deadline
    ) internal {
        _tokenA.transferFrom(msg.sender, address(this), _amountA);
        _tokenB.transferFrom(msg.sender, address(this), _amountB);

        _tokenA.approve(address(UNISWAP_V2_ROUTER), _amountA);
        _tokenB.approve(address(UNISWAP_V2_ROUTER), _amountB);

        (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        ) = UNISWAP_V2_ROUTER.addLiquidity(
                address(_tokenA),
                address(_tokenB),
                _amountA,
                _amountB,
                1,
                1,
                address(this),
                _deadline
            );

        emit AddedTokensToLiquidity(
            msg.sender,
            _tokenA,
            _tokenB,
            amountA,
            amountB
        );
        emit AddedLiquidity(msg.sender, liquidity);
    }

    function _removeLiquidity(address _tokenA, address _tokenB) internal {
        address pair = UNISWAP_V2_FACTORY.getPair(_tokenA, _tokenB);

        uint256 liquidity = IERC20(pair).balanceOf(address(this));

        IERC20(pair).approve(address(UNISWAP_V2_ROUTER), liquidity);

        (uint256 amountA, uint256 amountB) = UNISWAP_V2_ROUTER.removeLiquidity(
            _tokenA,
            _tokenB,
            liquidity,
            1,
            1,
            address(this),
            block.timestamp
        );

        emit RemovedTokensFromLiquidity(
            msg.sender,
            _tokenA,
            _tokenB,
            amountA,
            amountB
        );
        emit RemovedLiquidity(msg.sender, liquidity);
    }
}
