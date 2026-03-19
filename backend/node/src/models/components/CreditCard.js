/**
 * Credit card details
 */
export class CreditCard {
	constructor() {
		this.type = null;
		this.holderName = null;
		this.number = null;
		this.expiry = null;
		this.secureId = null;
		this.secureIdSupplied = null;
		this.track1 = null;
		this.track2 = null;
		this.track3 = null;
		this.cardChipData = null;
	}

	getType() {
		return this.type;
	}

	setType(type) {
		this.type = type;
	}

	getHolderName() {
		return this.holderName;
	}

	setHolderName(holderName) {
		this.holderName = holderName;
	}

	getNumber() {
		return this.number;
	}

	setNumber(number) {
		this.number = number;
	}

	getExpiry() {
		return this.expiry;
	}

	setExpiry(expiry) {
		this.expiry = expiry;
	}

	getSecureId() {
		return this.secureId;
	}

	setSecureId(secureId) {
		this.secureId = secureId;
	}

	getSecureIdSupplied() {
		return this.secureIdSupplied;
	}

	setSecureIdSupplied(secureIdSupplied) {
		this.secureIdSupplied = secureIdSupplied;
	}
}
