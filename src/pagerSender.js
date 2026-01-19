// Browser delivery removed; keep stub to guard against accidental usage.
async function sendToPager() {
  throw new Error('Browser delivery was removed; use the HTTP API sender instead.');
}

module.exports = { sendToPager };
