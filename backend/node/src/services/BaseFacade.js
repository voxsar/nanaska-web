import { PaycorpRequest } from '../models/requests/PaycorpRequest.js';
import { RequestHeader } from '../models/components/RequestHeader.js';
import { HmacUtils } from '../utils/HmacUtils.js';
import { RestClient } from '../utils/RestClient.js';

/**
 * Base facade for processing gateway requests
 */
export class BaseFacade {
	constructor(config) {
		this.config = config;
	}

	/**
	 * Process a request through the gateway
	 * @param {Object} request - Request data object
	 * @param {string} operation - Operation type
	 * @param {Object} jsonHelper - JSON serialization helper
	 * @returns {Promise<Object>} Response object
	 */
	async process(request, operation, jsonHelper) {
		const jsonRequest = this.buildRequest(request, operation, jsonHelper);
		const headers = this.buildHeaders(jsonRequest);

		const jsonResponse = await RestClient.sendRequest(this.config, jsonRequest, headers);

		// Return raw JSON object (similar to PHP implementation)
		return JSON.parse(jsonResponse);
	}

	/**
	 * Build request headers with authentication
	 * @param {string} request - JSON request string
	 * @returns {Array<string>} Array of header strings
	 */
	buildHeaders(request) {
		const header = new RequestHeader();
		header.setAuthToken(this.config.getAuthToken());
		header.setHmac(HmacUtils.generateHmac(this.config.getHmacSecret(), request));

		const headers = [];
		headers.push(`HMAC: ${header.getHmac()}`);
		headers.push(`AUTHTOKEN: ${header.getAuthToken()}`);
		headers.push('Content-Type: application/json');

		return headers;
	}

	/**
	 * Build JSON request from request data
	 * @param {Object} requestData - Request data object
	 * @param {string} operation - Operation type
	 * @param {Object} jsonHelper - JSON serialization helper
	 * @returns {string} JSON request string
	 */
	buildRequest(requestData, operation, jsonHelper) {
		const paycorpRequest = new PaycorpRequest();
		paycorpRequest.setOperation(operation);

		// Set current date/time in format: YYYY-MM-DD HH:MM:SS
		const now = new Date();
		const requestDate = now.getFullYear() + '-' +
			String(now.getMonth() + 1).padStart(2, '0') + '-' +
			String(now.getDate()).padStart(2, '0') + ' ' +
			String(now.getHours()).padStart(2, '0') + ':' +
			String(now.getMinutes()).padStart(2, '0') + ':' +
			String(now.getSeconds()).padStart(2, '0');

		paycorpRequest.setRequestDate(requestDate);
		paycorpRequest.setValidateOnly(this.config.isValidateOnly());
		paycorpRequest.setRequestData(requestData);

		const jsonRequest = jsonHelper.toJson(paycorpRequest);
		return JSON.stringify(jsonRequest);
	}
}
