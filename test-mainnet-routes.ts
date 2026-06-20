import { Mento } from '@mento-protocol/mento-sdk';

async function run() {
  try {
    const chainId = 42220; // Mainnet
    const rpc = "https://forno.celo.org";
    const mento = await Mento.create(chainId, rpc);
    const routes = await mento.routes.getRoutes();
    
    const symbols = new Set<string>();
    for (let r of routes) {
       for (let t of r.tokens) {
          symbols.add(t.symbol || '');
       }
    }
    console.log("Registered tokens in Mainnet Mento routes:", Array.from(symbols));
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
