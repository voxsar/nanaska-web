import { PaymentCompleteResponse } from '../models/responses/PaymentCompleteResponse.js';
import { CreditCard } from '../models/components/CreditCard.js';
import { TransactionAmount } from '../models/components/TransactionAmount.js';

/**
 * JSON helper for payment completion
 */
export class PaymentCompleteJsonHelper {
	/**
	 * Convert JSON response to PaymentCompleteResponse object
	 * @param {Object} responseData - JSON response data
	 * @returns {PaymentCompleteResponse}
	 */
	fromJson(responseData) {
		const paymentCompleteResponse = new PaymentCompleteResponse();

		paymentCompleteResponse.setClientId(responseData.responseData.clientId);
		paymentCompleteResponse.setClientIdHash(responseData.responseData.clientIdHash);
		paymentCompleteResponse.setTransactionType(responseData.responseData.transactionType);

		const creditCard = new CreditCard();
		creditCard.setType(responseData.responseData.creditCard.type);
		creditCard.setHolderName(responseData.responseData.creditCard.holderName);
		creditCard.setNumber(responseData.responseData.creditCard.number);
		creditCard.setExpiry(responseData.responseData.creditCard.expiry);
		paymentCompleteResponse.setCreditCard(creditCard);

		const transactionAmount = new TransactionAmount();
		transactionAmount.setTotalAmount(responseData.responseData.transactionAmount.totalAmount);
		transactionAmount.setPaymentAmount(responseData.responseData.transactionAmount.paymentAmount);
		transactionAmount.setServiceFeeAmount(responseData.responseData.transactionAmount.serviceFeeAmount);
		transactionAmount.setWithholdingAmount(responseData.responseData.transactionAmount.withholdingAmount);
		transactionAmount.setCurrency(responseData.responseData.transactionAmount.currency);
		paymentCompleteResponse.setTransactionAmount(transactionAmount);

		paymentCompleteResponse.setTxnReference(responseData.responseData.txnReference);
		paymentCompleteResponse.setFeeReference(responseData.responseData.feeReference);
		paymentCompleteResponse.setResponseCode(responseData.responseData.responseCode);
		paymentCompleteResponse.setResponseText(responseData.responseData.responseText);
		paymentCompleteResponse.setSettlementDate(responseData.responseData.settlementDate);
		paymentCompleteResponse.setToken(responseData.responseData.token);
		paymentCompleteResponse.setTokenized(responseData.responseData.tokenized);
		paymentCompleteResponse.setTokenResponseText(responseData.responseData.tokenResponseText);
		paymentCompleteResponse.setAuthCode(responseData.responseData.authCode);
		paymentCompleteResponse.setCvcResponse(responseData.responseData.cvcResponse);
		paymentCompleteResponse.setExtraData([responseData.responseData.extraData]);

		return paymentCompleteResponse;
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
		const reqid = requestData.getReqid();

		return {
			version: version,
			msgId: msgId,
			operation: operation,
			requestDate: requestDate,
			validateOnly: validateOnly,
			requestData: {
				clientId: clientId,
				reqid: reqid
			}
		};
	}
}
