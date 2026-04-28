import { useLocation, Link } from 'react-router-dom';
import './RegistrationSuccessPage.css';

export default function RegistrationSuccessPage() {
	const location = useLocation();
	const { cimaType, mockType } = location.state || {};
	const selectedCimaType = cimaType || 'selected case study';
	const selectedMockType = mockType || 'Nanaska Edge registration';

	return (
		<div className="registration-success-page">
			<div className="registration-success-container">
				<div className="registration-success-card">
					<div className="registration-success-icon">✓</div>
					<h1 className="registration-success-title">Registration Successful!</h1>
					<p className="registration-success-message">
						Thank you for registering for <strong>{selectedMockType}</strong> for <strong>{selectedCimaType}</strong>.
					</p>
					<p className="registration-success-info">
						Our team will be in touch shortly with further instructions and access details.
					</p>
					<div className="registration-success-actions">
						<Link to="/nanaska-edge" className="registration-success-btn registration-success-btn--primary">
							Back to Nanaska Edge
						</Link>
						<Link to="/" className="registration-success-btn registration-success-btn--outline">
							Go to Homepage
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
