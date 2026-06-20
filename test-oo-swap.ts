import https from 'https';

async function fetchSwapQuote() {
  return new Promise((resolve, reject) => {
    https.get('https://open-api.openocean.finance/v3/celo/swap_quote?inTokenAddress=0x471EcE3750Da237f93B8E339c536989b8978a438&outTokenAddress=0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e&amount=1&gasPrice=5&slippage=1&account=0x0000000000000000000000000000000000000001', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  })
}

fetchSwapQuote().then(console.log);
