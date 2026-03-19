import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
	DEFAULT_CURRENCY,
	formatCurrency,
	getCurrencyByCountry,
	getPriceForCountry,
	isSriLankanCountry,
} from '../data/pricingData';

const PricingContext = createContext(null);
const STORAGE_KEY = 'nanaska_selected_country';

export function PricingProvider({ children }) {
	const [selectedCountry, setSelectedCountry] = useState(() => {
		try {
			return localStorage.getItem(STORAGE_KEY) || '';
		} catch (_error) {
			return '';
		}
	});

	useEffect(() => {
		try {
			if (selectedCountry) {
				localStorage.setItem(STORAGE_KEY, selectedCountry);
			} else {
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch (_error) {
			// ignore storage errors
		}
	}, [selectedCountry]);

	const currency = getCurrencyByCountry(selectedCountry) || DEFAULT_CURRENCY;

	const value = useMemo(() => ({
		selectedCountry,
		setSelectedCountry,
		currency,
		isSriLanka: isSriLankanCountry(selectedCountry),
		getAmountForCountry: (prices) => getPriceForCountry(prices, selectedCountry),
		formatAmount: (amount) => formatCurrency(amount, currency),
	}), [selectedCountry, currency]);

	return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
	const ctx = useContext(PricingContext);
	if (!ctx) throw new Error('usePricing must be used within PricingProvider');
	return ctx;
}
