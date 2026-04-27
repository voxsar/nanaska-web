import { useLocation, Link } from 'react-router-dom';
import './RegistrationSuccessPage.css';

export default function RegistrationSuccessPage() {
	const location = useLocation();
	const { cimaType, mockType } = location.state || {};

	return (
		<div className="registration-success-page">
			<div className="registration-success-container">
				<div className="registration-success-card">
					<div className="registration-success-icon">✓</div>
					<h1 className="registration-success-title">Registration Successful!</h1>
					<p className="registration-success-message">
						Thank you for registering for the <strong>{mockType}</strong> at the <strong>{cimaType}</strong> level.
					</p>
					<p className="registration-success-info">
						Our team will be in touch with you shortly via email with further instructions and access details.
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
