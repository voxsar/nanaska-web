import CourseLevelPage from '../components/CourseLevelPage';

const CERTIFICATE_LEVEL = {
  title: 'CIMA Certificate Level',
  currentPath: '/cima-certificate-level',
  badge: '📗',
  tagline: 'Your gateway to the CIMA qualification — building essential foundations in business, accounting, and management.',
  duration: '6–12 months',
  qualification: 'CIMA Certificate in Business Accounting',
  color: '#16a34a',
  gradient: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #16a34a 100%)',
  subjects: [
    {
      code: 'BA1',
      name: 'Fundamentals of Business Economics',
      icon: '📊',
      subtitle: 'Enterprise, economics & the global business environment',
      description:
        'BA1 provides a thorough grounding in micro and macroeconomics, exploring how businesses operate within global markets. Students examine the economic environment and its impact on business decisions and performance.',
      highlights: [
        'Microeconomics — supply, demand and market equilibrium',
        'Macroeconomics — GDP, inflation, interest rates',
        'International trade and globalisation',
        'Business cycles and economic indicators',
        'Government policy and its effects on business',
        'Financial markets and institutions',
      ],
      syllabus: [
        { topic: 'The Global Business Environment', desc: 'Understanding how political, economic, social, and technological forces shape the business landscape.' },
        { topic: 'Microeconomic Analysis', desc: 'Supply and demand, price elasticity, market structures and competitive behaviour.' },
        { topic: 'Macroeconomic Policy', desc: 'Fiscal and monetary policy tools and their effects on business and investment.' },
        { topic: 'International Trade & Finance', desc: 'Exchange rates, balance of payments, international trade agreements and protectionism.' },
        { topic: 'Financial Markets & Institutions', desc: 'Role of financial intermediaries, capital markets, and the banking system.' },
      ],
      outcomes: [
        'Explain the role of markets and pricing mechanisms in resource allocation.',
        'Analyse macroeconomic data and assess the impact on business strategy.',
        'Evaluate international trade patterns and the effects of exchange rate movements.',
        'Understand the function of financial institutions and capital markets.',
        'Apply economic principles to business decision-making scenarios.',
      ],
    },
    {
      code: 'BA2',
      name: 'Fundamentals of Management Accounting',
      icon: '🧮',
      subtitle: 'Costing, budgeting and management information systems',
      description:
        'BA2 covers the core principles of management accounting, equipping students with skills to gather, analyse and use cost and management information to support planning, control and decision-making within organisations.',
      highlights: [
        'Cost classification and behaviour',
        'Absorption and marginal costing methods',
        'Budgeting and budgetary control',
        'Standard costing and variance analysis',
        'Cost–volume–profit (CVP) analysis',
        'Decision-making techniques',
      ],
      syllabus: [
        { topic: 'Costing Principles', desc: 'Cost objects, cost classification, direct/indirect costs and cost behaviour.' },
        { topic: 'Costing Methods', desc: 'Job, batch, process and service costing, absorption vs marginal costing.' },
        { topic: 'Budgeting', desc: 'Preparing functional and master budgets, flexed budgets and budgetary control.' },
        { topic: 'Standard Costing', desc: 'Setting standards, calculating variances and interpreting results.' },
        { topic: 'Decision Making', desc: 'CVP analysis, relevant costs, limiting factors and short-run decisions.' },
      ],
      outcomes: [
        'Prepare and interpret cost statements using various costing methods.',
        'Construct and analyse budgets to support financial planning and control.',
        'Calculate and interpret standard cost variances.',
        'Apply relevant costing principles to short-term business decisions.',
        'Understand the role of management accounting in supporting organisational strategy.',
      ],
    },
    {
      code: 'BA3',
      name: 'Fundamentals of Financial Accounting',
      icon: '📑',
      subtitle: 'Financial reporting, the accounting equation & double-entry bookkeeping',
      description:
        'BA3 introduces students to financial accounting and the preparation of financial statements. It covers the regulatory framework, accounting principles, double-entry bookkeeping, and the preparation of financial statements for sole traders, partnerships and companies.',
      highlights: [
        'Double-entry bookkeeping principles',
        'Preparation of trial balance and financial statements',
        'Accounting for assets, liabilities and equity',
        'Accruals, prepayments and provisions',
        'Partnership accounts',
        'Introduction to company accounts',
      ],
      syllabus: [
        { topic: 'Accounting Fundamentals', desc: 'The accounting equation, double-entry system and the accounting cycle.' },
        { topic: 'Preparing Financial Statements', desc: 'Income statements, balance sheets and cash flow statements for different entity types.' },
        { topic: 'Accounting Adjustments', desc: 'Depreciation, accruals, prepayments, bad debts and provisions.' },
        { topic: 'Partnership Accounts', desc: 'Appropriation accounts, capital and current accounts, admission and retirement of partners.' },
        { topic: 'Introduction to Company Accounts', desc: 'Share capital, retained earnings, basic presentation under IFRS.' },
      ],
      outcomes: [
        'Apply double-entry bookkeeping to record business transactions accurately.',
        'Prepare trial balances and basic financial statements.',
        'Account for common adjustments such as depreciation and accruals.',
        'Prepare financial statements for partnerships and sole traders.',
        'Understand the basic structure of company financial statements.',
      ],
    },
    {
      code: 'BA4',
      name: 'Fundamentals of Ethics, Corporate Governance and Business Law',
      icon: '⚖️',
      subtitle: 'Ethics, governance frameworks and the legal context of business',
      description:
        'BA4 provides the ethical and legal grounding that underpins the CIMA qualification. Students study corporate governance frameworks, professional ethics, sustainability and the legal context within which businesses operate.',
      highlights: [
        'CIMA Code of Ethics and professional conduct',
        'Corporate governance principles and frameworks',
        'Sustainability and integrated reporting',
        'Contract law and employment law basics',
        'Company law and directors\' duties',
        'Data protection and cybersecurity awareness',
      ],
      syllabus: [
        { topic: 'Business Ethics', desc: 'Ethical frameworks, professional scepticism and resolution of ethical dilemmas.' },
        { topic: 'Corporate Governance', desc: 'Governance codes, board structures, audit committees and shareholder rights.' },
        { topic: 'Sustainability & Integrated Reporting', desc: '<IR> Framework, ESG considerations and non-financial reporting.' },
        { topic: 'Business Law Essentials', desc: 'Formation and enforcement of contracts, consumer protection and employment law.' },
        { topic: 'Company Law', desc: 'Company formation, share capital, directors\' duties and insolvency basics.' },
      ],
      outcomes: [
        'Apply the CIMA Code of Ethics to identify and resolve professional ethical issues.',
        'Explain the principles of good corporate governance and their significance.',
        'Discuss sustainability reporting and integrated thinking.',
        'Understand key elements of contract law and employment law.',
        'Outline the legal duties of company directors and the rights of shareholders.',
      ],
    },
  ],
  whyPoints: [
    { icon: '🌱', title: 'Perfect Starting Point', desc: 'No prior accounting knowledge required — BA1-BA4 build your foundations from the ground up.' },
    { icon: '🏅', title: 'Internationally Recognised', desc: 'The Certificate in Business Accounting (CBA) is valued by employers across the globe.' },
    { icon: '🔑', title: 'Gateway to CGMA', desc: 'Completing the Certificate Level unlocks the path to the full CGMA designation.' },
    { icon: '📱', title: 'Flexible Learning', desc: 'Study online with Nanaska\'s LMS and expert tutor support available 24/7.' },
    { icon: '🧪', title: 'Mock Exam Practice', desc: 'Prepare with Nanaska\'s dedicated exam engine and up to 10 full mock exams.' },
    { icon: '🤝', title: 'Personalised Support', desc: 'Individual attention from industry-expert lecturers who know what it takes to pass.' },
  ],
};

export default function CertificateLevelPage() {
  return <CourseLevelPage level={CERTIFICATE_LEVEL} />;
}
