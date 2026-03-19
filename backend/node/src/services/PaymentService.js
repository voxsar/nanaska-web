import { BaseFacade } from './BaseFacade.js';
import { Operation } from '../enums/Operation.js';
import { PaymentInitJsonHelper } from '../helpers/PaymentInitJsonHelper.js';
import { PaymentCompleteJsonHelper } from '../helpers/PaymentCompleteJsonHelper.js';

/**
 * Payment service facade
 */
export class PaymentService extends BaseFacade {
	constructor(config) {
		super(config);
	}

	/**
	 * Initialize a payment and get payment page URL
	 * @param {PaymentInitRequest} request - Payment initialization request
	 * @returns {Promise<Object>} Response with paymentPageUrl
	 */
	async init(request) {
		const jsonHelper = new PaymentInitJsonHelper();
		return await this.process(request, Operation.PAYMENT_INIT, jsonHelper);
	}

	/**
	 * Complete a payment and get transaction details
	 * @param {PaymentCompleteRequest} request - Payment completion request
	 * @returns {Promise<Object>} Response with transaction details
	 */
	async complete(request) {
		const jsonHelper = new PaymentCompleteJsonHelper();
		return await this.process(request, Operation.PAYMENT_COMPLETE, jsonHelper);
	}

	/**
	 * Process real-time payment
	 * @param {Object} request - Real-time payment request
	 * @returns {Promise<Object>} Response
	 */
	async realTime(request) {
		// Placeholder - implement PaymentRealTimeJsonHelper if needed
		throw new Error('Real-time payment not yet implemented');
	}

	/**
	 * Process batch payment
	 * @param {Object} request - Batch payment request
	 * @returns {Promise<Object>} Response
	 */
	async batch(request) {
		// Placeholder - implement PaymentBatchJsonHelper if needed
		throw new Error('Batch payment not yet implemented');
	}
}
