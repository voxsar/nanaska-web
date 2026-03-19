/**
 * Client configuration for Paycorp Gateway
 */
export class ClientConfig {
	constructor() {
		this.serviceEndpoint = null;
		this.proxyHost = null;
		this.proxyPort = null;
		this.authToken = null;
		this.hmacSecret = null;
		this.validateOnly = false;
	}

	getServiceEndpoint() {
		return this.serviceEndpoint;
	}

	setServiceEndpoint(serviceEndpoint) {
		this.serviceEndpoint = serviceEndpoint;
	}

	getProxyHost() {
		return this.proxyHost;
	}

	setProxyHost(proxyHost) {
		this.proxyHost = proxyHost;
	}

	getProxyPort() {
		return this.proxyPort;
	}

	setProxyPort(proxyPort) {
		this.proxyPort = proxyPort;
	}

	getAuthToken() {
		return this.authToken;
	}

	setAuthToken(authToken) {
		this.authToken = authToken;
	}

	getHmacSecret() {
		return this.hmacSecret;
	}

	setHmacSecret(hmacSecret) {
		this.hmacSecret = hmacSecret;
	}

	isValidateOnly() {
		return this.validateOnly;
	}

	setValidateOnly(validateOnly) {
		this.validateOnly = validateOnly;
	}
}
