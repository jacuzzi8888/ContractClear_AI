const fs = require('fs');
const contents = fs.readFileSync('app/node_modules/@auth0/nextjs-auth0/dist/server/auth-client.d.ts', 'utf8');
console.log(contents);
