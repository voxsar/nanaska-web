export const DEFAULT_CURRENCY = 'GBP';
export const SRI_LANKA = 'Sri Lanka';

// Course prices sourced from user-provided CSV (GBP + LKR)
const COURSE_PRICE_MAP = {
	BA1: { gbp: 105, lkr: 16000 },
	BA2: { gbp: 105, lkr: 16000 },
	BA3: { gbp: 105, lkr: 16000 },
	BA4: { gbp: 105, lkr: 16000 },

	E1: { gbp: 200, lkr: 25000 },
	P1: { gbp: 200, lkr: 25000 },
	F1: { gbp: 200, lkr: 25000 },
	OCS: { gbp: 399, lkr: 26650 },

	E2: { gbp: 200, lkr: 25000 },
	P2: { gbp: 200, lkr: 25000 },
	F2: { gbp: 200, lkr: 25000 },
	MCS: { gbp: 499, lkr: 27675 },

	E3: { gbp: 200, lkr: 25000 },
	P3: { gbp: 200, lkr: 25000 },
	F3: { gbp: 200, lkr: 25000 },
	SCS: { gbp: 599, lkr: 30750 },
};

// Level bundle prices sourced from user-provided CSV combinations
const LEVEL_PRICE_MAP = {
	certificate: { gbp: 360, lkr: 50000 },
	operational: { gbp: 600, lkr: 65000 },
	management: { gbp: 600, lkr: 65000 },
	strategic: { gbp: 600, lkr: 65000 },
};

// Frontend level IDs -> backend combination IDs
const LEVEL_COMBINATION_ID_MAP = {
	certificate: 'cert_full',
	operational: 'op_full',
	management: 'mg_full',
	strategic: 'st_full',
};

const countryToKey = (country) => (country || '').trim().toLowerCase();

export function isSriLankanCountry(country) {
	const key = countryToKey(country);
	return key === 'sri lanka' || key === 'sri-lanka' || key === 'lk';
}

export function getCurrencyByCountry(country) {
	return isSriLankanCountry(country) ? 'LKR' : DEFAULT_CURRENCY;
}

export function getPriceForCountry(prices, country) {
	const safe = prices || { gbp: 0, lkr: 0 };
	return isSriLankanCountry(country) ? safe.lkr : safe.gbp;
}

export function formatCurrency(amount, currency) {
	return new Intl.NumberFormat(currency === 'LKR' ? 'en-LK' : 'en-GB', {
		style: 'currency',
		currency,
		minimumFractionDigits: currency === 'LKR' ? 0 : 2,
		maximumFractionDigits: currency === 'LKR' ? 0 : 2,
	}).format(amount || 0);
}

export function getCoursePricesByCode(code, fallbackPrice = 0) {
	return COURSE_PRICE_MAP[code] || { gbp: fallbackPrice, lkr: fallbackPrice };
}

export function getLevelPricesById(levelId, fallbackPrice = 0) {
	return LEVEL_PRICE_MAP[levelId] || { gbp: fallbackPrice, lkr: fallbackPrice };
}

export function getCombinationIdForLevel(levelId) {
	return LEVEL_COMBINATION_ID_MAP[levelId] || '';
}
