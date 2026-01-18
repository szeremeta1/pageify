/**
 * Pageify - Uptime Kuma Pager Exporter
 * Main application entry point
 */

require('dotenv').config();
const express = require('express');
const { cleanMessage } = require('./messageClean');
const { sendToPager } = require('./pagerSender');

const app = express();
const PORT = process.env.PORT || 3000;
const PAGER_PHONE_NUMBER = process.env.PAGER_PHONE_NUMBER || '7322063021';
const HEADLESS = process.env.HEADLESS === 'true';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Pageify - Uptime Kuma Pager Exporter',
    status: 'running',
    endpoints: {
      webhook: '/webhook',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Webhook endpoint for Uptime Kuma
app.post('/webhook', async (req, res) => {
  try {
    console.log('Received webhook from Uptime Kuma');
    console.log('Payload:', JSON.stringify(req.body, null, 2));
    
    // Clean the message
    const cleanedMessage = cleanMessage(req.body);
    console.log('Cleaned message:', cleanedMessage);
    
    // Send acknowledgment immediately
    res.status(202).json({
      status: 'accepted',
      message: 'Webhook received, processing...'
    });
    
    // Send to pager asynchronously
    const result = await sendToPager(PAGER_PHONE_NUMBER, cleanedMessage, {
      headless: HEADLESS
    });
    
    if (result.success) {
      console.log('Message sent to pager successfully');
    } else {
      console.error('Failed to send message to pager:', result.error);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Only send error response if we haven't sent a response yet
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Pageify server is running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`Pager phone number: ${PAGER_PHONE_NUMBER}`);
  console.log(`Headless mode: ${HEADLESS}`);
});
