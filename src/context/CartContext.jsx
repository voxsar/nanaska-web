import { createContext, useContext, useState, useEffect } from 'react';
import {
	getCoursePricesByCode,
	getLevelPricesById,
	getPriceForCountry,
} from '../data/pricingData';

const CartContext = createContext(null);
const STORAGE_KEY = 'nanaska_enrollment_cart';

export function CartProvider({ children }) {
	const [cartItems, setCartItems] = useState(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const { items, expiry } = JSON.parse(stored);
				if (Date.now() < expiry) return items;
			}
		} catch (_e) { /* ignore */ }
		return [];
	});
	const [mergeAnimation, setMergeAnimation] = useState(null);

	useEffect(() => {
		const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: cartItems, expiry }));
	}, [cartItems]);

	function addCourse(subject, level) {
		if (isLevelInCart(level.levelId)) return;
		if (isInCart(subject.code)) return;

		const prices = getCoursePricesByCode(subject.code, subject.price || 0);
		const newItem = {
			type: 'course',
			courseCode: subject.code,
			courseName: subject.name,
			levelId: level.levelId,
			levelTitle: level.title,
			priceGbp: prices.gbp,
			priceLkr: prices.lkr,
			slug: subject.slug,
		};

		const newItems = [...cartItems, newItem];

		const levelSubjectCodes = level.subjects.map(s => s.code);
		const cartCourseCodes = newItems
			.filter(i => i.type === 'course' && i.levelId === level.levelId)
			.map(i => i.courseCode);

		const allInCart = levelSubjectCodes.every(code => cartCourseCodes.includes(code));

		if (allInCart) {
			const merged = newItems.filter(i => !(i.type === 'course' && i.levelId === level.levelId));
			const levelPrices = getLevelPricesById(level.levelId, level.levelPrice || 0);
			merged.push({
				type: 'level',
				levelId: level.levelId,
				levelTitle: level.title,
				levelPath: level.currentPath,
				priceGbp: levelPrices.gbp,
				priceLkr: levelPrices.lkr,
				courseCount: level.subjects.length,
			});
			setCartItems(merged);
			setMergeAnimation(level.levelId);
			setTimeout(() => setMergeAnimation(null), 2000);
		} else {
			setCartItems(newItems);
		}
	}

	function addLevel(level) {
		if (isLevelInCart(level.levelId)) return;
		const filtered = cartItems.filter(i => !(i.type === 'course' && i.levelId === level.levelId));
		const levelPrices = getLevelPricesById(level.levelId, level.levelPrice || 0);
		filtered.push({
			type: 'level',
			levelId: level.levelId,
			levelTitle: level.title,
			levelPath: level.currentPath,
			priceGbp: levelPrices.gbp,
			priceLkr: levelPrices.lkr,
			courseCount: level.subjects.length,
		});
		setCartItems(filtered);
	}

	function removeItem(id) {
		setCartItems(prev => prev.filter(i => {
			if (i.type === 'level') return i.levelId !== id;
			if (i.type === 'course') return i.courseCode !== id;
			return true;
		}));
	}

	function clearCart() { setCartItems([]); }

	function isInCart(courseCode) {
		return cartItems.some(i => i.type === 'course' && i.courseCode === courseCode);
	}

	function isLevelInCart(levelId) {
		return cartItems.some(i => i.type === 'level' && i.levelId === levelId);
	}

	function getItemPrices(item) {
		if (typeof item?.priceGbp === 'number' && typeof item?.priceLkr === 'number') {
			return { gbp: item.priceGbp, lkr: item.priceLkr };
		}

		if (item?.type === 'course') {
			return getCoursePricesByCode(item.courseCode, item.price || 0);
		}

		if (item?.type === 'level') {
			return getLevelPricesById(item.levelId, item.price || 0);
		}

		return { gbp: 0, lkr: 0 };
	}

	function getItemPrice(item, country) {
		return getPriceForCountry(getItemPrices(item), country);
	}

	function getCartTotal(country) {
		return cartItems.reduce((sum, i) => sum + getItemPrice(i, country), 0);
	}

	const cartCount = cartItems.length;

	return (
		<CartContext.Provider value={{
			cartItems, cartCount, mergeAnimation,
			addCourse, addLevel, removeItem, clearCart, isInCart, isLevelInCart,
			getItemPrice, getCartTotal,
		}}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error('useCart must be used within CartProvider');
	return ctx;
}
