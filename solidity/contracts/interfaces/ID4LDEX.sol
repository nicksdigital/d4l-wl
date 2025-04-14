// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title ID4LDEX
 * @dev Interface for the D4L DEX
 */
interface ID4LDEX {
    /**
     * @dev Swaps an exact amount of tokens for another token
     * @param tokenIn Address of the token to swap from
     * @param tokenOut Address of the token to swap to
     * @param amountIn Amount of input tokens to swap
     * @param minAmountOut Minimum amount of output tokens to receive
     * @param to Address to send the output tokens to
     * @param deadline Timestamp after which the transaction will revert
     * @return amountOut Amount of output tokens received
     */
    function swapExactTokensForTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);

    /**
     * @dev Swaps an exact amount of ETH for tokens
     * @param tokenOut Address of the token to swap to
     * @param minAmountOut Minimum amount of output tokens to receive
     * @param to Address to send the output tokens to
     * @param deadline Timestamp after which the transaction will revert
     * @return amountOut Amount of output tokens received
     */
    function swapExactETHForTokens(
        address tokenOut,
        uint256 minAmountOut,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountOut);

    /**
     * @dev Swaps an exact amount of tokens for ETH
     * @param tokenIn Address of the token to swap from
     * @param amountIn Amount of input tokens to swap
     * @param minAmountOut Minimum amount of ETH to receive
     * @param to Address to send the ETH to
     * @param deadline Timestamp after which the transaction will revert
     * @return amountOut Amount of ETH received
     */
    function swapExactTokensForETH(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);

    /**
     * @dev Gets the amount of output tokens for a given input amount
     * @param tokenIn Address of the input token
     * @param tokenOut Address of the output token
     * @param amountIn Amount of input tokens
     * @return amountOut Amount of output tokens
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut);

    /**
     * @dev Gets the price impact for a given token and amount
     * @param token Address of the token
     * @param amount Amount of tokens
     * @param isBuy Whether the operation is a buy or sell
     * @return impact Price impact as a percentage (scaled by 10000)
     */
    function getPriceImpact(
        address token,
        uint256 amount,
        bool isBuy
    ) external view returns (uint256 impact);
}
