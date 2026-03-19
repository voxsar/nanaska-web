/**
 * Payment completion request
 */
export class PaymentCompleteRequest {
	constructor() {
		this.clientId = null;
		this.reqid = null;
	}

	getClientId() {
		return this.clientId;
	}

	setClientId(clientId) {
		this.clientId = clientId;
	}

	getReqid() {
		return this.reqid;
	}

	setReqid(reqid) {
		this.reqid = reqid;
	}
}
