# Paycorp Sampath Bank IPG - Node.js Client

Node.js client library for integrating with Paycorp Sampath Bank Internet Payment Gateway (IPG). This is a standalone implementation that does not depend on any e-commerce platform.

## Features

- ✅ Payment initialization and completion
- ✅ HMAC-SHA256 authentication
- ✅ Transaction amount management
- ✅ Redirect-based payment flow
- ✅ Credit card tokenization support (Vault service)
- ✅ Transaction reporting
- ✅ Full TypeScript-ready with ES6 modules
- ✅ Zero WooCommerce dependencies

## Installation

```bash
cd node
npm install
```

## Quick Start

### 1. Configure the Client

```javascript
import { GatewayClient, ClientConfig } from './src/index.js';

const config = new ClientConfig();
config.setServiceEndpoint('https://sampath.paycorp.lk/rest/service/proxy');
config.setAuthToken('YOUR_AUTH_TOKEN');
config.setHmacSecret('YOUR_HMAC_SECRET');
config.setValidateOnly(false);

const client = new GatewayClient(config);
```

### 2. Initialize a Payment

```javascript
import { 
  PaymentInitRequest, 
  TransactionAmount, 
  Redirect, 
  TransactionType 
} from './src/index.js';

// Create payment request
const initRequest = new PaymentInitRequest();
initRequest.setClientId('YOUR_CLIENT_ID');
initRequest.setTransactionType(TransactionType.PURCHASE);
initRequest.setClientRef('ORDER-12345');
initRequest.setComment('Product purchase');
initRequest.setTokenize(false);

// Set amounts (in cents)
const amount = new TransactionAmount();
amount.setTotalAmount(10000);      // $100.00
amount.setPaymentAmount(10000);
amount.setServiceFeeAmount(0);
amount.setCurrency('LKR');
initRequest.setTransactionAmount(amount);

// Set redirect URLs
const redirect = new Redirect();
redirect.setReturnUrl('https://yoursite.com/payment/return');
redirect.setCancelUrl('https://yoursite.com/payment/cancel');
redirect.setReturnMethod('POST');
initRequest.setRedirect(redirect);

// Initialize payment
const response = await client.payment().init(initRequest);
console.log('Payment URL:', response.responseData.paymentPageUrl);

// Redirect user to payment page
// window.location.href = response.responseData.paymentPageUrl;
```

### 3. Complete the Payment

After the user completes payment, they'll be redirected to your return URL with a `reqid` parameter:

```javascript
import { PaymentCompleteRequest } from './src/index.js';

// Get reqid from return URL
const reqid = req.body.reqid; // or req.query.reqid

// Complete payment
const completeRequest = new PaymentCompleteRequest();
completeRequest.setClientId('YOUR_CLIENT_ID');
completeRequest.setReqid(reqid);

const response = await client.payment().complete(completeRequest);

// Check response
if (response.responseData.responseCode === '00') {
  console.log('Payment successful!');
  console.log('Transaction Ref:', response.responseData.txnReference);
} else {
  console.log('Payment failed:', response.responseData.responseText);
}
```

## Payment Flow

1. **Initialize Payment**: Create a payment session and get a payment page URL
2. **Redirect User**: Send user to the payment page URL
3. **User Pays**: User enters card details and completes payment on Paycorp's secure page
4. **Return Callback**: Gateway redirects user back to your return URL with `reqid`
5. **Complete Payment**: Call complete endpoint with `reqid` to get transaction details

## Examples

### Basic Payment Example

```bash
node examples/payment-init.js
```

### Express.js Integration

A complete Express.js server example with payment initialization and callback handling:

```bash
# Install express for the example
npm install express --save-dev

# Run the server
node examples/express-integration.js
```

Then visit `http://localhost:3000` to test the integration.

## Project Structure

```
node/
├── src/
│   ├── client/           # Main GatewayClient
│   ├── config/           # ClientConfig
│   ├── enums/            # Constants (TransactionType, Operation, Version)
│   ├── models/
│   │   ├── components/   # TransactionAmount, Redirect, CreditCard, etc.
│   │   ├── requests/     # Request models
│   │   └── responses/    # Response models
│   ├── services/         # PaymentService, VaultService, ReportService
│   ├── utils/            # HmacUtils, RestClient, CommonUtils
│   ├── helpers/          # JSON serialization helpers
│   └── index.js          # Main exports
├── examples/             # Usage examples
├── tests/                # Unit tests (to be implemented)
├── package.json
└── README.md
```

## API Reference

### GatewayClient

Main entry point for all gateway operations.

```javascript
const client = new GatewayClient(config);
client.payment()  // PaymentService
client.vault()    // VaultService
client.report()   // ReportService
```

### PaymentService

```javascript
await client.payment().init(request)      // Initialize payment
await client.payment().complete(request)  // Complete payment
await client.payment().realTime(request)  // Real-time payment (not implemented)
await client.payment().batch(request)     // Batch payment (not implemented)
```

### Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `serviceEndpoint` | string | Yes | Payment gateway API endpoint |
| `authToken` | string | Yes | Authentication token |
| `hmacSecret` | string | Yes | HMAC secret key for request signing |
| `clientId` | string | Yes | Merchant client ID |
| `validateOnly` | boolean | No | Validation mode (default: false) |

### Transaction Types

- `TransactionType.PURCHASE` - Standard purchase
- `TransactionType.AUTHORISATION` - Authorization only
- `TransactionType.REFUND` - Refund transaction
- `TransactionType.REVERSAL` - Reversal transaction

### Response Codes

Common response codes (check with your payment gateway documentation):

- `00` - Successful
- `08` - Honour with ID
- `11` - Approved VIP
- Other codes indicate various error conditions

## Environment Variables

You can use environment variables for configuration:

```bash
export PAYCORP_SERVICE_ENDPOINT="https://sampath.paycorp.lk/rest/service/proxy"
export PAYCORP_AUTH_TOKEN="your_auth_token"
export PAYCORP_HMAC_SECRET="your_hmac_secret"
export PAYCORP_CLIENT_ID="your_client_id"
```

## Security Notes

1. **Never expose credentials**: Keep `authToken`, `hmacSecret`, and `clientId` secure
2. **Use HTTPS**: Always use HTTPS for your return/cancel URLs
3. **Verify HMAC**: The gateway uses HMAC to sign requests - this is handled automatically
4. **Validate amounts**: Always validate transaction amounts on your server
5. **Store transaction data**: Keep records of all transactions for reconciliation

## Testing

To test with the sandbox environment:

1. Get sandbox credentials from Paycorp
2. Update the `serviceEndpoint` to the sandbox URL
3. Use test card numbers provided by Paycorp

## Troubleshooting

### HMAC Authentication Fails

- Verify your `hmacSecret` is correct
- Ensure the request JSON is properly formatted
- Check that the date/time format matches the expected format

### Payment Page URL Not Generated

- Check your `clientId` is correct
- Verify the `serviceEndpoint` URL
- Ensure all required fields are provided

### Complete Payment Fails

- Verify the `reqid` parameter is being passed correctly
- Check that you're calling complete with the same `clientId` used for init

## Differences from PHP Version

This Node.js implementation:
- Uses ES6 modules instead of PHP classes
- Uses `axios` for HTTP requests instead of cURL
- Uses Node.js `crypto` module for HMAC generation
- Follows async/await patterns instead of synchronous PHP
- Does not include WooCommerce-specific code

## License

This implementation is based on the Paycorp PHP client library. Check with Paycorp for licensing terms.

## Support

For API documentation and support, contact Paycorp International.

## Contributing

This is a standalone implementation. To add features:

1. Add new request/response models in `src/models/`
2. Add JSON helpers in `src/helpers/`
3. Extend services in `src/services/`
4. Add examples in `examples/`

## Roadmap

- [ ] Implement VaultService methods (storeCard, retrieveCard, etc.)
- [ ] Implement ReportService methods (basic, settlement)
- [ ] Add comprehensive unit tests
- [ ] Add TypeScript definitions
- [ ] Add request validation
- [ ] Add retry logic for network errors
- [ ] Add logging/debugging capabilities
