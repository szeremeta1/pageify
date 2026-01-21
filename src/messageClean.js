/**
 * Message cleaner utility
 * Removes emojis and reformats monitoring webhook messages for pager delivery
 */

/**
 * Remove emojis from text
 * @param {string} text - Text containing emojis
 * @returns {string} - Text without emojis
 */
function removeEmojis(text) {
  if (!text) return '';
  
  // Remove emoji characters (including various Unicode ranges)
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{200D}]/gu, '')             // Zero Width Joiner
    .trim();
}

/**
 * Clean and format message for pager
 * @param {Object} webhookPayload - Monitoring webhook payload
 * @returns {string} - Formatted message for pager
 */
function cleanMessage(webhookPayload) {
  try {
    const { msg } = webhookPayload;

    if (!msg) {
      return 'No message provided';
    }

    const cleaned = removeEmojis(msg).trim();

    return cleaned || 'No message provided';
  } catch (error) {
    console.error('Error cleaning message:', error);
    return 'Error processing message';
  }
}

module.exports = {
  removeEmojis,
  cleanMessage
};
