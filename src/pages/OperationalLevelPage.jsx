import CourseLevelPage from '../components/CourseLevelPage';

const OPERATIONAL_LEVEL = {
  title: 'CIMA Operational Level',
  currentPath: '/cima-operational-level',
  badge: '📘',
  tagline: 'Build your operational finance skills — managing finances in the digital age, reporting, and management accounting.',
  duration: '6–18 months',
  qualification: 'CIMA Diploma in Management Accounting',
  color: '#2563eb',
  gradient: 'linear-gradient(135deg, #0c1445 0%, #1e40af 50%, #2563eb 100%)',
  subjects: [
    {
      code: 'E1',
      name: 'Managing Finance in a Digital World',
      icon: '💻',
      subtitle: 'The role of finance and digital technologies in business',
      description:
        'E1 examines the evolving role of the finance function in a digital business environment. Students explore digital technologies, data analytics, automation and the changing skills required of finance professionals.',
      highlights: [
        'The digital finance function and its evolution',
        'Data analytics and business intelligence',
        'Automation, RPA and AI in finance',
        'Cloud computing and ERP systems',
        'Cybersecurity and data governance',
        'Digital transformation strategy',
      ],
      syllabus: [
        { topic: 'The Finance Function', desc: 'Role of finance in modern organisations, shared services and finance business partnering.' },
        { topic: 'Digital Technologies', desc: 'Big data, analytics, automation, AI and machine learning in finance.' },
        { topic: 'Information Systems', desc: 'ERP systems, cloud computing, data management and governance.' },
        { topic: 'Data Security & Ethics', desc: 'Cybersecurity risks, data protection regulations and ethical use of data.' },
        { topic: 'Digital Strategy', desc: 'Supporting digital transformation and change management within finance.' },
      ],
      outcomes: [
        'Explain how digital technologies are transforming the finance function.',
        'Evaluate the use of data analytics and automation in financial processes.',
        'Assess the risks and benefits of cloud-based and ERP systems.',
        'Apply principles of data governance and cybersecurity in a finance context.',
        'Support digital transformation initiatives within organisations.',
      ],
    },
    {
      code: 'F1',
      name: 'Financial Reporting',
      icon: '📋',
      subtitle: 'Preparation and analysis of financial statements under IFRS',
      description:
        'F1 develops students\' ability to prepare and interpret financial statements for individual companies and groups in accordance with IFRS. Topics include consolidation, financial instruments and reporting frameworks.',
      highlights: [
        'IFRS conceptual framework',
        'Preparation of single entity financial statements',
        'Group accounts — consolidation basics',
        'Revenue recognition (IFRS 15)',
        'Leases (IFRS 16)',
        'Financial instruments overview',
      ],
      syllabus: [
        { topic: 'The Financial Reporting Framework', desc: 'IASB conceptual framework, qualitative characteristics and the standard-setting process.' },
        { topic: 'Single Entity Financial Statements', desc: 'P&L, OCI, balance sheet, cash flow statement and notes under IFRS.' },
        { topic: 'Group Accounts', desc: 'Consolidation, elimination of intra-group transactions, goodwill and non-controlling interests.' },
        { topic: 'Key IFRS Standards', desc: 'IFRS 15 (Revenue), IFRS 16 (Leases), IFRS 9 (Financial Instruments).' },
        { topic: 'Interpretation & Analysis', desc: 'Ratio analysis, horizontal/vertical analysis and limitations of financial statements.' },
      ],
      outcomes: [
        'Prepare financial statements for single entities in accordance with IFRS.',
        'Construct basic consolidated financial statements including goodwill calculations.',
        'Apply key IFRS standards including IFRS 15, 16 and IFRS 9.',
        'Analyse and interpret financial statements using key ratios.',
        'Explain the role and authority of the IASB and national standard setters.',
      ],
    },
    {
      code: 'P1',
      name: 'Management Accounting',
      icon: '📈',
      subtitle: 'Advanced costing, planning, control and performance measurement',
      description:
        'P1 advances students\' management accounting skills, covering advanced costing techniques, pricing strategies, performance measurement, and risk in the context of planning and control within organisations.',
      highlights: [
        'Activity-based costing (ABC)',
        'Target costing and value engineering',
        'Transfer pricing',
        'Throughput accounting',
        'Pricing strategies',
        'Budgetary control and beyond budgeting',
      ],
      syllabus: [
        { topic: 'Advanced Costing Techniques', desc: 'ABC, throughput accounting, life-cycle costing and target costing.' },
        { topic: 'Pricing Decisions', desc: 'Pricing strategies, price elasticity, market-based and cost-plus pricing.' },
        { topic: 'Short-run Decisions', desc: 'Relevant costing, limiting factors, make or buy, and shutdown decisions.' },
        { topic: 'Planning & Budgeting', desc: 'Budgetary systems, beyond budgeting, rolling forecasts and zero-based budgeting.' },
        { topic: 'Performance Management', desc: 'Financial and non-financial KPIs, balanced scorecard, responsibility centres.' },
      ],
      outcomes: [
        'Apply advanced costing techniques including ABC and throughput accounting.',
        'Make pricing decisions using both cost-based and market-based approaches.',
        'Analyse short-run operational decisions using relevant costing principles.',
        'Design and evaluate budgeting systems appropriate to the organisation.',
        'Select and apply performance measurement frameworks including the balanced scorecard.',
      ],
    },
    {
      code: 'OCS',
      name: 'Operational Case Study',
      icon: '🏗️',
      subtitle: 'Integrated assessment combining E1, F1 and P1',
      description:
        'The Operational Case Study (OCS) is a three-hour integrated assessment that tests students\' ability to apply knowledge from E1, F1 and P1 in a realistic business scenario. It assesses professional skills including communication, analysis and judgement.',
      highlights: [
        'Integration of E1, F1 and P1 knowledge',
        'Realistic business scenario with pre-seen material',
        'Analysis and application of operational finance skills',
        'Professional communication and report writing',
        'Commercial awareness and judgement',
        'Expert coaching with Nanaska\'s case study specialist',
      ],
      syllabus: [
        { topic: 'Pre-Seen Analysis', desc: 'Analysing the case study context, industry, business model and strategic position.' },
        { topic: 'Financial Reporting Application', desc: 'Applying F1 knowledge to prepare and interpret financial information in context.' },
        { topic: 'Management Accounting Application', desc: 'Using P1 tools for costing, budgeting and performance measurement in the scenario.' },
        { topic: 'Digital Finance in Context', desc: 'Applying E1 digital concepts within the operational business scenario.' },
        { topic: 'Exam Technique', desc: 'Time management, answering variant tasks and presenting professional-quality responses.' },
      ],
      outcomes: [
        'Integrate knowledge across E1, F1 and P1 to address complex operational issues.',
        'Analyse a business scenario using financial and non-financial information.',
        'Produce professional-quality written responses tailored to senior management audiences.',
        'Demonstrate commercial awareness and sound business judgement.',
        'Perform effectively under exam conditions with structured time management.',
      ],
    },
  ],
  whyPoints: [
    { icon: '⚡', title: 'Digital-Ready Finance', desc: 'E1 prepares you for the technology-driven finance function of the future.' },
    { icon: '📊', title: 'Strong IFRS Foundations', desc: 'F1 builds robust financial reporting skills recognised by employers globally.' },
    { icon: '🎯', title: 'Advanced Management Tools', desc: 'P1 equips you with decision-making tools used by senior finance professionals.' },
    { icon: '🏆', title: 'Case Study Excellence', desc: 'Nanaska\'s Channa Gunawardana is Sri Lanka\'s foremost CIMA case study specialist.' },
    { icon: '💡', title: 'Industry-Expert Lecturers', desc: 'Learn from finance professionals actively working at the top of their fields.' },
    { icon: '🌐', title: 'Global Recognition', desc: 'Completing the Operational Level earns you CIMA\'s Diploma in Management Accounting.' },
  ],
};

export default function OperationalLevelPage() {
  return <CourseLevelPage level={OPERATIONAL_LEVEL} />;
}
