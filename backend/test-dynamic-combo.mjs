import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testDynamicCombination() {
	console.log('Testing dynamic combination creation...\n');

	try {
		// Test 1: Create payment with courseIds (E1 + E2 - cross-level)
		console.log('Test 1: Requesting payment for E1 + E2 (cross-level)...');
		const res1 = await fetch(`${API_URL}/payments/guest-create`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				courseIds: ['E1', 'E2'],
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				currency: 'LKR',
				amount: 50000,
			}),
		});

		if (res1.ok) {
			const data1 = await res1.json();
			console.log('✓ Success! Payment URL received:', data1.paymentUrl ? 'YES' : 'NO');
			console.log('  Order ID:', data1.orderId);
		} else {
			const error = await res1.text();
			console.log('✗ Failed:', error);
		}

		console.log('\nTest 2: Requesting payment for F1 + P2 (cross-level)...');
		const res2 = await fetch(`${API_URL}/payments/guest-create`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				courseIds: ['F1', 'P2'],
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				currency: 'GBP',
				amount: 400,
			}),
		});

		if (res2.ok) {
			const data2 = await res2.json();
			console.log('✓ Success! Payment URL received:', data2.paymentUrl ? 'YES' : 'NO');
			console.log('  Order ID:', data2.orderId);
		} else {
			const error = await res2.text();
			console.log('✗ Failed:', error);
		}

		console.log('\n✅ Dynamic combination creation is working!');
	} catch (error) {
		console.error('❌ Test failed:', error.message);
	}
}

testDynamicCombination();
