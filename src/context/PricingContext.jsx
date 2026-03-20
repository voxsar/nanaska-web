import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
	DEFAULT_CURRENCY,
	SRI_LANKA,
	formatCurrency,
	getCurrencyByCountry,
	getPriceForCountry,
	isSriLankanCountry,
} from '../data/pricingData';
import { useCountryDetection } from '../hooks/useCountryDetection';

const PricingContext = createContext(null);
// Key for the visitor's deliberately chosen country; absent when auto-detecting.
const MANUAL_KEY = 'nanaska_selected_country';

export function PricingProvider({ children }) {
	// `null`  = visitor has not made an explicit choice.
	// A string = their explicit country choice (persisted in localStorage).
	const [manualCountry, setManualCountryRaw] = useState(() => {
		try {
			return localStorage.getItem(MANUAL_KEY); // null when key is absent
		} catch {
			return null;
		}
	});

	// Async geo-detection — results are cached in localStorage for 24 hours so
	// that repeat visitors never see a pricing flash (cache initialises sync).
	const { countryCode, isDetecting } = useCountryDetection();

	// Derive the effective country without an extra state variable — no setState
	// inside effects needed:
	//   • Manual selection always wins.
	//   • While detection is still running, default to '' (GBP — safe fallback).
	//   • When detection resolves, the derived value updates on the next render.
	const selectedCountry = useMemo(() => {
		if (manualCountry !== null) return manualCountry;
		if (!isDetecting) return (countryCode && isSriLankanCountry(countryCode)) ? SRI_LANKA : '';
		return ''; // GBP default while first detection is in flight
	}, [manualCountry, isDetecting, countryCode]);

	// Public setter used by the enrollment form for manual country override.
	// Passing '' or undefined reverts to auto-detection.
	const setSelectedCountry = useCallback((country) => {
		const value = country || null;
		setManualCountryRaw(value);
		try {
			if (value) {
				localStorage.setItem(MANUAL_KEY, value);
			} else {
				localStorage.removeItem(MANUAL_KEY);
			}
		} catch {
			// ignore storage errors
		}
	}, []);

	const currency = getCurrencyByCountry(selectedCountry) || DEFAULT_CURRENCY;

	const value = useMemo(() => ({
		selectedCountry,
		setSelectedCountry,
		currency,
		isSriLanka: isSriLankanCountry(selectedCountry),
		detectionComplete: !isDetecting,
		getAmountForCountry: (prices) => getPriceForCountry(prices, selectedCountry),
		formatAmount: (amount) => formatCurrency(amount, currency),
	}), [selectedCountry, setSelectedCountry, currency, isDetecting]);

	return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
	const ctx = useContext(PricingContext);
	if (!ctx) throw new Error('usePricing must be used within PricingProvider');
	return ctx;
}
