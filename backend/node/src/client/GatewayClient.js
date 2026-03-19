import { PaymentService } from '../services/PaymentService.js';
import { VaultService } from '../services/VaultService.js';
import { ReportService } from '../services/ReportService.js';

/**
 * Main gateway client - entry point for all operations
 */
export class GatewayClient {
	constructor(config) {
		this.paymentService = new PaymentService(config);
		this.vaultService = new VaultService(config);
		this.reportService = new ReportService(config);
	}

	/**
	 * Get payment service
	 * @returns {PaymentService}
	 */
	payment() {
		return this.paymentService;
	}

	/**
	 * Get vault service
	 * @returns {VaultService}
	 */
	vault() {
		return this.vaultService;
	}

	/**
	 * Get report service
	 * @returns {ReportService}
	 */
	report() {
		return this.reportService;
	}
}
