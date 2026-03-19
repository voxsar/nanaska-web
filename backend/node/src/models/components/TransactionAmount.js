/**
 * Transaction amount details
 */
export class TransactionAmount {
	constructor() {
		this.totalAmount = null;
		this.paymentAmount = null;
		this.serviceFeeAmount = null;
		this.withholdingAmount = null;
		this.currency = null;
	}

	getTotalAmount() {
		return this.totalAmount;
	}

	setTotalAmount(totalAmount) {
		this.totalAmount = totalAmount;
	}

	getPaymentAmount() {
		return this.paymentAmount;
	}

	setPaymentAmount(paymentAmount) {
		this.paymentAmount = paymentAmount;
	}

	getServiceFeeAmount() {
		return this.serviceFeeAmount;
	}

	setServiceFeeAmount(serviceFeeAmount) {
		this.serviceFeeAmount = serviceFeeAmount;
	}

	getWithholdingAmount() {
		return this.withholdingAmount;
	}

	setWithholdingAmount(withholdingAmount) {
		this.withholdingAmount = withholdingAmount;
	}

	getCurrency() {
		return this.currency;
	}

	setCurrency(currency) {
		this.currency = currency;
	}
}
