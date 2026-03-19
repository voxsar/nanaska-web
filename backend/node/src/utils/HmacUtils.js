import crypto from 'crypto';

/**
 * Utility for generating HMAC signatures
 */
export class HmacUtils {
	/**
	 * Generate HMAC-SHA256 signature
	 * @param {string} secret - HMAC secret key
	 * @param {string} data - Data to sign
	 * @returns {string} HMAC signature in hex format
	 */
	static generateHmac(secret, data) {
		return crypto
			.createHmac('sha256', secret)
			.update(data, 'utf8')
			.digest('hex');
	}
}
