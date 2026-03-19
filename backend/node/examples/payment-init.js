import {
	GatewayClient,
	ClientConfig,
	PaymentInitRequest,
	TransactionAmount,
	Redirect,
	TransactionType
} from '../src/index.js';

/**
 * Example: Initialize a payment and get payment page URL
 */
async function initializePayment() {
	try {
		// 1. Configure the client
		const config = new ClientConfig();
		config.setServiceEndpoint('https://sampath.paycorp.lk/rest/service/proxy');
		config.setAuthToken('YOUR_AUTH_TOKEN');
		config.setHmacSecret('YOUR_HMAC_SECRET');
		config.setValidateOnly(false);

		// 2. Create gateway client
		const client = new GatewayClient(config);

		// 3. Build payment init request
		const initRequest = new PaymentInitRequest();
		initRequest.setClientId('YOUR_CLIENT_ID');
		initRequest.setTransactionType(TransactionType.PURCHASE);
		initRequest.setClientRef(`ORDER-${Date.now()}`);
		initRequest.setComment('Test payment');
		initRequest.setTokenize(false);

		// 4. Set transaction amounts (amounts in cents)
		const transactionAmount = new TransactionAmount();
		transactionAmount.setTotalAmount(10000);      // $100.00
		transactionAmount.setServiceFeeAmount(0);     // $0.00
		transactionAmount.setPaymentAmount(10000);    // $100.00
		transactionAmount.setCurrency('LKR');
		initRequest.setTransactionAmount(transactionAmount);

		// 5. Set redirect URLs
		const redirect = new Redirect();
		redirect.setReturnUrl('https://yoursite.com/payment/return');
		redirect.setCancelUrl('https://yoursite.com/payment/cancel');
		redirect.setReturnMethod('POST');
		initRequest.setRedirect(redirect);

		// 6. Initialize payment
		const response = await client.payment().init(initRequest);

		console.log('Payment initialized successfully!');
		console.log('Request ID:', response.responseData.reqid);
		console.log('Payment Page URL:', response.responseData.paymentPageUrl);
		console.log('Expires At:', response.responseData.expireAt);

		// 7. Redirect user to payment page
		console.log('\nRedirect user to:', response.responseData.paymentPageUrl);

		return response;

	} catch (error) {
		console.error('Error initializing payment:', error.message);
		if (error.response) {
			console.error('Response data:', error.response.data);
		}
		throw error;
	}
}

// Run the example
initializePayment()
	.then(() => console.log('\nPayment initialization complete'))
	.catch(() => console.log('\nPayment initialization failed'));
