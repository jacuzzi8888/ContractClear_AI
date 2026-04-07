import https from 'https';
https.get('https://html.duckduckgo.com/html/?q=site:auth0.com+Pass+Parameters+to+Identity+Providers', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const regex = /<a class="result__url" href="([^"]+)">/g;
    let match;
    while ((match = regex.exec(data)) !== null) {
      console.log(match[1]);
    }
  });
});
