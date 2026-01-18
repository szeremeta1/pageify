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
      headless
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the pager website
    await page.goto('https://secure.usamobility.net', { 
      waitUntil: 'networkidle',
      timeout: timeout 
    });
    console.log('Navigated to pager website');
    
    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');
    
    // Find and fill the phone number input
    // Try multiple selector strategies
    const phoneSelectors = [
      'input[name*="phone"]',
      'input[name*="number"]',
      'input[id*="phone"]',
      'input[id*="number"]',
      'input[placeholder*="phone"]',
      'input[placeholder*="number"]',
      'input[type="tel"]',
      'input[type="text"]:first-of-type'
    ];
    
    let phoneInput = null;
    for (const selector of phoneSelectors) {
      try {
        phoneInput = page.locator(selector).first();
        await phoneInput.waitFor({ timeout: 5000 });
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!phoneInput) {
      throw new Error('Could not find phone number input field');
    }
    
    // Type the phone number
    await phoneInput.fill(phoneNumber);
    console.log(`Entered phone number: ${phoneNumber}`);
    
    // Find and fill the message textarea/input
    const messageSelectors = [
      'textarea',
      'input[name*="message"]',
      'input[name*="text"]',
      'input[id*="message"]',
      'input[id*="text"]',
      'input[placeholder*="message"]',
      'input[type="text"]:last-of-type'
    ];
    
    let messageInput = null;
    for (const selector of messageSelectors) {
      try {
        messageInput = page.locator(selector).first();
        await messageInput.waitFor({ timeout: 5000 });
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!messageInput) {
      throw new Error('Could not find message input field');
    }
    
    // Type the message
    await messageInput.fill(message);
    console.log('Entered message');
    
    // Find and click the send button
    const sendSelectors = [
      'button:has-text("Send")',
      'button:has-text("Submit")',
      'input[type="submit"]',
      'button[type="submit"]',
      'button:has-text("send")',
      'input[value*="Send"]',
      'input[value*="Submit"]'
    ];
    
    let sendButton = null;
    for (const selector of sendSelectors) {
      try {
        sendButton = page.locator(selector).first();
        await sendButton.waitFor({ timeout: 5000 });
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!sendButton) {
      throw new Error('Could not find send button');
    }
    
    await sendButton.click();
    console.log('Clicked send button');
    
    // Wait for navigation or success response after submission
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (e) {
      // Continue if timeout - the submission might still have worked
    }
    
    // Check for success indicators
    const successIndicators = [
      'text=success',
      'text=sent',
      'text=delivered',
      '.success',
      '.alert-success'
    ];
    
    let confirmed = false;
    for (const indicator of successIndicators) {
      try {
        const element = page.locator(indicator).first();
        await element.waitFor({ timeout: 2000 });
        confirmed = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    await browser.close();
    
    return {
      success: true,
      message: 'Message sent successfully',
      confirmed: confirmed
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
