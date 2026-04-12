// Store registered clients: { name: { values: {}, functions: [], port: 0 } }
const clients = {};

function getOrCreateClient(name) {
  if (!clients[name]) {
    clients[name] = { values: {}, functions: [], port: 0 };
  }
  return clients[name];
}

module.exports = { getOrCreateClient: getOrCreateClient };
