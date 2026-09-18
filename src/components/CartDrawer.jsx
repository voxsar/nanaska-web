import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { getNextTierUpgrade, getPriceForCountry } from '../data/pricingData';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
	const { cartItems, mergeAnimation, removeItem, getItemPrice, getCartGroups, getCartFees, getCartTotal, getCartSavings } = useCart();
	const { selectedCountry, formatAmount } = usePricing();
	const cartGroups = getCartGroups(selectedCountry);
	const cartFees = getCartFees(selectedCountry);
	const cartTotal = getCartTotal(selectedCountry);
	const cartSavings = getCartSavings(selectedCountry);

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
							cartGroups.map(group => {
								// Several subjects from a level with tiered pricing are charged as one
								// discounted bundle, so they are shown under a single bundle price.
								if (group.type === 'bundle') {
									const upgrade = getNextTierUpgrade(group.levelId, group.items.length);
									return (
										<div key={group.key} className="cart-drawer__bundle">
											<div className="cart-drawer__bundle-header">
												<span className="cart-drawer__bundle-title">
													🎁 {group.title} · {group.items.length} subjects
												</span>
												<span className="cart-drawer__bundle-price">
													<s className="cart-drawer__bundle-was">{formatAmount(group.listAmount)}</s>
													{formatAmount(group.amount)}
												</span>
											</div>
											{group.items.map(item => (
												<div key={item.courseCode} className="cart-drawer__item cart-drawer__item--bundled">
													<div className="cart-drawer__item-info">
														<span className="cart-drawer__item-name">{item.courseCode} – {item.courseName}</span>
													</div>
													<button
														className="cart-drawer__item-remove"
														onClick={() => removeItem(item.courseCode)}
														aria-label={`Remove ${item.courseCode}`}
													>
														×
													</button>
												</div>
											))}
											{group.savings > 0 && (
												<p className="cart-drawer__bundle-savings">
													Bundle price — you save {formatAmount(group.savings)}
												</p>
											)}
											{upgrade && (
												<p className="cart-drawer__bundle-upsell">
													Add 1 more subject for just {formatAmount(getPriceForCountry(upgrade.extra, selectedCountry))}
												</p>
											)}
										</div>
									);
								}

								return group.items.map(item => {
									const isLevel = item.type === 'level';
									const upgrade = isLevel ? null : getNextTierUpgrade(group.levelId, 1);
									return (
										<div
											key={isLevel ? item.levelId : item.courseCode}
											className={`cart-drawer__item${isLevel ? ' cart-drawer__item--level' : ''}`}
										>
											<div className="cart-drawer__item-info">
												<span className="cart-drawer__item-name">
													{isLevel ? item.levelTitle : `${item.courseCode} – ${item.courseName}`}
												</span>
												{isLevel && (
													<span className="cart-drawer__item-badge">
														📚 Full Level · {item.courseCount} courses
													</span>
												)}
												{upgrade && (
													<span className="cart-drawer__item-badge cart-drawer__item-badge--upsell">
														+1 subject for just {formatAmount(getPriceForCountry(upgrade.extra, selectedCountry))}
													</span>
												)}
											</div>
											<span className="cart-drawer__item-price">{formatAmount(getItemPrice(item, selectedCountry))}</span>
											<button
												className="cart-drawer__item-remove"
												onClick={() => removeItem(isLevel ? item.levelId : item.courseCode)}
												aria-label="Remove item"
											>
												×
											</button>
										</div>
									);
								});
							})
						)}
					</div>

					<div className="cart-drawer__footer">
						<p className="cart-drawer__note">
							ℹ️ Pricing will be confirmed upon enrollment. Displayed prices are indicative.
						</p>
						{cartSavings > 0 && (
							<div className="cart-drawer__savings">
								<span>Bundle savings</span>
								<span>− {formatAmount(cartSavings)}</span>
							</div>
						)}
						{cartFees.map(fee => (
							<div key={fee.key} className="cart-drawer__fee">
								<span>{fee.title}</span>
								<span>{formatAmount(fee.amount)}</span>
							</div>
						))}
						<div className="cart-drawer__total">
							<span>Estimated Total</span>
							<span>{formatAmount(cartTotal)}</span>
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
