import './RecaptchaNotice.css';
import { isRecaptchaConfigured } from '../lib/recaptcha';

/**
 * Attribution required by Google when the floating reCAPTCHA badge is hidden.
 * The badge is hidden site-wide (it collides with the floating action buttons),
 * so every captcha-protected form renders this instead.
 */
export default function RecaptchaNotice({ className = '' }) {
	if (!isRecaptchaConfigured()) return null;

	return (
		<p className={`recaptcha-notice ${className}`.trim()}>
			This site is protected by reCAPTCHA and the Google{' '}
			<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
				Privacy Policy
			</a>{' '}
			and{' '}
			<a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
				Terms of Service
			</a>{' '}
			apply.
		</p>
	);
}
