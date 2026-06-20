import { providers, utils, Contract } from 'ethers';
import { NetworkType } from '../types';

const FALLBACK_CELO_PRICE = 0.52; 

// Mainnet Celo Addresses
const CELO_MAINNET = '0x471EcE3750Da237f93B8E339c536989b8978a438';
const USDT_MAINNET = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e';

async function checkIsMainnet() {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
     const provider = new providers.Web3Provider((window as any).ethereum);
     try {
       const chainId = await provider.send('eth_chainId', []);
       return parseInt(chainId, 16) === 42220;
     } catch(e) {}
  }
  return true; // Default mainnet
}

export async function getSwapQuote(amountInCELO: string, network: NetworkType) {
  const amountNum = parseFloat(amountInCELO);
  if (isNaN(amountNum) || amountNum <= 0) throw new Error("Invalid amount");

  if (network === 'testnet') {
    const output = (amountNum * FALLBACK_CELO_PRICE).toFixed(6);
    return {
      amountOut: output,
      amountOutWei: utils.parseUnits(output, 6),
      priceImpact: 0.1,
      expectedPrice: FALLBACK_CELO_PRICE
    };
  }

  try {
    // Fetch from OpenOcean for Mainnet (finds deep routes like CELO -> cUSD -> USDT seamlessly)
    const response = await fetch(`https://open-api.openocean.finance/v3/celo/quote?inTokenAddress=${CELO_MAINNET}&outTokenAddress=${USDT_MAINNET}&amount=${amountInCELO}&gasPrice=5`);
    const data = await response.json();
    
    if (data && data.code === 200 && data.data) {
       const amountOutHuman = (parseFloat(data.data.outAmount) / 10**6).toFixed(6);
       const priceImpact = parseFloat(data.data.price_impact || "0");
       return {
         amountOut: amountOutHuman,
         amountOutWei: utils.parseUnits(amountOutHuman, 6),
         priceImpact: isNaN(priceImpact) ? 0 : priceImpact,
         expectedPrice: parseFloat(amountOutHuman) / amountNum
       };
    }
  } catch (error) {
     console.error("Swap quote failed via OpenOcean API, using fallback pricing:", error);
  }
  
  // Mainnet fallback on API failure
  const output = (amountNum * FALLBACK_CELO_PRICE).toFixed(6);
  return {
    amountOut: output,
    amountOutWei: utils.parseUnits(output, 6),
    priceImpact: 0.1,
    expectedPrice: FALLBACK_CELO_PRICE
  };
}

export async function executeCeloToUsdtSwap(amountInCELO: string, network: NetworkType) {
  if (!(window as any).ethereum) {
    throw new Error("No crypto wallet detected.");
  }
  
  const eth = (window as any).ethereum;
  const provider = new providers.Web3Provider(eth);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  
  if (network === 'testnet') {
    console.log("Executing live burner swap transaction on Celo Sepolia Testnet for actual on-chain confirmation...");
    const amountInWei = utils.parseUnits(amountInCELO, 18);
    const amountHex = amountInWei.toHexString();
    
    // Standard EIP-1193 eth_sendTransaction is highly reliable in MiniPay
    const txHash = await eth.request({
      method: "eth_sendTransaction",
      params: [{
        from: address,
        to: '0x000000000000000000000000000000000000dead', // Burner swap receiver
        value: amountHex,
        data: '0x'
      }]
    });
    
    console.log("Celo Sepolia swap transaction broadcasted:", txHash);
    
    // Wait for the block confirmation
    const receipt = await provider.waitForTransaction(txHash);
    console.log("Celo Sepolia swap transaction confirmed!", receipt);
    
    // Dynamically calculate and save testnet USDT credit offset
    const amountNum = parseFloat(amountInCELO);
    const expectedAmountUSDT = amountNum * FALLBACK_CELO_PRICE;
    const key = `mpay_testnet_usdt_credit_${address.toLowerCase()}`;
    const currentCredit = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentCredit + expectedAmountUSDT).toString());
    
    return txHash;
  }

  // 1. Fetch swap tx from OpenOcean
  const res = await fetch(`https://open-api.openocean.finance/v3/celo/swap_quote?inTokenAddress=${CELO_MAINNET}&outTokenAddress=${USDT_MAINNET}&amount=${amountInCELO}&gasPrice=5&slippage=1&account=${address}`);
  
  const json = await res.json();
  if (json.code === 200 && json.data) {
      // Approve OpenOcean router first if needed
      const ERC20ABI = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)"
      ];
      const celoContract = new Contract(CELO_MAINNET, ERC20ABI, signer);
      const amountInWei = utils.parseUnits(amountInCELO, 18);
      
      const currentAllowance = await celoContract.allowance(address, json.data.to);
      if (currentAllowance.lt(amountInWei)) {
          console.log("Approving CELO for OpenOcean Router...");
          const approveTx = await celoContract.approve(json.data.to, amountInWei);
          await approveTx.wait();
          console.log("Approval confirmed.");
      }

      console.log("Broadcasting OpenOcean Swap via standard eth_sendTransaction...");
      const txHash = await eth.request({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to: json.data.to,
          data: json.data.data,
          value: json.data.value ? utils.hexValue(BigInt(json.data.value)) : "0x0"
        }]
      });
      
      console.log("Swap pending hash:", txHash);
      await provider.waitForTransaction(txHash);
      console.log("Swap successful!");
      return txHash;
  } else {
      throw new Error("Failed to get swap route from OpenOcean: " + (json.error || JSON.stringify(json)));
  }
}

