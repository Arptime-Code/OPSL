// Read server responses and resolve matching promises
let inputBuffer = '';
let pendingRequests = {};

function drainResponses(chunk) {
  inputBuffer += chunk.toString();
  const lines = inputBuffer.split('\n');
  inputBuffer = lines.pop() || '';

  for (const line of lines) {
    if (!line.trim()) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const reqId = line.substring(0, colonIdx);
    const data = line.substring(colonIdx + 1);

    if (pendingRequests[reqId]) {
      pendingRequests[reqId](data);
      delete pendingRequests[reqId];
    }
  }
}

function registerRequest(id) {
  return new Promise(resolve => {
    pendingRequests[id] = resolve;
  });
}

module.exports = { drainResponses, registerRequest };
