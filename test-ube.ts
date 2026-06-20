import { providers, Contract, utils } from 'ethers';

async function run() {
  const provider = new providers.JsonRpcProvider('https://forno.celo.org');
  const ubeswapAbi = [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
  ];
  const ubeswap = new Contract('0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121', ubeswapAbi, provider);

  const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438';
  const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
  const USDT = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e';

  try {
    const outs = await ubeswap.getAmountsOut(utils.parseEther("1"), [CELO, cUSD, USDT]);
    console.log("CELO -> cUSD -> USDT out:", outs[outs.length - 1].toString());
  } catch (e) { console.log("CELO -> cUSD -> USDT failed"); }

  try {
    const outs = await ubeswap.getAmountsOut(utils.parseEther("1"), [CELO, USDT]);
    console.log("CELO -> USDT out:", outs[outs.length - 1].toString());
  } catch (e) { console.log("CELO -> USDT failed"); }
  
  try {
    const outs = await ubeswap.getAmountsOut(utils.parseEther("1"), [CELO, cUSD]);
    console.log("CELO -> cUSD out:", outs[outs.length - 1].toString());
  } catch (e) { console.log("CELO -> cUSD failed"); }
}
run();
