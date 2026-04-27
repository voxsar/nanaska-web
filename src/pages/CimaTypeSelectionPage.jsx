import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CimaTypeSelectionPage.css';

const CIMA_TYPES = [
	{
		id: 'certificate',
		name: 'Certificate Level',
		code: 'CERT',
		enabled: true,
		description: 'Foundation-level exams covering core business concepts',
		exams: ['BA1', 'BA2', 'BA3', 'BA4']
	},
	{
		id: 'operational',
		name: 'Operational Level',
		code: 'OPR',
		enabled: true,
		description: 'Intermediate-level exams focused on operational management',
		exams: ['E1', 'P1', 'F1']
	},
	{
		id: 'management',
		name: 'Management Level',
		code: 'MGT',
		enabled: true,
		description: 'Advanced-level exams on strategic management',
		exams: ['E2', 'P2', 'F2']
	},
	{
		id: 'strategic',
		name: 'Strategic Level',
		code: 'STR',
		enabled: false,
		description: 'Case study exam testing integrated strategic thinking',
		exams: ['Strategic Case Study']
	}
];

export default function CimaTypeSelectionPage() {
	const { mockType } = useParams(); // 'free-mock' or 'revision-mock'
	const navigate = useNavigate();
	const [selectedType, setSelectedType] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		cimaId: ''
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');

	const mockTypeLabel = mockType === 'free-mock' ? 'Free Mock Exam' : 'Revision Session Mock';

	const handleTypeSelect = (type) => {
		if (type.enabled) {
			setSelectedType(type);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitError('');

		try {
			const payload = {
				...formData,
				cimaType: selectedType.id,
				cimaTypeName: selectedType.name,
				mockType: mockType,
				mockTypeLabel: mockTypeLabel,
				registeredAt: new Date().toISOString()
			};

			// Send to n8n webhook
			const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.nanaska.com/webhook/edge-mock-registration';

			const response = await fetch(n8nWebhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				throw new Error('Failed to submit registration');
			}

			// Success - redirect to a success page or show success message
			navigate('/nanaska-edge/registration-success', {
				state: {
					cimaType: selectedType.name,
					mockType: mockTypeLabel
				}
			});
		} catch (error) {
			console.error('Registration error:', error);
			setSubmitError('Failed to submit registration. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="cima-selection-page">
			<div className="cima-selection-header">
				<div className="cima-selection-container">
					<h1 className="cima-selection-title">Select Your CIMA Level</h1>
					<p className="cima-selection-subtitle">
						Choose the CIMA level for your {mockTypeLabel}
					</p>
				</div>
			</div>

			<div className="cima-selection-container cima-selection-content">
				{!selectedType ? (
					<>
						<div className="cima-types-grid">
							{CIMA_TYPES.map((type) => (
								<div
									key={type.id}
									className={`cima-type-card ${!type.enabled ? 'cima-type-card--disabled' : ''}`}
									onClick={() => handleTypeSelect(type)}
								>
									{!type.enabled && (
										<div className="cima-type-card__badge">Coming Soon</div>
									)}
									<div className="cima-type-card__header">
										<h3 className="cima-type-card__name">{type.name}</h3>
										<span className="cima-type-card__code">{type.code}</span>
									</div>
									<p className="cima-type-card__desc">{type.description}</p>
									<div className="cima-type-card__exams">
										<strong>Exams:</strong> {type.exams.join(', ')}
									</div>
									{type.enabled && (
										<button className="cima-type-card__btn">
											Select {type.code}
										</button>
									)}
								</div>
							))}
						</div>
					</>
				) : (
					<div className="cima-registration-form">
						<button
							className="cima-back-btn"
							onClick={() => setSelectedType(null)}
						>
							← Back to Level Selection
						</button>

						<div className="cima-registration-header">
							<h2>Register for {selectedType.name}</h2>
							<p>{mockTypeLabel}</p>
						</div>

						{submitError && (
							<div className="cima-error-message">
								{submitError}
							</div>
						)}

						<form onSubmit={handleSubmit} className="cima-form">
							<div className="cima-form-group">
								<label htmlFor="name">Full Name *</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									required
									placeholder="Enter your full name"
								/>
							</div>

							<div className="cima-form-group">
								<label htmlFor="email">Email Address *</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									required
									placeholder="Enter your email address"
								/>
							</div>

							<div className="cima-form-group">
								<label htmlFor="phone">Phone Number *</label>
								<input
									type="tel"
									id="phone"
									name="phone"
									value={formData.phone}
									onChange={handleInputChange}
									required
									placeholder="Enter your phone number"
								/>
							</div>

							<div className="cima-form-group">
								<label htmlFor="cimaId">CIMA Student ID (Optional)</label>
								<input
									type="text"
									id="cimaId"
									name="cimaId"
									value={formData.cimaId}
									onChange={handleInputChange}
									placeholder="Enter your CIMA student ID"
								/>
							</div>

							<button
								type="submit"
								className="cima-submit-btn"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Submitting...' : 'Register Now'}
							</button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
