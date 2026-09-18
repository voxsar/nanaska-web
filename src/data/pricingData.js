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

// Level bundle prices (all subjects at a level) — the cheapest per-subject rate
const LEVEL_PRICE_MAP = {
	certificate: { gbp: 360, lkr: 50000 },
	operational: { gbp: 600, lkr: 65000 },
	management: { gbp: 600, lkr: 65000 },
	strategic: { gbp: 600, lkr: 65000 },
};

// Bundle pricing by level -> number of subjects. Combining subjects lowers the
// total, so a cart holding several subjects from the same level is priced from
// this table instead of summing single-subject prices.
// Certificate figures follow the published Nanaska fee structure; GBP mirrors
// the same discount, rounded to the nearest pound.
const LEVEL_TIER_PRICE_MAP = {
	certificate: {
		1: { gbp: 105, lkr: 16000 },
		2: { gbp: 190, lkr: 29000 },
		3: { gbp: 289, lkr: 44000 },
		4: { gbp: 360, lkr: 50000 },
	},
};

// One-off registration fee charged on top of course fees. Billed once per level
// per order — a cart holding one certificate subject, three, or the full level
// all pay this exactly once. Levels missing from this map charge no fee.
const LEVEL_REGISTRATION_FEE_MAP = {
	certificate: { gbp: 30, lkr: 5000 },
};

// Frontend level IDs -> backend combination ID prefixes
const LEVEL_PREFIX_MAP = {
	certificate: 'cert',
	operational: 'op',
	management: 'mg',
	strategic: 'st',
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

/** Registration fee prices for a level, or null when the level charges none. */
export function getRegistrationFeePrices(levelId) {
	return LEVEL_REGISTRATION_FEE_MAP[levelId] || null;
}

/**
 * The registration fees owed by a cart spanning `levelIds`, as
 * [{ levelId, gbp, lkr }]. Duplicate level IDs collapse to one entry so the fee
 * is charged once per level however many of its subjects are being bought.
 */
export function getRegistrationFees(levelIds) {
	const seen = new Set();
	const fees = [];
	(levelIds || []).forEach(levelId => {
		if (!levelId || seen.has(levelId)) return;
		seen.add(levelId);
		const prices = LEVEL_REGISTRATION_FEE_MAP[levelId];
		if (prices) fees.push({ levelId, ...prices });
	});
	return fees;
}

/** True when this level prices multi-subject carts as a discounted bundle. */
export function hasTierPricing(levelId) {
	return Boolean(LEVEL_TIER_PRICE_MAP[levelId]);
}

/** Bundle prices for `subjectCount` subjects at a level, or null when untiered. */
export function getTierPrices(levelId, subjectCount) {
	return LEVEL_TIER_PRICE_MAP[levelId]?.[subjectCount] || null;
}

/** Every tier for a level as [{ count, gbp, lkr }], ascending. Empty when untiered. */
export function getTierTable(levelId) {
	const tiers = LEVEL_TIER_PRICE_MAP[levelId];
	if (!tiers) return [];
	return Object.keys(tiers)
		.map(Number)
		.sort((a, b) => a - b)
		.map(count => ({ count, ...tiers[count] }));
}

/**
 * Backend combination ID for a set of course codes at a level.
 * Mirrors the seed's ID scheme: prefix + sorted lowercase codes, e.g.
 * ('certificate', ['BA2', 'BA1']) -> 'cert_ba1_ba2'.
 */
export function getCombinationIdForCourses(levelId, courseCodes) {
	const prefix = LEVEL_PREFIX_MAP[levelId];
	if (!prefix || !courseCodes?.length) return '';
	const suffix = [...courseCodes].sort().map(code => code.toLowerCase()).join('_');
	return `${prefix}_${suffix}`;
}

/**
 * The next bundle tier up from `currentCount` subjects, with the extra cost of
 * getting there — e.g. going from 1 to 2 certificate subjects adds LKR 13,000
 * rather than another full LKR 16,000. Null when already at the top tier.
 */
export function getNextTierUpgrade(levelId, currentCount) {
	const current = getTierPrices(levelId, currentCount);
	const next = getTierPrices(levelId, currentCount + 1);
	if (!next) return null;
	const base = current || { gbp: 0, lkr: 0 };
	return {
		count: currentCount + 1,
		gbp: next.gbp,
		lkr: next.lkr,
		extra: { gbp: next.gbp - base.gbp, lkr: next.lkr - base.lkr },
	};
}
