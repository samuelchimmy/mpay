import { Mento } from '@mento-protocol/mento-sdk';

async function run() {
  try {
    const mento = await Mento.create(42220, "https://forno.celo.org");
    console.log("Mento setup done on MAINNET with 3.x");
    
    // test quote CELO to USDT for mainnet
    const CELO_ADDRESS = '0x471EcE3750Da237f93B8E339c536989b8978a438';
    const cUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
    const USDT_ADDRESS = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e';
    
    const amountInWei = 1000000000000000000n; // 1 celo
    
    try {
        const amountOutRoute = await mento.quotes.getAmountOut(CELO_ADDRESS, cUSD_ADDRESS, amountInWei);
        console.log("Got amount out (cUSD): ", amountOutRoute);
    } catch(e) {
        console.error("Mento routes fail us (cUSD): ", e.message)
    }

    try {
      const amountOutWei_USDT = await mento.quotes.getAmountOut(CELO_ADDRESS, USDT_ADDRESS, amountInWei);
      console.log("Got amount out (USDT): ", amountOutWei_USDT);
    } catch (e) {
      console.log("CELO->USDT direct via mento not possible: ", e.message);
    }
  } catch(e) {
    console.error("Error setting up mento", e);
  }
}
run();
