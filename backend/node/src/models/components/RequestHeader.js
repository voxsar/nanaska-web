/**
 * Request header with authentication details
 */
export class RequestHeader {
	constructor() {
		this.authToken = null;
		this.hmac = null;
	}

	getAuthToken() {
		return this.authToken;
	}

	setAuthToken(authToken) {
		this.authToken = authToken;
	}

	getHmac() {
		return this.hmac;
	}

	setHmac(hmac) {
		this.hmac = hmac;
	}
}
