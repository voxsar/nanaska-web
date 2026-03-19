import axios from 'axios';

/**
 * REST client for making HTTP requests to the payment gateway
 */
export class RestClient {
	/**
	 * Send HTTP POST request to the gateway
	 * @param {Object} config - Client configuration
	 * @param {string} jsonRequest - JSON request body
	 * @param {Object} headers - HTTP headers
	 * @returns {Promise<string>} Response body as string
	 */
	static async sendRequest(config, jsonRequest, headers) {
		const headerObj = {};

		// Convert headers array to object
		headers.forEach(header => {
			const [key, value] = header.split(': ');
			headerObj[key] = value;
		});

		try {
			const response = await axios.post(
				config.getServiceEndpoint(),
				jsonRequest,
				{
					headers: headerObj,
					timeout: 60000, // 60 seconds
				}
			);

			return JSON.stringify(response.data);
		} catch (error) {
			if (error.response) {
				// Server responded with error status
				return JSON.stringify(error.response.data);
			}
			throw error;
		}
	}
}
