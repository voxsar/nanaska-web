/**
 * Transaction types for payment operations
 */
export class TransactionType {
	// Credit types
	static PURCHASE = 'PURCHASE';
	static AUTHORISATION = 'AUTHORISATION';
	static COMPLETION = 'COMPLETION';
	static REFUND = 'REFUND';
	static ORPHANED_REFUND = 'ORPHANED_REFUND';
	static REVERSAL = 'REVERSAL';
	static TOKEN = 'TOKEN';

	// Direct entry types
	static CREDIT = 'CREDIT';
	static DEBIT = 'DEBIT';
}
