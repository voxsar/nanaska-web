import { useEffect, useState } from 'react';

export const GEO_CACHE_KEY = 'nanaska_geo_country';
export const GEO_EXPIRY_KEY = 'nanaska_geo_expiry';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT_MS = 5000; // 5 seconds per API attempt

const SL_CODE = 'LK';
const SL_TIMEZONE = 'Asia/Colombo';
// Locale prefixes for Sinhala ('si') and Sri Lankan Tamil ('ta-LK').
// Stored lowercase because comparison is done against lowercased navigator.language values.
const SL_LOCALE_PREFIXES = ['si', 'ta-lk'];

// ─── Sync cache helpers ────────────────────────────────────────────────────────

/**
 * Reads the cached country code from localStorage without triggering async work.
 * Returns the cached ISO-3166-1 alpha-2 code (e.g. 'LK'), empty string for
 * "not Sri Lanka", or undefined when the cache is absent / expired.
 */
export function getCachedCountryCode() {
	try {
		const expiry = Number(localStorage.getItem(GEO_EXPIRY_KEY) || 0);
		if (Date.now() < expiry) {
			const cached = localStorage.getItem(GEO_CACHE_KEY);
			if (cached !== null) return cached; // '' means "detected non-SL"
		}
	} catch {
		// ignore storage errors
	}
	return undefined;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

function fetchWithTimeout(url) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT_MS);
		fetch(url)
			.then((res) => { clearTimeout(timer); resolve(res); })
			.catch((err) => { clearTimeout(timer); reject(err); });
	});
}

// Technique 1 – ipapi.co  (HTTPS, free, 1 000 req/day per IP)
async function tryIpapiCo() {
	const res = await fetchWithTimeout('https://ipapi.co/json/');
	if (!res.ok) throw new Error('ipapi.co non-ok');
	const data = await res.json();
	if (typeof data.country_code === 'string' && data.country_code.length === 2)
		return data.country_code.toUpperCase();
	throw new Error('no country_code in ipapi.co');
}

// Technique 2 – ipinfo.io  (HTTPS, free, 50 000 req/month per IP)
async function tryIpinfo() {
	const res = await fetchWithTimeout('https://ipinfo.io/json');
	if (!res.ok) throw new Error('ipinfo.io non-ok');
	const data = await res.json();
	if (typeof data.country === 'string' && data.country.length === 2)
		return data.country.toUpperCase();
	throw new Error('no country in ipinfo.io');
}

// Technique 3 – Cloudflare CDN trace  (HTTPS, no auth, very reliable)
// Response is plain text with one key=value per line; "loc=XX" is the country.
async function tryCloudflareCdnTrace() {
	const res = await fetchWithTimeout('https://1.1.1.1/cdn-cgi/trace');
	if (!res.ok) throw new Error('CF trace non-ok');
	const text = await res.text();
	const match = text.match(/^loc=([A-Z]{2})$/m);
	if (match) return match[1].toUpperCase();
	throw new Error('no loc in CF trace');
}

// Technique 4 – freeipapi.com  (HTTPS, free tier)
async function tryFreeIpApi() {
	const res = await fetchWithTimeout('https://freeipapi.com/api/json');
	if (!res.ok) throw new Error('freeipapi non-ok');
	const data = await res.json();
	if (typeof data.countryCode === 'string' && data.countryCode.length === 2)
		return data.countryCode.toUpperCase();
	throw new Error('no countryCode in freeipapi');
}

// ─── Local / offline heuristics (fallback only) ───────────────────────────────

// Technique 5 – IANA timezone  (Asia/Colombo is unique to Sri Lanka)
function detectViaTimezone() {
	try {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		if (tz === SL_TIMEZONE) return SL_CODE;
	} catch {
		// Intl not available
	}
	return null;
}

// Technique 6 – Browser language/locale  (Sinhala "si", Sri Lankan Tamil "ta-LK")
function detectViaLanguage() {
	try {
		const langs = [...(navigator.languages || []), navigator.language].filter(Boolean);
		const lowerLangs = langs.map((l) => l.toLowerCase());
		if (lowerLangs.some((l) => SL_LOCALE_PREFIXES.some((p) => l.startsWith(p))))
			return SL_CODE;
	} catch {
		// navigator not available
	}
	return null;
}

// ─── Main detection orchestrator ──────────────────────────────────────────────

/**
 * Tries all IP-based techniques in order (first success wins), then falls back
 * to local heuristics. Returns an ISO-3166-1 alpha-2 code or null if every
 * technique fails.
 */
async function runDetection() {
	const ipTechniques = [tryIpapiCo, tryIpinfo, tryCloudflareCdnTrace, tryFreeIpApi];
	for (const technique of ipTechniques) {
		try {
			const code = await technique();
			if (code) return code;
		} catch {
			// try next technique
		}
	}
	// IP techniques all failed — use offline heuristics as a last resort.
	// These can only positively identify Sri Lanka; null means unknown.
	return detectViaTimezone() || detectViaLanguage() || null;
}

// ─── React hook ───────────────────────────────────────────────────────────────

/**
 * Detects the user's country using multiple techniques with progressive
 * fallbacks. Results are cached in localStorage for 24 hours to avoid
 * repeated API calls and to eliminate loading flicker on repeat visits.
 *
 * Returns `{ countryCode, isDetecting }`:
 * - `countryCode`: ISO-3166-1 alpha-2 string (e.g. 'LK', 'GB') or `null`
 *   when detection failed or is still in progress.
 * - `isDetecting`: `true` while async detection is underway.
 */
export function useCountryDetection() {
	const [state, setState] = useState(() => {
		const cached = getCachedCountryCode();
		if (cached !== undefined) {
			// Cache hit — initialize synchronously to avoid a pricing flash.
			return { countryCode: cached || null, isDetecting: false };
		}
		return { countryCode: null, isDetecting: true };
	});

	useEffect(() => {
		// Cache already populated — nothing to do.
		if (!state.isDetecting) return;

		let cancelled = false;

		runDetection()
			.then((code) => {
				if (cancelled) return;
				try {
					localStorage.setItem(GEO_CACHE_KEY, code || '');
					localStorage.setItem(GEO_EXPIRY_KEY, String(Date.now() + CACHE_DURATION_MS));
				} catch {
					// ignore storage errors
				}
				setState({ countryCode: code, isDetecting: false });
			})
			.catch(() => {
				if (!cancelled) setState({ countryCode: null, isDetecting: false });
			});

		return () => {
			cancelled = true;
		};
	}, [state.isDetecting]);

	return state;
}
