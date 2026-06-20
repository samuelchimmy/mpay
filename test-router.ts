import { providers, Contract, utils } from 'ethers';

async function run() {
  const provider = new providers.JsonRpcProvider('https://forno.celo.org');
  const code = await provider.getCode('0x61fFE014bA17989E743c5F6cB21bF9697530B21e');
  
  if (code.length > 5) {
     const quoterAbi = [
       "function quoteExactInputSingle(tuple(address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)"
     ];
     const quoter = new Contract('0x61fFE014bA17989E743c5F6cB21bF9697530B21e', quoterAbi, provider);
     const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438';
     const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
     const USDT = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e';
     
     const fees = [500, 3000, 10000];
     for (let fee of fees) {
       try {
         const res = await quoter.callStatic.quoteExactInputSingle({
           tokenIn: CELO,
           tokenOut: cUSD,
           amountIn: utils.parseEther("1"),
           fee: fee,
           sqrtPriceLimitX96: 0
         });
         console.log(`CELO->cUSD Fee ${fee} Amount Out:`, res.amountOut.toString());
       } catch (err) {}
     }
     
     // Check USDC
     const USDC = '0xcebA9300f2b948710d2653dD7B07f33A8B32118C';
     for (let fee of fees) {
       try {
         const res = await quoter.callStatic.quoteExactInputSingle({
           tokenIn: CELO,
           tokenOut: USDC,
           amountIn: utils.parseEther("1"),
           fee: fee,
           sqrtPriceLimitX96: 0
         });
         console.log(`CELO->USDC Fee ${fee} Amount Out:`, res.amountOut.toString());
       } catch (err) {}
     }
  }
}
run();
