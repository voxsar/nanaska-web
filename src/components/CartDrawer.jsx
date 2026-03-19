import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, cartTotal, mergeAnimation, removeItem } = useCart();

  return (
    <>
      <div
        className={`cart-drawer__overlay${isOpen ? ' cart-drawer__overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`cart-drawer${isOpen ? ' cart-drawer--open' : ''}`} aria-label="Enrollment cart">
        <div className="cart-drawer__panel">
          <div className="cart-drawer__header">
            <h2 className="cart-drawer__title">Your Enrollment</h2>
            <button className="cart-drawer__close" onClick={onClose} aria-label="Close cart">✕</button>
          </div>

          {mergeAnimation && (
            <div className="cart-drawer__merge-banner">
              ✨ Merged into Full Level Enrollment!
            </div>
          )}

          <div className="cart-drawer__items">
            {cartItems.length === 0 ? (
              <p className="cart-drawer__empty">No courses added yet. Browse our courses and add them here.</p>
            ) : (
              cartItems.map(item => (
                <div
                  key={item.type === 'level' ? item.levelId : item.courseCode}
                  className={`cart-drawer__item${item.type === 'level' ? ' cart-drawer__item--level' : ''}`}
                >
                  <div className="cart-drawer__item-info">
                    <span className="cart-drawer__item-name">
                      {item.type === 'level' ? item.levelTitle : `${item.courseCode} – ${item.courseName}`}
                    </span>
                    {item.type === 'level' && (
                      <span className="cart-drawer__item-badge">
                        📚 Full Level · {item.courseCount} courses
                      </span>
                    )}
                  </div>
                  <span className="cart-drawer__item-price">LKR {item.price.toLocaleString()}</span>
                  <button
                    className="cart-drawer__item-remove"
                    onClick={() => removeItem(item.type === 'level' ? item.levelId : item.courseCode)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cart-drawer__footer">
            <p className="cart-drawer__note">
              ℹ️ Pricing will be confirmed upon enrollment. Displayed prices are indicative.
            </p>
            <div className="cart-drawer__total">
              <span>Estimated Total</span>
              <span>LKR {cartTotal.toLocaleString()}</span>
            </div>
            <Link to="/enrollment" className="cart-drawer__proceed-btn" onClick={onClose}>
              Proceed to Enrollment →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
