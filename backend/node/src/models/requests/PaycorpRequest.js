import { Version } from '../../enums/Version.js';
import { CommonUtils } from '../../utils/CommonUtils.js';

/**
 * Base request wrapper for all Paycorp API requests
 */
export class PaycorpRequest {
	constructor() {
		this.api = 'Node.js';
		this.version = Version.VERSION_LATEST;
		this.msgId = CommonUtils.generateGUID();
		this.operation = null;
		this.requestDate = null;
		this.validateOnly = false;
		this.requestData = null;
	}

	getApi() {
		return this.api;
	}

	setApi(api) {
		this.api = api;
	}

	getVersion() {
		return this.version;
	}

	setVersion(version) {
		this.version = version;
	}

	getMsgId() {
		return this.msgId;
	}

	setMsgId(msgId) {
		this.msgId = msgId;
	}

	getOperation() {
		return this.operation;
	}

	setOperation(operation) {
		this.operation = operation;
	}

	getRequestDate() {
		return this.requestDate;
	}

	setRequestDate(requestDate) {
		this.requestDate = requestDate;
	}

	getValidateOnly() {
		return this.validateOnly;
	}

	setValidateOnly(validateOnly) {
		this.validateOnly = validateOnly;
	}

	getRequestData() {
		return this.requestData;
	}

	setRequestData(requestData) {
		this.requestData = requestData;
	}
}
