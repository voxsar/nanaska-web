import express from 'express';
import {
	GatewayClient,
	ClientConfig,
	PaymentInitRequest,
	PaymentCompleteRequest,
	TransactionAmount,
	Redirect,
	TransactionType
} from '../src/index.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const GATEWAY_CONFIG = {
	serviceEndpoint: 'https://sampath.paycorp.lk/rest/service/proxy',
	authToken: process.env.PAYCORP_AUTH_TOKEN || 'YOUR_AUTH_TOKEN',
	hmacSecret: process.env.PAYCORP_HMAC_SECRET || 'YOUR_HMAC_SECRET',
	clientId: process.env.PAYCORP_CLIENT_ID || 'YOUR_CLIENT_ID',
};

/**
 * Create configured gateway client
 */
function createGatewayClient() {
	const config = new ClientConfig();
	config.setServiceEndpoint(GATEWAY_CONFIG.serviceEndpoint);
	config.setAuthToken(GATEWAY_CONFIG.authToken);
	config.setHmacSecret(GATEWAY_CONFIG.hmacSecret);
	config.setValidateOnly(false);
	return new GatewayClient(config);
}

/**
 * Route: Initiate payment
 * POST /payment/init
 * Body: { amount: number, currency: string, orderRef: string }
 */
app.post('/payment/init', async (req, res) => {
	try {
		const { amount, currency = 'LKR', orderRef } = req.body;

		if (!amount || !orderRef) {
			return res.status(400).json({
				error: 'Missing required fields: amount, orderRef'
			});
		}

		const client = createGatewayClient();

		// Build init request
		const initRequest = new PaymentInitRequest();
		initRequest.setClientId(GATEWAY_CONFIG.clientId);
		initRequest.setTransactionType(TransactionType.PURCHASE);
		initRequest.setClientRef(orderRef);
		initRequest.setComment(`Payment for order ${orderRef}`);
		initRequest.setTokenize(false);

		// Set amounts (convert to cents)
		const transactionAmount = new TransactionAmount();
		const amountInCents = Math.round(amount * 100);
		transactionAmount.setTotalAmount(amountInCents);
		transactionAmount.setServiceFeeAmount(0);
		transactionAmount.setPaymentAmount(amountInCents);
		transactionAmount.setCurrency(currency);
		initRequest.setTransactionAmount(transactionAmount);

		// Set redirect URLs
		const redirect = new Redirect();
		const baseUrl = `${req.protocol}://${req.get('host')}`;
		redirect.setReturnUrl(`${baseUrl}/payment/return`);
		redirect.setCancelUrl(`${baseUrl}/payment/cancel`);
		redirect.setReturnMethod('POST');
		initRequest.setRedirect(redirect);

		// Initialize payment
		const response = await client.payment().init(initRequest);

		res.json({
			success: true,
			reqid: response.responseData.reqid,
			paymentPageUrl: response.responseData.paymentPageUrl,
			expireAt: response.responseData.expireAt
		});

	} catch (error) {
		console.error('Payment init error:', error);
		res.status(500).json({
			error: 'Payment initialization failed',
			message: error.message
		});
	}
});

/**
 * Route: Payment return callback
 * POST /payment/return
 * Body: { reqid: string } (sent by payment gateway)
 */
app.post('/payment/return', async (req, res) => {
	try {
		const { reqid } = req.body;

		if (!reqid) {
			return res.status(400).send('Missing reqid parameter');
		}

		const client = createGatewayClient();

		// Complete payment
		const completeRequest = new PaymentCompleteRequest();
		completeRequest.setClientId(GATEWAY_CONFIG.clientId);
		completeRequest.setReqid(reqid);

		const response = await client.payment().complete(completeRequest);

		// Check if payment was successful
		const successCodes = ['00', '08', '11']; // Configure your success codes
		const isSuccess = successCodes.includes(response.responseData.responseCode);

		if (isSuccess) {
			// Payment successful - update your database, send confirmation email, etc.
			res.send(`
        <html>
          <head><title>Payment Successful</title></head>
          <body>
            <h1>Payment Successful!</h1>
            <p>Transaction Reference: ${response.responseData.txnReference}</p>
            <p>Amount: ${response.responseData.transactionAmount.paymentAmount / 100} ${response.responseData.transactionAmount.currency}</p>
            <a href="/">Return to Home</a>
          </body>
        </html>
      `);
		} else {
			// Payment failed
			res.send(`
        <html>
          <head><title>Payment Failed</title></head>
          <body>
            <h1>Payment Failed</h1>
            <p>Response: ${response.responseData.responseText}</p>
            <a href="/">Return to Home</a>
          </body>
        </html>
      `);
		}

	} catch (error) {
		console.error('Payment completion error:', error);
		res.status(500).send('Payment verification failed');
	}
});

/**
 * Route: Payment cancel callback
 * GET /payment/cancel
 */
app.get('/payment/cancel', (req, res) => {
	res.send(`
    <html>
      <head><title>Payment Cancelled</title></head>
      <body>
        <h1>Payment Cancelled</h1>
        <p>You have cancelled the payment.</p>
        <a href="/">Return to Home</a>
      </body>
    </html>
  `);
});

/**
 * Route: Simple payment form
 * GET /
 */
app.get('/', (req, res) => {
	res.send(`
    <html>
      <head><title>Payment Gateway Demo</title></head>
      <body>
        <h1>Paycorp Payment Gateway Demo</h1>
        <form action="/payment/init" method="POST">
          <label>Amount: <input type="number" name="amount" step="0.01" value="100.00" required /></label><br/>
          <label>Currency: <input type="text" name="currency" value="LKR" required /></label><br/>
          <label>Order Ref: <input type="text" name="orderRef" value="ORDER-${Date.now()}" required /></label><br/>
          <button type="submit">Pay Now</button>
        </form>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`\nPaycorp Gateway Demo Server running on http://localhost:${PORT}`);
	console.log('Configure your environment variables or update GATEWAY_CONFIG in the code\n');
});
