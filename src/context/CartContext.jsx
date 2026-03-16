import { createContext, useContext, useState, useEffect } from 'react';

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

    const newItem = {
      type: 'course',
      courseCode: subject.code,
      courseName: subject.name,
      levelId: level.levelId,
      levelTitle: level.title,
      price: subject.price,
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
      merged.push({
        type: 'level',
        levelId: level.levelId,
        levelTitle: level.title,
        levelPath: level.currentPath,
        price: level.levelPrice,
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
    filtered.push({
      type: 'level',
      levelId: level.levelId,
      levelTitle: level.title,
      levelPath: level.currentPath,
      price: level.levelPrice,
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

  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price, 0);

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartTotal, mergeAnimation,
      addCourse, addLevel, removeItem, clearCart, isInCart, isLevelInCart,
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
