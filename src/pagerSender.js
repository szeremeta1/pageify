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
    browser = await chromium.launch({ headless });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the pager website
    await page.goto('https://secure.usamobility.net', {
      waitUntil: 'domcontentloaded',
      timeout
    });
    console.log('Navigated to pager website');

    // Helper to locate the frame that actually contains the visible form
    const findFormFrame = async (labelText) => {
      const frames = page.frames();
      for (const f of frames) {
        try {
          const heading = f.getByText(labelText, { exact: false }).first();
          if (await heading.isVisible({ timeout: 1500 })) {
            return f;
          }
        } catch (e) {
          continue;
        }
      }
      return page.mainFrame();
    };

    // Step 1: enter pager number then continue
    const formFrame = await findFormFrame('Send a Page');

    const phoneInput = formFrame.getByRole('textbox').first();
    await phoneInput.waitFor({ state: 'visible', timeout: 12000 });
    await phoneInput.click({ timeout: 2000 });
    await phoneInput.fill(phoneNumber, { timeout: 5000 });
    console.log(`Entered phone number: ${phoneNumber}`);

    const continueButton = formFrame.getByRole('button', { name: /continue/i }).first();
    await continueButton.waitFor({ state: 'visible', timeout: 12000 });
    await continueButton.click({ timeout: 5000 });
    console.log('Clicked continue');

    // Wait for step 2 (message page) to appear
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const messageFrame = await findFormFrame('Please enter the message');

    const messageInput = messageFrame.getByRole('textbox').first();
    await messageInput.waitFor({ state: 'visible', timeout: 12000 });
    await messageInput.click({ timeout: 2000 });
    await messageInput.fill(message, { timeout: 5000 });
    console.log('Entered message');

    const sendButton = messageFrame.getByRole('button', { name: /send/i }).first();
    await sendButton.waitFor({ state: 'visible', timeout: 12000 });
    await sendButton.click({ timeout: 5000 });
    console.log('Clicked send button');

    // Wait briefly for any success state or completion
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

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
