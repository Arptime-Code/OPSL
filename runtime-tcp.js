// This file now just delegates to the modular runtimeTCP/
// For backwards compatibility: node runtime-tcp.js file.opsl
module.exports = require('./runtimeTCP/runtime');
require('./runtimeTCP/main');
