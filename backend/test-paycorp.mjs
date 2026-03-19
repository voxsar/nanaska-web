import crypto from 'crypto';
import fs from 'fs';

const MERCHANT_ID = 14008085;
const AUTH_TOKEN = '45568714-56cd-45c3-bda0-72f19d539d24';
const HMAC_SECRET = 'y4MfIj3XQFWhNSmD';
const DOMAIN = 'https://paycorp-smp.prod.aws.paycorp.lk';

const initBody = JSON.stringify({
	clientId: MERCHANT_ID,
	type: 'PURCHASE',
	amount: { paymentAmount: 100, currency: 'LKR' },
	redirect: { returnUrl: 'https://api.nanaska.com/payments/complete', returnMethod: 'GET' },
	clientRef: `TEST-${Date.now()}`,
});
const hmac = crypto.createHmac('sha256', HMAC_SECRET).update(initBody).digest('base64');

// Now focus only on /rest/* paths since /rest/payment/* reached Spring Boot
const probes = [
	'/rest/payment/init',
	'/rest/payment/initialize',
	'/rest/payment/setup',
	'/rest/payment/checkout',
	'/rest/payment/request',
	'/rest/payments/init',
	'/rest/payments/initialize',
	'/rest/merchant/payment/init',
	'/rest/ipg/payment/init',
	'/rest/ipg/init',
	'/rest/checkout/init',
	'/rest/checkout',
	'/rest/pg/payment/init',
	'/rest/pg/init',
	'/rest/transaction/init',
	'/rest/service/payment',
	'/rest/service/payment/init',
];

const results = [];

for (const path of probes) {
	const url = `${DOMAIN}${path}`;
	const headers = {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'AUTHTOKEN': AUTH_TOKEN,
		'HMAC': hmac,
	};
	try {
		const res = await fetch(url, { method: 'POST', headers, body: initBody });
		const text = await res.text();
		const ct = res.headers.get('content-type') || '';
		const srv = res.headers.get('server') || '';
		const isJson = ct.includes('json');
		results.push({ path, status: res.status, server: srv, ct, body: text.slice(0, 300) });
		console.log(`[${res.status}] ${path} | server=${srv} | ${ct}`);
		if (res.status !== 404) console.log('  >', text.slice(0, 300));
	} catch (err) {
		results.push({ path, error: err.message });
		console.log(`[ERR] ${path}: ${err.message}`);
	}
}

fs.writeFileSync('/var/www/nanaska-web/paycorp-response.json', JSON.stringify(results, null, 2));
console.log('\nDone.');
