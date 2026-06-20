import https from 'https';

async function fetchQuote() {
  return new Promise((resolve, reject) => {
    https.get('https://open-api.openocean.finance/v3/celo/quote?inTokenAddress=0x471EcE3750Da237f93B8E339c536989b8978a438&outTokenAddress=0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e&amount=1&gasPrice=5', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  })
}

fetchQuote().then(console.log);
