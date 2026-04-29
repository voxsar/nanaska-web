import { Link } from 'react-router-dom';
import './PrivacyPolicyPage.css';

const SECTIONS = [
  {
    title: 'Collection of your personal data',
    content: [
      'We collect your personal data when you ask for information about our courses or study materials, when you submit your answers to our assessment quizzes or surveys, when you enroll in one of our courses or order study materials.',
      'To process your enquiries and assessment quizzes or surveys, we collect your name, CIMA ID, email and postal addresses, daytime phone number, and, if applicable, company and type of business.',
      'To process enrolments and orders, we ask for your name, CIMA ID, email and postal addresses, daytime phone number, company name and address, training manager\'s name, mobile and home telephone numbers, date of birth, professional certification or registration information, if any, and credit or debit card information.',
      'In addition, the mobile applications may collect certain information automatically, including, but not limited to, the type of mobile device you use, your mobile device\'s unique device ID, the IP address of your mobile device, your mobile operating system, the type of mobile internet browsers you use, and information about the way you use the applications.',
      'We may also use your postal and email addresses to send you information about further professional training, and other services or products similar to those you have ordered from us, or to send you an invitation to solicit such information from our sibling companies. If you do not wish us to send you this additional information, you can let us know by following the opt-out instructions that we include in every email, or by sending us notice of your preferences through the mechanisms listed in the section below entitled Your Ability to Choose.',
    ],
  },
  {
    title: 'Sharing your data',
    content: [
      'We will need to use your data to perform our obligations and exercise our rights under agreements made with you and to inform you of feedback and exam results.',
      'If you have enrolled in our courses through your employer, we will share your data and course attendance and test results with your employer.',
      'If you enroll in any of our programmes, we will share your data with AAT, ACCA and CIMA. Please note that this is limited to sharing individual data only with the relevant institution.',
      'We will share your personal data only with the service providers who help us run this site or fulfill your requests and with other sibling companies to enable processing and administration of study material orders or to enable them to inform you about services and products which may be of interest to you. We may also need to disclose your personal data to third parties when we, in our sole discretion, believe it is necessary to comply with the law, to enforce our User Agreement or this Privacy Policy, or in connection with a sale or transfer of the Nanaska.com.',
    ],
  },
  {
    title: 'Transfer of your data outside your country',
    content: [
      'As we are an international business with employees, affiliates and service providers all over the world, please note that the personal data you provide to us may be transferred to and processed and stored in Sri Lanka or other countries, including without limitation your home country, the country in which you plan to matriculate or other countries where Nanaska has offices. Although the data protection laws of these various countries may not be as comprehensive as those in your own country, Nanaska will take appropriate steps to ensure that personal data is handled as described in this Policy.',
      'By providing personal data and other information to us, you understand and consent to the collection, use, processing, disclosure and transfer of such personal data to Sri Lanka and other countries where Nanaska has offices and service providers.',
    ],
  },
  {
    title: 'Your ability to choose',
    content: [
      'As mentioned above, we may use your email or postal address to send you information on obtaining or maintaining your professional qualification, or other services or products we or other sibling companies think might interest you. We also may share your data with other sibling companies. If you do not wish to receive such information from us or other companies, or you do not wish us to share your data in this manner, you can let us know by contacting us at:',
    ],
    address: [
      'Attention: Privacy Inquiry Nanaska',
      '104/11, Lake Road',
      'Boralesgamuwa',
      'Sri Lanka 10290',
    ],
  },
  {
    title: 'Review and correction',
    content: [
      'You may review and update the personal data you have provided to us by emailing us at info@nanaska.com or sending your request by post to:',
    ],
    address: [
      'Attention: Privacy Inquiry Nanaska',
      '104/11, Lake Road',
      'Boralesgamuwa',
      'Sri Lanka 10290',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="privacy-page">

      {/* Hero */}
      <section className="privacy-page__hero">
        <div className="privacy-page__hero-inner">
          <p className="privacy-page__breadcrumb">
            <Link to="/">Home</Link> &rsaquo; Privacy Policy
          </p>
          <h1 className="privacy-page__title">Privacy Policy</h1>
          <p className="privacy-page__subtitle">
            How we collect, use, and protect your personal data.
          </p>
        </div>
        <svg className="privacy-page__hero-wave" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f9fbff" />
        </svg>
      </section>

      {/* Intro */}
      <section className="privacy-page__body">
        <div className="privacy-page__container">

          <div className="privacy-page__intro">
            <p>
              This is the privacy policy (&ldquo;Privacy Policy&rdquo;) for Nanaska educational website. It describes how we treat personal data received about you when you visit the <strong>Nanaska.com</strong> website or otherwise. Please read this Privacy Policy carefully, because by visiting or using this site or contracting with us, you agree to its terms. This Privacy Policy applies only to this website and associated mobile applications, and LearnCIMA forums.
            </p>
            <p>
              We may revise this Privacy Policy from time to time. We will notify you of any important changes by posting a notice on all Privacy Policy links. If you see a notice of change, please check the Privacy Policy, because your continued use of the site after we post the change means you have agreed to the new terms.
            </p>
          </div>

          {/* Sections */}
          {SECTIONS.map((section, i) => (
            <div key={i} className="privacy-page__section">
              <h2 className="privacy-page__section-title">{section.title}</h2>
              {section.content.map((para, j) => (
                <p key={j}>{para}</p>
              ))}
              {section.address && (
                <address className="privacy-page__address">
                  {section.address.map((line, k) => (
                    <span key={k}>{line}</span>
                  ))}
                </address>
              )}
            </div>
          ))}

        </div>
      </section>

    </div>
  );
}
