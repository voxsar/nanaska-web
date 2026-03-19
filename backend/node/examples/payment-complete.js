import {
	GatewayClient,
	ClientConfig,
	PaymentCompleteRequest
} from '../src/index.js';

/**
 * Example: Complete a payment after user returns from payment page
 */
async function completePayment(reqid) {
	try {
		// 1. Configure the client
		const config = new ClientConfig();
		config.setServiceEndpoint('https://sampath.paycorp.lk/rest/service/proxy');
		config.setAuthToken('YOUR_AUTH_TOKEN');
		config.setHmacSecret('YOUR_HMAC_SECRET');
		config.setValidateOnly(false);

		// 2. Create gateway client
		const client = new GatewayClient(config);

		// 3. Build payment complete request
		const completeRequest = new PaymentCompleteRequest();
		completeRequest.setClientId('YOUR_CLIENT_ID');
		completeRequest.setReqid(reqid);

		// 4. Complete payment
		const response = await client.payment().complete(completeRequest);

		console.log('Payment completed successfully!');
		console.log('\n=== Transaction Details ===');
		console.log('Transaction Reference:', response.responseData.txnReference);
		console.log('Response Code:', response.responseData.responseCode);
		console.log('Response Text:', response.responseData.responseText);
		console.log('Settlement Date:', response.responseData.settlementDate);

		console.log('\n=== Amount Details ===');
		console.log('Total Amount:', response.responseData.transactionAmount.totalAmount);
		console.log('Payment Amount:', response.responseData.transactionAmount.paymentAmount);
		console.log('Currency:', response.responseData.transactionAmount.currency);

		console.log('\n=== Card Details ===');
		console.log('Card Type:', response.responseData.creditCard.type);
		console.log('Card Number:', response.responseData.creditCard.number);
		console.log('Card Holder:', response.responseData.creditCard.holderName);

		// Check if payment was successful
		const successCodes = ['00', '08', '11']; // Add your success codes
		const isSuccess = successCodes.includes(response.responseData.responseCode);

		if (isSuccess) {
			console.log('\n✓ Payment successful!');
		} else {
			console.log('\n✗ Payment failed or declined');
		}

		return response;

	} catch (error) {
		console.error('Error completing payment:', error.message);
		if (error.response) {
			console.error('Response data:', error.response.data);
		}
		throw error;
	}
}

// Example usage - get reqid from query parameters in your return URL handler
const reqid = process.argv[2] || 'EXAMPLE_REQID_FROM_RETURN_URL';

completePayment(reqid)
	.then(() => console.log('\nPayment completion check finished'))
	.catch(() => console.log('\nPayment completion check failed'));
