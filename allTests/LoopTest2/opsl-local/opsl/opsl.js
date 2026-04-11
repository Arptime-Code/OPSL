// ========================================
// opsl.js - OPSL native library with TCP
// ========================================

const TCPClient = require('/home/arptime/Main_Programming/OPSL (Copy 2)/tcp-server-v3/client');

// Initialize
(async () => {
    await TCPClient.init('opsl', 4020);
    console.log("opsl.js loaded and registered");
})();
