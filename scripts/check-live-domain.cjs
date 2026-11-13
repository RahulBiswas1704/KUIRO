const https = require('https');

https.get('https://kuiro.vercel.app/contact', (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    const mailto = data.match(/mailto:[a-zA-Z0-9@.-]+/g);
    console.log('Mailto links found on live production:', mailto);
    console.log('Contains kuiro.in:', data.includes('kuiro.in'));
    console.log('Contains kuiro.ai:', data.includes('kuiro.ai'));
  });
});
