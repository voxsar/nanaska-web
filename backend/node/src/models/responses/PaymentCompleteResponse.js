/**
 * Payment completion response
 */
export class PaymentCompleteResponse {
	constructor() {
		this.clientId = null;
		this.clientIdHash = null;
		this.transactionType = null;
		this.creditCard = null;
		this.transactionAmount = null;
		this.txnReference = null;
		this.feeReference = null;
		this.responseCode = null;
		this.responseText = null;
		this.settlementDate = null;
		this.token = null;
		this.tokenized = null;
		this.tokenResponseText = null;
		this.authCode = null;
		this.cvcResponse = null;
		this.extraData = null;
	}

	getClientId() {
		return this.clientId;
	}

	setClientId(clientId) {
		this.clientId = clientId;
	}

	getClientIdHash() {
		return this.clientIdHash;
	}

	setClientIdHash(clientIdHash) {
		this.clientIdHash = clientIdHash;
	}

	getTransactionType() {
		return this.transactionType;
	}

	setTransactionType(transactionType) {
		this.transactionType = transactionType;
	}

	getCreditCard() {
		return this.creditCard;
	}

	setCreditCard(creditCard) {
		this.creditCard = creditCard;
	}

	getTransactionAmount() {
		return this.transactionAmount;
	}

	setTransactionAmount(transactionAmount) {
		this.transactionAmount = transactionAmount;
	}

	getTxnReference() {
		return this.txnReference;
	}

	setTxnReference(txnReference) {
		this.txnReference = txnReference;
	}

	getFeeReference() {
		return this.feeReference;
	}

	setFeeReference(feeReference) {
		this.feeReference = feeReference;
	}

	getResponseCode() {
		return this.responseCode;
	}

	setResponseCode(responseCode) {
		this.responseCode = responseCode;
	}

	getResponseText() {
		return this.responseText;
	}

	setResponseText(responseText) {
		this.responseText = responseText;
	}

	getSettlementDate() {
		return this.settlementDate;
	}

	setSettlementDate(settlementDate) {
		this.settlementDate = settlementDate;
	}

	getToken() {
		return this.token;
	}

	setToken(token) {
		this.token = token;
	}

	getTokenized() {
		return this.tokenized;
	}

	setTokenized(tokenized) {
		this.tokenized = tokenized;
	}

	getTokenResponseText() {
		return this.tokenResponseText;
	}

	setTokenResponseText(tokenResponseText) {
		this.tokenResponseText = tokenResponseText;
	}

	getAuthCode() {
		return this.authCode;
	}

	setAuthCode(authCode) {
		this.authCode = authCode;
	}

	getCvcResponse() {
		return this.cvcResponse;
	}

	setCvcResponse(cvcResponse) {
		this.cvcResponse = cvcResponse;
	}

	getExtraData() {
		return this.extraData;
	}

	setExtraData(extraData) {
		this.extraData = extraData;
	}
}
