import CourseLevelPage from '../components/CourseLevelPage';

const MANAGEMENT_LEVEL = {
  title: 'CIMA Management Level',
  currentPath: '/cima-management-level',
  badge: '📙',
  tagline: 'Elevate your strategic and management accounting expertise — ready to lead finance teams and drive business performance.',
  duration: '12–24 months',
  qualification: 'CIMA Advanced Diploma in Management Accounting',
  color: '#d97706',
  gradient: 'linear-gradient(135deg, #2d1000 0%, #92400e 50%, #d97706 100%)',
  subjects: [
    {
      code: 'E2',
      name: 'Managing Performance',
      icon: '🏎️',
      subtitle: 'Project management, business relationships and leading change',
      description:
        'E2 examines how organisations manage performance and relationships in modern dynamic environments. Students explore project management, people management, digital innovation and the management of change across complex organisations.',
      highlights: [
        'Organisational structure and governance',
        'Project management methodologies (PRINCE2, Agile)',
        'Stakeholder engagement and communication',
        'Change management models',
        'People management and motivation theories',
        'Managing digital transformation projects',
      ],
      syllabus: [
        { topic: 'Organisational Structures', desc: 'Types of organisation, governance frameworks and how structures enable performance.' },
        { topic: 'Project Management', desc: 'Project life cycle, planning, scheduling, risk management and benefits realisation.' },
        { topic: 'People & Change Management', desc: 'Leadership styles, motivation theory, managing resistance and organisational change models.' },
        { topic: 'Stakeholder Management', desc: 'Identifying, analysing and communicating with diverse stakeholder groups.' },
        { topic: 'Digital & Innovation', desc: 'Managing digital change projects, agile approaches and disruptive innovation.' },
      ],
      outcomes: [
        'Evaluate organisational structures and governance frameworks.',
        'Plan and manage projects using appropriate methodologies.',
        'Apply people management and change management models in business contexts.',
        'Develop stakeholder communication and engagement strategies.',
        'Manage digital transformation and innovation within finance teams.',
      ],
    },
    {
      code: 'P2',
      name: 'Advanced Management Accounting',
      icon: '📐',
      subtitle: 'Advanced planning, control and decision-making techniques',
      description:
        'P2 extends management accounting into advanced territory — covering advanced variance analysis, decision theory under uncertainty, capital investment appraisal, and strategic performance measurement systems.',
      highlights: [
        'Advanced variance analysis — planning vs operational variances',
        'Decision-making under uncertainty (maximin, maximax, minimax regret)',
        'Risk and uncertainty analysis',
        'Capital investment appraisal (NPV, IRR, ARR)',
        'Strategy and performance measurement',
        'Divisional performance — ROI, RI and EVA',
      ],
      syllabus: [
        { topic: 'Advanced Variance Analysis', desc: 'Planning and operational variances, mix and yield variances for materials and sales.' },
        { topic: 'Uncertainty & Decision Theory', desc: 'Expected values, sensitivity analysis, decision trees and scenario analysis.' },
        { topic: 'Long-run Decisions', desc: 'NPV, IRR, payback, ARR — selecting and evaluating capital investment projects.' },
        { topic: 'Divisional Performance', desc: 'ROI, residual income, Economic Value Added (EVA) and transfer pricing.' },
        { topic: 'Strategy & Control', desc: 'Strategic performance frameworks, management control systems and risk.' },
      ],
      outcomes: [
        'Calculate and interpret advanced variance analysis including planning variances.',
        'Apply decision theory techniques to problems involving risk and uncertainty.',
        'Evaluate capital investment proposals using discounted cash flow methods.',
        'Assess divisional performance using ROI, RI and EVA.',
        'Design and critique strategic management control and performance measurement systems.',
      ],
    },
    {
      code: 'F2',
      name: 'Advanced Financial Reporting',
      icon: '📰',
      subtitle: 'Complex IFRS, group accounts and financial analysis',
      description:
        'F2 advances financial reporting into complex territory — covering complex group structures, financial instruments, share-based payments, impairment, and a critical evaluation of financial reporting standards.',
      highlights: [
        'Complex group consolidations (associates, JVs)',
        'Financial instruments — IFRS 9 in depth',
        'Share-based payments (IFRS 2)',
        'Impairment of assets (IAS 36)',
        'Earnings per share (IAS 33)',
        'Evaluation and critique of IFRS standards',
      ],
      syllabus: [
        { topic: 'Complex Group Accounts', desc: 'Consolidation of associates (IAS 28), joint ventures and complex subsidiary structures.' },
        { topic: 'Financial Instruments', desc: 'IFRS 9 — classification, measurement, impairment and hedge accounting.' },
        { topic: 'Advanced IFRS Standards', desc: 'IFRS 2 (share-based payment), IAS 36 (impairment), IAS 33 (EPS), IFRS 17 (insurance).' },
        { topic: 'Reporting in Specialised Situations', desc: 'Foreign exchange, hyperinflation, segment reporting and discontinuing operations.' },
        { topic: 'Critical Evaluation', desc: 'Limitations of IFRS, debates on fair value, and current developments in financial reporting.' },
      ],
      outcomes: [
        'Prepare consolidated financial statements including associates and joint ventures.',
        'Apply IFRS 9 to classify, measure and impair financial instruments.',
        'Account for share-based payments and complex provisions.',
        'Critically evaluate financial reporting standards and their application.',
        'Analyse and interpret complex group financial statements.',
      ],
    },
    {
      code: 'MCS',
      name: 'Management Case Study',
      icon: '🏢',
      subtitle: 'Integrated assessment combining E2, P2 and F2',
      description:
        'The Management Case Study (MCS) is a three-hour integrated exam set within a realistic management-level business scenario. It tests the application of E2, P2 and F2 knowledge with particular emphasis on financial analysis, management control and strategic decision support.',
      highlights: [
        'Integration of E2, P2 and F2 knowledge',
        'Realistic management-level business scenario',
        'Strategic financial analysis and decision-making',
        'Management control and performance measurement',
        'Stakeholder communication and professional judgement',
        'Expert case study coaching by Channa Gunawardana',
      ],
      syllabus: [
        { topic: 'Pre-Seen Mastery', desc: 'Thorough analysis of the pre-seen material including financials, industry context and strategy.' },
        { topic: 'Management Accounting Application', desc: 'Using P2 techniques in the MCS scenario for performance analysis and decision support.' },
        { topic: 'Financial Reporting Application', desc: 'Applying F2 standards and analysis within management reporting contexts.' },
        { topic: 'Managing Performance in Context', desc: 'Using E2 frameworks for project management, stakeholder and change issues in the scenario.' },
        { topic: 'Exam Strategy & Mock Practice', desc: 'Full mock exams in Nanaska\'s exam engine, time management and marking review sessions.' },
      ],
      outcomes: [
        'Integrate E2, P2 and F2 knowledge within a management-level business context.',
        'Evaluate complex management accounting issues and recommend solutions.',
        'Prepare clear, professional reports and briefings for senior management audiences.',
        'Apply change management and project management concepts to case scenario situations.',
        'Manage exam time effectively and produce high-quality responses across all tasks.',
      ],
    },
  ],
  whyPoints: [
    { icon: '📊', title: 'Advanced Financial Skills', desc: 'P2 and F2 take your accounting expertise to a senior management level.' },
    { icon: '🌍', title: 'International Standards', desc: 'Deep IFRS knowledge that\'s valued in finance teams across the globe.' },
    { icon: '🏆', title: 'Nanaska Case Study Specialism', desc: 'Channa Gunawardana has coached the majority of Sri Lanka\'s MCS prize winners.' },
    { icon: '💼', title: 'Leadership Ready', desc: 'E2 prepares you to lead people, projects and organisational change.' },
    { icon: '🔍', title: 'Real-World Application', desc: 'Industry-expert lecturers bring practical case studies into every session.' },
    { icon: '✅', title: 'Advanced Diploma Award', desc: 'Completing this level earns CIMA\'s Advanced Diploma in Management Accounting.' },
  ],
};

export default function ManagementLevelPage() {
  return <CourseLevelPage level={MANAGEMENT_LEVEL} />;
}
