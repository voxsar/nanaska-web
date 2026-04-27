import { Link } from 'react-router-dom';
import './NanaskaEdgePage.css';

const EDGE_FEATURES = [
	{
		title: 'Mock Exams',
		description: 'Full timed CIMA mock exam papers with multi-part questions, sub-questions, attempt tracking, suggested answers, and shareable public result summaries.',
		icon: '🎯',
		benefit: 'Experience real exam conditions and build confidence'
	},
	{
		title: 'Practice Questions',
		description: 'Individual targeted-practice questions linked to pre-seen documents, with attempts, suggested answers, and public result sharing.',
		icon: '✍️',
		benefit: 'Master specific topics at your own pace'
	},
	{
		title: 'Past Papers',
		description: 'Comprehensive library of CIMA past papers with detailed view pages to understand exam patterns and expectations.',
		icon: '📚',
		benefit: 'Learn from historical exam patterns and improve preparation'
	},
	{
		title: 'Pre-Seen Documents',
		description: 'Upload, view, and reference CIMA pre-seen materials with an integrated PDF citation viewer for easy navigation.',
		icon: '📄',
		benefit: 'Stay organized with all your exam materials in one place'
	},
	{
		title: 'Automated Marking',
		description: 'Instant AI-powered marking for both mock exams and practice questions, providing immediate feedback on your performance.',
		icon: '⚡',
		benefit: 'Get instant feedback and cut marking time by 90%'
	},
	{
		title: 'Ask Preseen',
		description: 'Specialized question-asking interface tied directly to pre-seen materials, helping you understand complex scenarios.',
		icon: '🔎',
		benefit: 'Master preseen materials with targeted AI assistance'
	},
	{
		title: 'Typing Tutor',
		description: 'Typing practice with progress tracking and sessions to improve your speed and accuracy for timed exams.',
		icon: '⌨️',
		benefit: 'Increase typing speed and save valuable exam time'
	},
	{
		title: 'Educational Video Library',
		description: 'On-demand video learning library with expert explanations and walkthroughs of complex topics.',
		icon: '🎥',
		benefit: 'Learn visually with expert-led video content'
	},
	{
		title: 'Business Models Library',
		description: 'Reference library of business models with student responses to help you understand different frameworks.',
		icon: '📊',
		benefit: 'Apply proven business frameworks to your answers'
	}
];

const KEY_BENEFITS = [
	{
		icon: '⏱️',
		title: 'Marking Time Cut by 90%',
		description: 'AI-powered automated marking provides instant feedback, eliminating the wait for manual marking and accelerating your learning cycle.'
	},
	{
		icon: '📖',
		title: 'Master Preseen Materials',
		description: 'Ask Preseen feature helps you deeply understand preseen documents through targeted questioning and AI-guided exploration.'
	},
	{
		icon: '📄',
		title: 'Past Papers Mastery',
		description: 'Comprehensive past paper library helps you understand exam patterns, question styles, and marking expectations.'
	},
	{
		icon: '🎯',
		title: 'Exam-Ready Confidence',
		description: 'Full mock exams with real-time marking and detailed feedback ensure you are fully prepared for exam day.'
	}
];

export default function NanaskaEdgePage() {
	return (
		<div className="edge-page">
			{/* Hero Section */}
			<section className="edge-hero">
				<div className="edge-hero__inner">
					<div className="edge-hero__badge">
						<span className="edge-hero__badge-icon">🚀</span>
						<span>Introducing Nanaska Edge</span>
					</div>
					<h1 className="edge-hero__title">
						The Future of <span className="edge-hero__title-accent">CIMA Preparation</span>
					</h1>
					<p className="edge-hero__subtitle">
						AI-powered exam preparation platform that transforms how you study for CIMA.
						Get instant feedback, personalized guidance, and comprehensive resources all in one place.
					</p>
					<div className="edge-hero__stats">
						<div className="edge-hero__stat">
							<span className="edge-hero__stat-num">90%</span>
							<span className="edge-hero__stat-label">Faster Marking</span>
						</div>
						<div className="edge-hero__stat">
							<span className="edge-hero__stat-num">24/7</span>
							<span className="edge-hero__stat-label">AI Tutor Support</span>
						</div>
						<div className="edge-hero__stat">
							<span className="edge-hero__stat-num">100%</span>
							<span className="edge-hero__stat-label">Instant Feedback</span>
						</div>
					</div>
				</div>
				<div className="edge-hero__wave">
					<svg viewBox="0 0 1440 80" preserveAspectRatio="none">
						<path fill="#f9fbff" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
					</svg>
				</div>
			</section>

			{/* Mock Options Section */}
			<section className="edge-mock-options">
				<div className="edge-container">
					<div className="edge-section-header">
						<h2 className="edge-section-title">Choose Your Mock Exam Type</h2>
						<p className="edge-section-subtitle">
							Select the type of mock exam that fits your preparation needs
						</p>
					</div>
					<div className="edge-mock-grid">
						<div className="edge-mock-card">
							<div className="edge-mock-card__icon">🎯</div>
							<h3 className="edge-mock-card__title">Free Mock Exam</h3>
							<p className="edge-mock-card__desc">
								Try our platform with a complimentary mock exam. Experience AI-powered marking and instant feedback.
							</p>
							<ul className="edge-mock-card__features">
								<li>✓ Full timed mock exam</li>
								<li>✓ AI-powered instant marking</li>
								<li>✓ Detailed performance feedback</li>
								<li>✓ No credit card required</li>
							</ul>
							<Link to="/nanaska-edge/free-mock/select-cima-type" className="edge-mock-card__btn edge-mock-card__btn--primary">
								Start Free Mock
							</Link>
						</div>
						<div className="edge-mock-card">
							<div className="edge-mock-card__icon">📚</div>
							<h3 className="edge-mock-card__title">Revision Session Mock</h3>
							<p className="edge-mock-card__desc">
								Comprehensive revision mocks designed to solidify your understanding and boost exam confidence.
							</p>
							<ul className="edge-mock-card__features">
								<li>✓ Multiple practice sessions</li>
								<li>✓ Topic-specific revision</li>
								<li>✓ Progress tracking</li>
								<li>✓ Expert-designed questions</li>
							</ul>
							<Link to="/nanaska-edge/revision-mock/select-cima-type" className="edge-mock-card__btn edge-mock-card__btn--secondary">
								Start Revision Mock
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Key Benefits Section */}
			<section className="edge-benefits">
				<div className="edge-container">
					<div className="edge-section-header">
						<span className="edge-section-icon">🎯</span>
						<h2 className="edge-section-title">How Edge Helps You Succeed</h2>
						<p className="edge-section-subtitle">
							Powerful features designed to accelerate your learning and boost exam performance
						</p>
					</div>
					<div className="edge-benefits-grid">
						{KEY_BENEFITS.map((benefit) => (
							<div key={benefit.title} className="edge-benefit-card">
								<div className="edge-benefit-card__icon">{benefit.icon}</div>
								<h3 className="edge-benefit-card__title">{benefit.title}</h3>
								<p className="edge-benefit-card__desc">{benefit.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="edge-features" id="features">
				<div className="edge-container">
					<div className="edge-section-header">
						<span className="edge-section-icon">✨</span>
						<h2 className="edge-section-title">Complete Feature Set</h2>
						<p className="edge-section-subtitle">
							Everything you need to excel in your CIMA exams, powered by cutting-edge AI
						</p>
					</div>

					<div className="edge-feature-grid">
						{EDGE_FEATURES.map((feature) => (
							<div key={feature.title} className="edge-feature-card">
								<div className="edge-feature-card__icon">{feature.icon}</div>
								<div className="edge-feature-card__content">
									<h4 className="edge-feature-card__title">{feature.title}</h4>
									<p className="edge-feature-card__desc">{feature.description}</p>
									<div className="edge-feature-card__benefit">
										<span className="edge-feature-card__benefit-icon">✓</span>
										<span className="edge-feature-card__benefit-text">{feature.benefit}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Additional Tools Section */}
			<section className="edge-tools">
				<div className="edge-container">
					<div className="edge-section-header">
						<span className="edge-section-icon">🔧</span>
						<h2 className="edge-section-title">Additional Student Tools</h2>
					</div>
					<div className="edge-tools-grid">
						<div className="edge-tool-card">
							<span className="edge-tool-card__icon">📊</span>
							<h3 className="edge-tool-card__title">Progress Tracking</h3>
							<p className="edge-tool-card__desc">
								Comprehensive dashboard tracks your progress across all activities, highlighting strengths and areas for improvement.
							</p>
						</div>
						<div className="edge-tool-card">
							<span className="edge-tool-card__icon">🔔</span>
							<h3 className="edge-tool-card__title">Real-Time Updates</h3>
							<p className="edge-tool-card__desc">
								Toast notifications and announcements keep you informed of important updates and deadlines.
							</p>
						</div>
						<div className="edge-tool-card">
							<span className="edge-tool-card__icon">💬</span>
							<h3 className="edge-tool-card__title">Student Q&A</h3>
							<p className="edge-tool-card__desc">
								Ask questions, get answers, and collaborate with fellow students in our interactive Q&A system.
							</p>
						</div>
						<div className="edge-tool-card">
							<span className="edge-tool-card__icon">⚙️</span>
							<h3 className="edge-tool-card__title">Personalization</h3>
							<p className="edge-tool-card__desc">
								Customize your learning experience with student preferences and personalized settings.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Why Edge is Different */}
			<section className="edge-difference">
				<div className="edge-container">
					<div className="edge-difference-content">
						<div className="edge-section-header">
							<span className="edge-section-icon edge-section-icon--light">💡</span>
							<h2 className="edge-section-title">Why Nanaska Edge?</h2>
						</div>
						<div className="edge-difference-grid">
							<div className="edge-difference-item">
								<span className="edge-difference-item__num">01</span>
								<h3 className="edge-difference-item__title">AI-Powered Intelligence</h3>
								<p className="edge-difference-item__desc">
									Advanced AI marking and tutoring provide instant, accurate feedback that adapts to your learning style.
								</p>
							</div>
							<div className="edge-difference-item">
								<span className="edge-difference-item__num">02</span>
								<h3 className="edge-difference-item__title">Comprehensive Coverage</h3>
								<p className="edge-difference-item__desc">
									From mock exams to industry knowledge, every tool you need for CIMA success is integrated in one platform.
								</p>
							</div>
							<div className="edge-difference-item">
								<span className="edge-difference-item__num">03</span>
								<h3 className="edge-difference-item__title">Time-Saving Automation</h3>
								<p className="edge-difference-item__desc">
									Automated marking and instant feedback mean you spend more time learning and less time waiting for results.
								</p>
							</div>
							<div className="edge-difference-item">
								<span className="edge-difference-item__num">04</span>
								<h3 className="edge-difference-item__title">Expert-Designed Content</h3>
								<p className="edge-difference-item__desc">
									All content created by experienced CIMA examiners and tutors, ensuring alignment with exam standards.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="edge-cta">
				<div className="edge-container edge-cta__inner">
					<div className="edge-cta__content">
						<h2 className="edge-cta__title">Ready to Experience the Edge Advantage?</h2>
						<p className="edge-cta__subtitle">
							Join thousands of students using Nanaska Edge to accelerate their CIMA journey.
							Get instant AI feedback, 24/7 tutor support, and comprehensive exam preparation tools.
						</p>
						<div className="edge-cta__actions">
							<Link to="/enrollment" className="edge-cta__btn edge-cta__btn--primary">
								Start Your Free Trial
							</Link>
							<Link to="/contact" className="edge-cta__btn edge-cta__btn--outline">
								Contact Us
							</Link>
						</div>
					</div>
					<div className="edge-cta__features">
						<div className="edge-cta__feature">✓ Instant AI marking & feedback</div>
						<div className="edge-cta__feature">✓ Comprehensive mock exams</div>
						<div className="edge-cta__feature">✓ Educational video library</div>
						<div className="edge-cta__feature">✓ Progress tracking & analytics</div>
						<div className="edge-cta__feature">✓ Past papers library</div>
						<div className="edge-cta__feature">✓ Typing tutor practice</div>
					</div>
				</div>
			</section>
		</div>
	);
}
