/**
 * Payment initialization response
 */
export class PaymentInitResponse {
	constructor() {
		this.reqid = null;
		this.expireAt = null;
		this.paymentPageUrl = null;
	}

	getReqid() {
		return this.reqid;
	}

	setReqid(reqid) {
		this.reqid = reqid;
	}

	getExpireAt() {
		return this.expireAt;
	}

	setExpireAt(expireAt) {
		this.expireAt = expireAt;
	}

	getPaymentPageUrl() {
		return this.paymentPageUrl;
	}

	setPaymentPageUrl(paymentPageUrl) {
		this.paymentPageUrl = paymentPageUrl;
	}
}
