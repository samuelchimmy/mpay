import https from 'https';

async function fetchQuote() {
  return new Promise((resolve, reject) => {
    https.get('https://open-api.openocean.finance/v3/celo/tokenList', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  })
}

fetchQuote().then(console.log);
