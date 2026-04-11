// Parse a raw data chunk into complete newline-delimited messages
function createParser(onMessage) {
  let buffer = '';

  return function onData(chunk) {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      // Format: requestId:name:action:key[:extra...]
      const parts = line.split(':');
      const message = {
        requestId: parts[0],
        name: parts[1],
        action: parts[2],
        key: parts[3],
        extra: parts.slice(4).join(':'),
      };

      onMessage(message);
    }
  };
}

module.exports = { createParser };
