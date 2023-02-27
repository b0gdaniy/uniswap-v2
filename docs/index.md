# Solidity API

## UniswapV2

Swaps tokens and add liquidity

_Imported the UniswapV2 Router and Factory interfaces implentations_

### UNISWAP_V2_FACTORY

```solidity
contract IUniswapV2Factory UNISWAP_V2_FACTORY
```

Uniswap V2 Factory address

### UNISWAP_V2_ROUTER

```solidity
contract IUniswapV2Router02 UNISWAP_V2_ROUTER
```

Uniswap V2 Router 02 address

### swap

```solidity
function swap(contract IERC20 _tokenIn, contract IERC20 _tokenOut, uint256 _amountIn, address _to, uint256 _deadline) external
```

_Swaps `_tokenIn` to `_tokenOut`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenIn | contract IERC20 | token that user needs to swap |
| _tokenOut | contract IERC20 | token that user needs to get |
| _amountIn | uint256 | amount of tokenIn |
| _to | address | user that will receive the token |
| _deadline | uint256 | deadline of swap period |

### addLiquidity

```solidity
function addLiquidity(contract IERC20 _tokenA, contract IERC20 _tokenB, uint256 _amountA, uint256 _amountB, uint256 _deadline) external
```

_Adds liquidity to token pair `_tokenA` and `_tokenB`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenA | contract IERC20 | first token of pair |
| _tokenB | contract IERC20 | second token of pair |
| _amountA | uint256 | amount of `_tokenA` that user need to add to LP |
| _amountB | uint256 | amount of `_tokenB` that user need to add to LP |
| _deadline | uint256 | deadline of swap period |

### removeLiquidity

```solidity
function removeLiquidity(address _tokenA, address _tokenB) external
```

_Removes liquidity from token pair `_tokenA` and `_tokenB`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenA | address | first token of pair |
| _tokenB | address | second token of pair |

### _swap

```solidity
function _swap(contract IERC20 _tokenIn, contract IERC20 _tokenOut, uint256 _amount) internal
```

### _swap

```solidity
function _swap(contract IERC20 _tokenIn, contract IERC20 _tokenOut, uint256 _amountIn, address _to, uint256 _deadline) internal
```

### _addLiquidity

```solidity
function _addLiquidity(contract IERC20 _tokenA, contract IERC20 _tokenB) internal
```

### _addLiquidity

```solidity
function _addLiquidity(contract IERC20 _tokenA, contract IERC20 _tokenB, uint256 _amountA, uint256 _amountB, uint256 _deadline) internal
```

### _removeLiquidity

```solidity
function _removeLiquidity(address _tokenA, address _tokenB) internal
```

## UniswapV2FlashSwap

Get flash swaps for user

_Inherits the UniswapV2 Calle interface implementation
Imported the Openzeppelin ERC20 interface, the UniswapV2 Factory and Pair interfaces implentations_

### UNISWAP_V2_FACTORY

```solidity
contract IUniswapV2Factory UNISWAP_V2_FACTORY
```

Uniswap V2 Factory address

### flashSwap

```solidity
function flashSwap(address _tokenBorrow, uint256 _amount) external
```

_Calls the FlashSwap feature from IUniswapV2Callee_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenBorrow | address | token that user needs to borrow |
| _amount | uint256 | amount of `_tokenBorrow` that user needs borrow |

### uniswapV2Call

```solidity
function uniswapV2Call(address sender, uint256, uint256, bytes data) external
```

_Can be called from IUniswapV2Pair to calculate borrow amount_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | this address |
|  | uint256 |  |
|  | uint256 |  |
| data | bytes | that encoded in {flashSwap} |

## UniswapV2OptimalAmount

Optimized swaps for full exchange of tokens

_Inherits the UniswapV2 implementation
the UniswapV2 Babylonian library and Pair interface implentation_

### optimalSwap

```solidity
function optimalSwap(contract IERC20 _tokenA, contract IERC20 _tokenB, uint256 _amountA) external
```

_Calculate the optimal amount of swap_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenA | contract IERC20 | token that user needs to swap |
| _tokenB | contract IERC20 | token that user needs to get |
| _amountA | uint256 | amount of `_tokenA` that user needs to swap |

### nonOptimalSwap

```solidity
function nonOptimalSwap(contract IERC20 _tokenA, contract IERC20 _tokenB, uint256 _amountA) external
```

_Without calculating the optimal amount of swap_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenA | contract IERC20 | token that user needs to swap |
| _tokenB | contract IERC20 | token that user needs to get |
| _amountA | uint256 | amount of `_tokenA` that user needs to swap |

### getSwapAmount

```solidity
function getSwapAmount(uint256 r, uint256 a) public pure returns (uint256)
```

s = optimal swap amount
r = amount of reserve for a token a
a = amount of token a the user currently has (not added to reserve yet)
f = swap percent
s = (sqrt(((2 - f)r)^2 + 4(1 - f)ar) - (2 - f)r) / (2(1 - f))

## UniswapV2TWAP

TWAP(time-weighted average price) is an oracle that can get

_Imported the UniswapV2 Pair interface, FixedPoint, OracleLibrary libraries implentation_

### PERIOD

```solidity
uint256 PERIOD
```

Min period 10 seconds period

### pair

```solidity
contract IUniswapV2Pair pair
```

Address of token pair contract

### token0

```solidity
contract IERC20 token0
```

Token0 address

### token1

```solidity
contract IERC20 token1
```

Token1 address

### price0CumulativeLast

```solidity
uint256 price0CumulativeLast
```

Last cumulative price for token0

### price1CumulativeLast

```solidity
uint256 price1CumulativeLast
```

Last cumulative price for token1

### blockTimestampLast

```solidity
uint32 blockTimestampLast
```

Last timestamp

### price0Average

```solidity
struct FixedPoint.uq112x112 price0Average
```

Average price for token0

_Used FixedPoint library because solidity don't have floating variables_

### price1Average

```solidity
struct FixedPoint.uq112x112 price1Average
```

Average price for token1

_Used FixedPoint library because solidity don't have floating variables_

### constructor

```solidity
constructor(contract IUniswapV2Pair _pair) public
```

_Using pair contract for finding token0, token1,
price0CumulativeLast, price1CumulativeLast, blockTimestampLast_

### update

```solidity
function update() external
```

_Updates the current price for token pair that pasted to constructor_

### consult

```solidity
function consult(contract IERC20 token, uint256 amountIn) external view returns (uint256 amountOut)
```

_Consult for `token` what `amountOut` can be taken_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | token that user needs to swap |
| amountIn | uint256 | amount that user needs to calculate amountOut |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | calculated amount that user needs to get |

## IUniswapV2

Swaps tokens and add liquidity

### Swapped

```solidity
event Swapped(address from, contract IERC20 tokenA, contract IERC20 tokenB, uint256[] tokensReceied)
```

### AddedTokensToLiquidity

```solidity
event AddedTokensToLiquidity(address from, contract IERC20 tokenA, contract IERC20 tokenB, uint256 amountA, uint256 amountB)
```

### AddedLiquidity

```solidity
event AddedLiquidity(address to, uint256 amount)
```

### RemovedTokensFromLiquidity

```solidity
event RemovedTokensFromLiquidity(address to, address tokenA, address tokenB, uint256 amountA, uint256 amountB)
```

### RemovedLiquidity

```solidity
event RemovedLiquidity(address from, uint256 amount)
```

### swap

```solidity
function swap(contract IERC20 _tokenIn, contract IERC20 _tokenOut, uint256 _amountIn, address _to, uint256 _deadline) external
```

_Swaps `_tokenIn` to `_tokenOut`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenIn | contract IERC20 | token that user needs to swap |
| _tokenOut | contract IERC20 | token that user needs to get |
| _amountIn | uint256 | amount of tokenIn |
| _to | address | user that will receive the token |
| _deadline | uint256 | deadline of swap period |

### addLiquidity

```solidity
function addLiquidity(contract IERC20 _tokenA, contract IERC20 _tokenB, uint256 _amountA, uint256 _amountB, uint256 _deadline) external
```

_Adds liquidity to token pair `_tokenA` and `_tokenB`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenA | contract IERC20 | first token of pair |
| _tokenB | contract IERC20 | second token of pair |
| _amountA | uint256 | amount of `_tokenA` that user need to add to LP |
| _amountB | uint256 | amount of `_tokenB` that user need to add to LP |
| _deadline | uint256 | deadline of swap period |

### removeLiquidity

```solidity
function removeLiquidity(address _tokenA, address _tokenB) external
```

_Removes liquidity from token pair `_tokenA` and `_tokenB`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenA | address | first token of pair |
| _tokenB | address | second token of pair |

## IUniswapV2FlashSwap

Get flash swaps for user

_Imported the Openzeppelin ERC20 interface, the UniswapV2 Calle interface implentations_

### FlashSwap

```solidity
event FlashSwap(address sender, address token0, address token1, uint256 amount0, uint256 admount1)
```

### flashSwap

```solidity
function flashSwap(address _tokenBorrow, uint256 _amount) external
```

_Calls the FlashSwap feature from IUniswapV2Callee_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenBorrow | address | token that user needs to borrow |
| _amount | uint256 | amount of `_tokenBorrow` that user needs borrow |

## IUniswapV2OptimalAmount

Optimized swaps for full exchange of tokens

_Inherits the UniswapV2 interface implementation
the Openzeppelin ERC20 interface implentation_

### optimalSwap

```solidity
function optimalSwap(contract IERC20 _tokenA, contract IERC20 _tokenB, uint256 _amountA) external
```

_Calculate the optimal amount of swap_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenA | contract IERC20 | token that user needs to swap |
| _tokenB | contract IERC20 | token that user needs to get |
| _amountA | uint256 | amount of `_tokenA` that user needs to swap |

### nonOptimalSwap

```solidity
function nonOptimalSwap(contract IERC20 _tokenA, contract IERC20 _tokenB, uint256 _amountA) external
```

_Without calculating the optimal amount of swap_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenA | contract IERC20 | token that user needs to swap |
| _tokenB | contract IERC20 | token that user needs to get |
| _amountA | uint256 | amount of `_tokenA` that user needs to swap |

### getSwapAmount

```solidity
function getSwapAmount(uint256 r, uint256 a) external pure returns (uint256)
```

s = optimal swap amount
r = amount of reserve for a token a
a = amount of token a the user currently has (not added to reserve yet)
f = swap percent
s = (sqrt(((2 - f)r)^2 + 4(1 - f)ar) - (2 - f)r) / (2(1 - f))

## IUniswapV2TWAP

TWAP(time-weighted average price) is an oracle that can get

_Imported the Openzeppelin ERC20 interface implentation_

### update

```solidity
function update() external
```

_Updates the current price for token pair that pasted to constructor_

### consult

```solidity
function consult(contract IERC20 token, uint256 amountIn) external view returns (uint256 amountOut)
```

_Consult for `token` what `amountOut` can be taken_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | token that user needs to swap |
| amountIn | uint256 | amount that user needs to calculate amountOut |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | calculated amount that user needs to get |

