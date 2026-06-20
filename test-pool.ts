import { providers, Contract } from 'ethers';

async function run() {
  const provider = new providers.JsonRpcProvider('https://forno.celo.org');
  const poolAbi = ["function liquidity() external view returns (uint128)"];
  
  const pools = [
    "0x6cde5f5a192fBf3fD84df983aa6DC30dbd9f8Fac",
    "0xB135EbdE27d366b0D62E579baE4118cB991b820E",
    "0x1219b06380157f0eA0468F4f714D66e7F89D6956",
    "0x0f44A1c2b66418F784607D2067fE695703809bFF"
  ];
  
  for (let p of pools) {
     const pool = new Contract(p, poolAbi, provider);
     const liq = await pool.liquidity();
     console.log(`Pool ${p} Liquidity:`, liq.toString());
  }
}
run();
