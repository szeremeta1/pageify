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
        phoneInput = await page.locator(selector).first();
        if (await phoneInput.count() > 0) {
          await phoneInput.waitFor({ timeout: 5000 });
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!phoneInput || await phoneInput.count() === 0) {
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
        messageInput = await page.locator(selector).first();
        if (await messageInput.count() > 0) {
          await messageInput.waitFor({ timeout: 5000 });
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!messageInput || await messageInput.count() === 0) {
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
        sendButton = await page.locator(selector).first();
        if (await sendButton.count() > 0) {
          await sendButton.waitFor({ timeout: 5000 });
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!sendButton || await sendButton.count() === 0) {
      throw new Error('Could not find send button');
    }
    
    await sendButton.click();
    console.log('Clicked send button');
    
    // Wait for submission to process
    await page.waitForTimeout(2000);
    
    // Check for success indicators
    const successIndicators = [
      'text=success',
      'text=sent',
      'text=delivered',
      '.success',
      '.alert-success'
    ];
    
    let success = false;
    for (const indicator of successIndicators) {
      try {
        const element = await page.locator(indicator).first();
        if (await element.count() > 0) {
          success = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await browser.close();
    
    return {
      success: true,
      message: 'Message sent successfully',
      confirmed: success
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
