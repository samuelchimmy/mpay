import { Mento } from '@mento-protocol/mento-sdk';
import { providers, utils } from 'ethers';

const CELO_ADDRESS = '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9';
const USDT_ADDRESS = '0x624923e5957e627471659D1872179E735522e97A';
const TOKEN_DECIMALS = 18;

let mentoInstance: any = null;
let providerInstance: any = null;

const initMento = async () => {
  if (!mentoInstance) {
    if (!(window as any).ethereum) {
      throw new Error("No crypto wallet detected.");
    }
    const provider = new providers.Web3Provider((window as any).ethereum);
    providerInstance = provider;
    
    // Switch to Celo Alfajores Network (44787)
    await provider.send('wallet_switchEthereumChain', [{ chainId: '0xaef3' }]);
    
    const signer = provider.getSigner();
    mentoInstance = await Mento.create(signer);
  }
  return { mento: mentoInstance, provider: providerInstance };
};

export async function getSwapQuote(amountInCELO: string) {
  try {
    const { mento } = await initMento();
    const amountInWei = utils.parseUnits(amountInCELO, TOKEN_DECIMALS);
    
    const amountOutWei = await mento.getAmountOut(CELO_ADDRESS, USDT_ADDRESS, amountInWei);
    
    const inputVal = parseFloat(amountInCELO);
    const amountOutHuman = utils.formatUnits(amountOutWei, TOKEN_DECIMALS);
    const outputVal = parseFloat(amountOutHuman);
    const effectivePrice = inputVal > 0 ? outputVal / inputVal : 0;
    
    const baseAmountInWei = utils.parseUnits("0.001", TOKEN_DECIMALS);
    const baseOutputWei = await mento.getAmountOut(CELO_ADDRESS, USDT_ADDRESS, baseAmountInWei);
    const baseOutputVal = parseFloat(utils.formatUnits(baseOutputWei, TOKEN_DECIMALS));
    const expectedPrice = baseOutputVal / 0.001;
    
    const priceImpact = expectedPrice > 0 
        ? ((expectedPrice - effectivePrice) / expectedPrice) * 100 
        : 0;

    return {
      amountOut: amountOutHuman,
      amountOutWei,
      priceImpact: isNaN(priceImpact) ? 0 : priceImpact,
      expectedPrice
    };
  } catch (error) {
    console.error("Failed to get swap quote:", error);
    throw error;
  }
}

export async function executeCeloToUsdtSwap(amountInCELO: string) {
  try {
    if (!(window as any).ethereum) {
      throw new Error("No crypto wallet detected. Please open this dApp inside MiniPay.");
    }

    const { mento, provider } = await initMento();
    const signer = provider.getSigner();

    const amountInWei = utils.parseUnits(amountInCELO, TOKEN_DECIMALS);
    const amountOutWei = await mento.getAmountOut(CELO_ADDRESS, USDT_ADDRESS, amountInWei);
    
    // 2% slippage tolerance
    const amountOutMin = amountOutWei.mul(98).div(100);

    console.log("Prompting user for signature inside MiniPay...");
    const txReq = await mento.swapIn(CELO_ADDRESS, USDT_ADDRESS, amountInWei, amountOutMin);
    
    const tx = await signer.sendTransaction(txReq);
    console.log(`Swap pending... Transaction Hash: ${tx.hash}`);
    
    await tx.wait();
    console.log(`Swap successful!`);
    return tx.hash;
  } catch (error) {
    console.error("Mento Swap Failed:", error);
    throw error;
  }
}

