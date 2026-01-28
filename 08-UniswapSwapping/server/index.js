const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();
const cors = require("cors");
const { ethers } = require("ethers");
const {
  ChainId,
  Percent,
  CurrencyAmount,
  TradeType,
  Token,
} = require("@uniswap/sdk-core");
const { AlphaRouter } = require("@uniswap/smart-order-router");
const { SwapType } = require("@uniswap/smart-order-router");
const JSBI = require("jsbi");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const getProvider = async () => {
  const RPC_URL = process.env.BASE_RPC_URL;

  if (!RPC_URL) throw new Error("RPC URL missing");

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  await provider.getNetwork();
  return provider;
};

function fromReadableAmount(amount, decimals) {
  const extraDigits = Math.pow(10, countDecimals(amount));
  const adjustedAmount = amount * extraDigits;
  return JSBI.divide(
    JSBI.multiply(
      JSBI.BigInt(adjustedAmount),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals)),
    ),
    JSBI.BigInt(extraDigits),
  );
}

function countDecimals(x) {
  if (Math.floor(x) === x) {
    return 0;
  }
  return x.toString().split(".")[1].length || 0;
}

app.post("/swap", async (req, res) => {
  const { tokenIn, tokenOut, amountIn } = req.body;

  const tokenInObj = new Token(
    ChainId.BASE,
    tokenIn.address,
    tokenIn.decimals,
    tokenIn.symbol,
    tokenIn.name,
  );

  const tokenOutObj = new Token(
    ChainId.BASE,
    tokenOut.address,
    tokenOut.decimals,
    tokenOut.symbol,
    tokenOut.name,
  );

  const provider = await getProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const router = new AlphaRouter({
    chainId: ChainId.BASE,
    provider,
  });

  const options = {
    recipient: wallet.address,
    slippageTolerance: new Percent(50, 10_000), // 0.5%
    deadline: Math.floor(Date.now() / 1000 + 1800),
    type: SwapType.SWAP_ROUTER_02,
  };

  const rawTokenAmountIn = CurrencyAmount.fromRawAmount(
    tokenInObj,
    fromReadableAmount(amountIn, tokenInObj.decimals),
  );

  const route = await router.route(
    rawTokenAmountIn,
    tokenOutObj,
    TradeType.EXACT_INPUT,
    options,
  );

  return res.json({
    calldata: route.methodParameters.calldata,
    value: route.methodParameters.value ?? "0x0",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
