import https from 'https';

async function fetchQuote() {
  return new Promise((resolve, reject) => {
    https.get('https://celo.api.0x.org/swap/v1/quote?buyToken=0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e&sellToken=CELO&sellAmount=1000000000000000000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  })
}

fetchQuote().then(console.log);
