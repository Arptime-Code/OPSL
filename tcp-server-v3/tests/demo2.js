const client = require('../client');

const add = (a, b) => Number(a) + Number(b);

async function main() {
  await client.init('demo2', 3002);
  await new Promise(r => setTimeout(r, 500));

  await client.set('email', 'bob@example.com');
  console.log('Set: email = bob@example.com');

  const email = await client.get('email');
  console.log('Got:', email);

  await client.registerFunction('add', add);

  const result = await client.callRemote('demo1', 'add', 5, 10);
  console.log('Result:', result);
}

main();