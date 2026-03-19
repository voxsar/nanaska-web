/**
 * Redirect configuration for payment pages
 */
export class Redirect {
	constructor() {
		this.returnUrl = null;
		this.cancelUrl = null;
		this.returnMethod = null;
	}

	getReturnUrl() {
		return this.returnUrl;
	}

	setReturnUrl(returnUrl) {
		this.returnUrl = returnUrl;
	}

	getCancelUrl() {
		return this.cancelUrl;
	}

	setCancelUrl(cancelUrl) {
		this.cancelUrl = cancelUrl;
	}

	getReturnMethod() {
		return this.returnMethod;
	}

	setReturnMethod(returnMethod) {
		this.returnMethod = returnMethod;
	}
}
