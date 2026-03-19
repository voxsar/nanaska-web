import { BaseFacade } from './BaseFacade.js';
import { Operation } from '../enums/Operation.js';

/**
 * Report service facade
 */
export class ReportService extends BaseFacade {
	constructor(config) {
		super(config);
	}

	/**
	 * Get basic report
	 * @param {Object} request - Basic report request
	 * @returns {Promise<Object>} Response
	 */
	async basic(request) {
		// Placeholder - implement BasicReportJsonHelper if needed
		throw new Error('Basic report not yet implemented');
	}

	/**
	 * Get settlement report
	 * @param {Object} request - Settlement report request
	 * @returns {Promise<Object>} Response
	 */
	async settlement(request) {
		// Placeholder - implement SettlementReportJsonHelper if needed
		throw new Error('Settlement report not yet implemented');
	}
}
