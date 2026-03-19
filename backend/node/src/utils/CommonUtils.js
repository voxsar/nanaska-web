import crypto from 'crypto';

/**
 * Common utility functions
 */
export class CommonUtils {
	/**
	 * Generate a GUID/UUID
	 * @returns {string} UUID string
	 */
	static generateGUID() {
		return crypto.randomUUID();
	}
}
