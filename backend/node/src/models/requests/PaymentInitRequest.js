import { TransactionType } from '../../enums/TransactionType.js';

/**
 * Payment initialization request
 */
export class PaymentInitRequest {
	constructor() {
		this.clientId = null;
		this.clientIdHash = null;
		this.transactionType = TransactionType.PURCHASE;
		this.transactionAmount = null;
		this.redirect = null;
		this.clientRef = null;
		this.comment = null;
		this.tokenize = null;
		this.tokenReference = null;
		this.cssLocation1 = null;
		this.cssLocation2 = null;
		this.useReliability = true;
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

	getTransactionAmount() {
		return this.transactionAmount;
	}

	setTransactionAmount(transactionAmount) {
		this.transactionAmount = transactionAmount;
	}

	getRedirect() {
		return this.redirect;
	}

	setRedirect(redirect) {
		this.redirect = redirect;
	}

	getClientRef() {
		return this.clientRef;
	}

	setClientRef(clientRef) {
		this.clientRef = clientRef;
	}

	getComment() {
		return this.comment;
	}

	setComment(comment) {
		this.comment = comment;
	}

	getTokenize() {
		return this.tokenize;
	}

	setTokenize(tokenize) {
		this.tokenize = tokenize;
	}

	getTokenReference() {
		return this.tokenReference;
	}

	setTokenReference(tokenReference) {
		this.tokenReference = tokenReference;
	}

	getCssLocation1() {
		return this.cssLocation1;
	}

	setCssLocation1(cssLocation1) {
		this.cssLocation1 = cssLocation1;
	}

	getCssLocation2() {
		return this.cssLocation2;
	}

	setCssLocation2(cssLocation2) {
		this.cssLocation2 = cssLocation2;
	}

	isUseReliability() {
		return this.useReliability;
	}

	setUseReliability(useReliability) {
		this.useReliability = useReliability;
	}

	getExtraData() {
		return this.extraData;
	}

	setExtraData(extraData) {
		this.extraData = extraData;
	}
}
