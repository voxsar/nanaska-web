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

// Frontend course codes -> backend single-course combination IDs
const COURSE_COMBINATION_ID_MAP = {
	BA1: 'cert_ba1',
	BA2: 'cert_ba2',
	BA3: 'cert_ba3',
	BA4: 'cert_ba4',
	E1: 'op_e1',
	P1: 'op_p1',
	F1: 'op_f1',
	OCS: 'op_ocs',
	E2: 'op_e2',
	P2: 'mg_p2',
	F2: 'mg_f2',
	MCS: 'mg_mcs',
	E3: 'st_e3',
	P3: 'st_p3',
	F3: 'st_f3',
	SCS: 'st_scs',
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

export function getCombinationIdForCourse(courseCode) {
	return COURSE_COMBINATION_ID_MAP[courseCode] || '';
}
