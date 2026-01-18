/**
 * Pager sender using Playwright to interact with usamobility.net
 */

const { chromium } = require('playwright');

/**
 * Send message to pager via usamobility.net
 * @param {string} phoneNumber - Pager phone number
 * @param {string} message - Message to send
 * @param {Object} options - Options for browser automation
 * @returns {Promise<Object>} - Result of the operation
 */
async function sendToPager(phoneNumber, message, options = {}) {
  const { headless = false, timeout = 30000 } = options;
  
  let browser = null;
  
  try {
    console.log(`Sending message to pager ${phoneNumber}...`);
    
    // Launch browser
    browser = await chromium.launch({
      headless,
      timeout
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the pager website
    await page.goto('https://secure.usamobility.net', { waitUntil: 'networkidle' });
    console.log('Navigated to pager website');
    
    // Wait for the page to load and find the phone number input
    // Try different possible selectors
    const phoneInput = await page.locator('input[type="text"], input[name*="phone"], input[name*="number"], input[id*="phone"], input[id*="number"]').first();
    await phoneInput.waitFor({ timeout: 10000 });
    
    // Type the phone number
    await phoneInput.fill(phoneNumber);
    console.log(`Entered phone number: ${phoneNumber}`);
    
    // Find the message textarea/input
    const messageInput = await page.locator('textarea, input[type="text"]:not([name*="phone"]):not([id*="phone"])').last();
    await messageInput.waitFor({ timeout: 10000 });
    
    // Type the message
    await messageInput.fill(message);
    console.log('Entered message');
    
    // Find and click the send button
    const sendButton = await page.locator('button:has-text("Send"), input[type="submit"], button[type="submit"]').first();
    await sendButton.waitFor({ timeout: 10000 });
    await sendButton.click();
    console.log('Clicked send button');
    
    // Wait a moment for the submission to process
    await page.waitForTimeout(2000);
    
    await browser.close();
    
    return {
      success: true,
      message: 'Message sent successfully'
    };
  } catch (error) {
    console.error('Error sending to pager:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendToPager
};
