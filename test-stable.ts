import { Mento } from '@mento-protocol/mento-sdk';

async function run() {
  try {
    const mento = await Mento.create(11142220, "https://forno.celo-sepolia.celo-testnet.org");
    console.log("Mento V3 initialized!");
    const stables = await (mento as any).tokens.getStableTokens();
    console.log("Mento stable tokens on Sepolia:", stables);
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
