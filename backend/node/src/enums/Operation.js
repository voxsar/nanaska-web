/**
 * API operation types
 */
export class Operation {
	// Payment operations
	static PAYMENT_INIT = 'PAYMENT_INIT';
	static PAYMENT_CREATE = 'PAYMENT_CREATE';
	static PAYMENT_COMPLETE = 'PAYMENT_COMPLETE';
	static PAYMENT_REAL_TIME = 'PAYMENT_REAL_TIME';
	static PAYMENT_BATCH = 'PAYMENT_BATCH';
	static PAYMENT_BBPOS = 'PAYMENT_BBPOS';

	// Report operations
	static REPORT_BASIC = 'REPORT_BASIC';
	static REPORT_SETTLEMENT = 'REPORT_SETTLEMENT';

	// Vault operations
	static VAULT_STORE_CARD = 'VAULT_STORE_CARD';
	static VAULT_RETRIEVE_CARD = 'VAULT_RETRIEVE_CARD';
	static VAULT_UPDATE_CARD = 'VAULT_UPDATE_CARD';
	static VAULT_VERIFY_TOKEN = 'VAULT_VERIFY_TOKEN';
	static VAULT_DELETE_TOKEN = 'VAULT_DELETE_TOKEN';

	// Amex Wallet operations
	static AMEX_WALLET_INIT = 'AMEX_WALLET_INIT';
	static AMEX_WALLET_COMPLETE = 'AMEX_WALLET_COMPLETE';

	// Direct entry operations
	static DIRECT_ENTRY_REAL_TIME = 'DIRECT_ENTRY_REAL_TIME';
	static DIRECT_ENTRY_BATCH = 'DIRECT_ENTRY_BATCH';
}
