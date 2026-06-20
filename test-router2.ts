import { providers, Contract, utils } from 'ethers';

async function run() {
  const provider = new providers.JsonRpcProvider('https://forno.celo.org');
  
  const quoterAbi = [
    "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"
  ];
  const quoter = new Contract('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', quoterAbi, provider);

  const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438';
  const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
  const USDT = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e';

  const fees = [500, 3000, 10000];
  for (let fee of fees) {
    try {
      const amt = await quoter.callStatic.quoteExactInputSingle(CELO, cUSD, fee, utils.parseEther("1"), 0);
      console.log(`CELO->cUSD Fee ${fee}:`, amt.toString());
    } catch(e) {}
    try {
      const amt = await quoter.callStatic.quoteExactInputSingle(CELO, USDT, fee, utils.parseEther("1"), 0);
      console.log(`CELO->USDT Fee ${fee}:`, amt.toString());
    } catch(e) {}
  }
}
run();
