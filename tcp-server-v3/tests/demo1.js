const client = require('../client');

const add = (a, b) => Number(a) + Number(b);

async function main() {
  await client.init('demo1', 3001);

  await client.set('name', 'Alice');
  console.log('Set: name = Alice');

  const name = await client.get('name');
  console.log('Got:', name);

  await client.registerFunction('add', add);
  console.log('Registered: add');
}

main();