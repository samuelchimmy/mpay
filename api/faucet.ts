import { providers, Wallet, utils } from 'ethers';

// Basic in-memory rate limiting for Vercel Serverless (Resets on function cold-starts)
const claimCounts = new Map<string, number>();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address } = req.body;

  if (!address || !utils.isAddress(address)) {
    return res.status(400).json({ error: 'Invalid or missing address' });
  }

  // Rate limiting (simple check)
  const currentCount = claimCounts.get(address.toLowerCase()) || 0;
  if (currentCount >= 5) {
    return res.status(429).json({ error: 'Wallet rate limit exceeded (5 claims max per session)' });
  }

  const privateKey = process.env.FAUCET_PRIVATE_KEY;
  if (!privateKey) {
    console.error('FAUCET_PRIVATE_KEY is not configured');
    return res.status(500).json({ error: 'Relayer not configured' });
  }

  try {
    const provider = new providers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
    const wallet = new Wallet(privateKey, provider);

    const tx = await wallet.sendTransaction({
      to: address,
      value: utils.parseEther('0.2')
    });

    // Update claim count
    claimCounts.set(address.toLowerCase(), currentCount + 1);

    return res.status(200).json({
      success: true,
      txHash: tx.hash,
      amount: '0.2 CELO'
    });
  } catch (error: any) {
    console.error('Faucet transfer failed:', error);
    return res.status(500).json({
      error: 'Faucet transfer failed',
      details: error.message
    });
  }
}
