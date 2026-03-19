import { PaymentInitResponse } from '../models/responses/PaymentInitResponse.js';

/**
 * JSON helper for payment initialization
 */
export class PaymentInitJsonHelper {
	/**
	 * Convert JSON response to PaymentInitResponse object
	 * @param {Object} responseData - JSON response data
	 * @returns {PaymentInitResponse}
	 */
	fromJson(responseData) {
		const paymentInitResponse = new PaymentInitResponse();
		paymentInitResponse.setReqid(responseData.responseData.reqid);
		paymentInitResponse.setExpireAt(responseData.responseData.expireAt);
		paymentInitResponse.setPaymentPageUrl(responseData.responseData.paymentPageUrl);
		return paymentInitResponse;
	}

	/**
	 * Convert PaycorpRequest to JSON object
	 * @param {PaycorpRequest} paycorpRequest - Request wrapper
	 * @returns {Object} JSON object
	 */
	toJson(paycorpRequest) {
		const version = paycorpRequest.getVersion();
		const msgId = paycorpRequest.getMsgId();
		const operation = paycorpRequest.getOperation();
		const requestDate = paycorpRequest.getRequestDate();
		const validateOnly = paycorpRequest.getValidateOnly();
		const requestData = paycorpRequest.getRequestData();

		const clientId = requestData.getClientId();
		const clientIdHash = requestData.getClientIdHash();
		const transactionType = requestData.getTransactionType();
		const clientRef = requestData.getClientRef();
		const comment = requestData.getComment();
		const tokenize = requestData.getTokenize();
		const tokenReference = requestData.getTokenReference();
		const cssLocation1 = requestData.getCssLocation1();
		const cssLocation2 = requestData.getCssLocation2();
		const useReliability = requestData.isUseReliability();
		const extraData = requestData.getExtraData();

		const transactionAmount = requestData.getTransactionAmount();
		const totalAmount = transactionAmount.getTotalAmount();
		const paymentAmount = transactionAmount.getPaymentAmount();
		const serviceFeeAmount = transactionAmount.getServiceFeeAmount();
		const currency = transactionAmount.getCurrency();

		const redirect = requestData.getRedirect();
		const returnUrl = redirect.getReturnUrl();
		const cancelUrl = redirect.getCancelUrl();
		const returnMethod = redirect.getReturnMethod();

		return {
			version: version,
			msgId: msgId,
			operation: operation,
			requestDate: requestDate,
			validateOnly: validateOnly,
			requestData: {
				clientId: clientId,
				clientIdHash: clientIdHash,
				transactionType: transactionType,
				transactionAmount: {
					totalAmount: totalAmount,
					paymentAmount: paymentAmount,
					serviceFeeAmount: serviceFeeAmount,
					currency: currency
				},
				redirect: {
					returnUrl: returnUrl,
					cancelUrl: cancelUrl,
					returnMethod: returnMethod
				},
				clientRef: clientRef,
				comment: comment,
				tokenize: tokenize,
				tokenReference: tokenReference,
				cssLocation1: cssLocation1,
				cssLocation2: cssLocation2,
				useReliability: useReliability,
				extraData: extraData
			}
		};
	}
}
