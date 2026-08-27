/**
 * Google reCAPTCHA v3 helper.
 *
 * The script is loaded lazily – call `preloadRecaptcha()` when a form mounts so
 * the token is ready by the time the visitor submits. Every helper degrades to a
 * no-op when `VITE_RECAPTCHA_SITE_KEY` is unset, which mirrors the backend's
 * behaviour when `RECAPTCHA_SECRET_KEY` is unset: forms keep working, they just
 * are not captcha-protected.
 */

const SITE_KEY = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim();
const API_URL = (import.meta.env.VITE_API_URL || 'https://api.nanaska.com').trim().replace(/\/+$/, '');
const SCRIPT_ID = 'google-recaptcha-v3';

/** True when a site key is configured and captcha tokens will be generated. */
export const isRecaptchaConfigured = () => SITE_KEY.length > 0;

let loadPromise = null;

function loadRecaptcha() {
	if (!SITE_KEY) return Promise.resolve(null);
	if (loadPromise) return loadPromise;

	loadPromise = new Promise((resolve, reject) => {
		if (window.grecaptcha?.execute) {
			resolve(window.grecaptcha);
			return;
		}
		let script = document.getElementById(SCRIPT_ID);
		if (!script) {
			script = document.createElement('script');
			script.id = SCRIPT_ID;
			script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		}
		script.addEventListener('load', () => resolve(window.grecaptcha));
		script.addEventListener('error', () => {
			loadPromise = null; // allow a retry on the next submit
			reject(new Error('Failed to load reCAPTCHA'));
		});
	}).then(
		(grecaptcha) =>
			new Promise((resolve) => {
				if (!grecaptcha?.ready) { resolve(grecaptcha || null); return; }
				grecaptcha.ready(() => resolve(grecaptcha));
			}),
	);

	return loadPromise;
}

/** Warms up the reCAPTCHA script so submitting a form does not wait on a download. */
export function preloadRecaptcha() {
	loadRecaptcha().catch(() => { });
}

/**
 * Returns a fresh reCAPTCHA token for `action`, or `null` when reCAPTCHA is not
 * configured or could not be reached. Tokens are single-use and expire after
 * two minutes, so always request one at submit time.
 */
export async function getRecaptchaToken(action = 'submit') {
	if (!SITE_KEY) return null;
	try {
		const grecaptcha = await loadRecaptcha();
		if (!grecaptcha?.execute) return null;
		return await grecaptcha.execute(SITE_KEY, { action });
	} catch {
		return null;
	}
}

/**
 * Adds `recaptchaToken` to a request payload. The field is omitted entirely when
 * no token could be obtained; the backend then falls back to whatever its own
 * configuration allows.
 */
export async function withRecaptcha(action, payload = {}) {
	const recaptchaToken = await getRecaptchaToken(action);
	return recaptchaToken ? { ...payload, recaptchaToken } : payload;
}

/**
 * Verifies a token against the backend without submitting anything else.
 * Used by forms that have no endpoint of their own. Resolves to `true` when the
 * visitor passes (or when reCAPTCHA is not configured) and `false` otherwise.
 */
export async function verifyRecaptcha(action = 'submit') {
	if (!SITE_KEY) return true;
	try {
		const res = await fetch(`${API_URL}/recaptcha/verify`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(await withRecaptcha(action)),
		});
		return res.ok;
	} catch {
		// Network failure – do not lock a genuine visitor out of the form.
		return true;
	}
}
