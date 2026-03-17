import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <nav className="mob-nav" aria-label="Mobile navigation">
        <NavLink to="/" end className={({ isActive }) => `mob-nav__item${isActive ? ' mob-nav__item--active' : ''}`}>
          <span className="mob-nav__icon">🏠</span>
          <span className="mob-nav__label">Home</span>
        </NavLink>

        <NavLink to="/cima-certificate-level" className={({ isActive }) => `mob-nav__item${isActive ? ' mob-nav__item--active' : ''}`}>
          <span className="mob-nav__icon">📚</span>
          <span className="mob-nav__label">Courses</span>
        </NavLink>

        {/* Cart in the middle — highlighted */}
        <button
          className="mob-nav__cart"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart (${cartCount} items)`}
        >
          <span className="mob-nav__cart-icon">🛒</span>
          {cartCount > 0 && (
            <span className="mob-nav__cart-badge">{cartCount}</span>
          )}
          <span className="mob-nav__label mob-nav__label--cart">Cart</span>
        </button>

        <NavLink to="/about" className={({ isActive }) => `mob-nav__item${isActive ? ' mob-nav__item--active' : ''}`}>
          <span className="mob-nav__icon">ℹ️</span>
          <span className="mob-nav__label">About</span>
        </NavLink>

        <NavLink to="/contact" className={({ isActive }) => `mob-nav__item${isActive ? ' mob-nav__item--active' : ''}`}>
          <span className="mob-nav__icon">📞</span>
          <span className="mob-nav__label">Contact</span>
        </NavLink>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
