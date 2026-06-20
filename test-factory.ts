import { providers, Contract } from 'ethers';

async function run() {
  const provider = new providers.JsonRpcProvider('https://forno.celo.org');
  const factoryAbi = [
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
  ];
  // Uniswap V3 Factory on Celo:
  const factory = new Contract('0xAfE208a311B21f13EF87E33A90049fC17A7acDEc', factoryAbi, provider);

  const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438';
  const USDT = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e';
  const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
  
  const fees = [100, 500, 3000, 10000];
  for (let fee of fees) {
    try {
      const pool = await factory.getPool(CELO, USDT, fee);
      console.log(`CELO/USDT Fee ${fee}:`, pool);
    } catch (e) {}
  }
}
run();
