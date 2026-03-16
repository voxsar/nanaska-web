import CourseLevelPage from '../components/CourseLevelPage';

const STRATEGIC_LEVEL = {
  title: 'CIMA Strategic Level',
  currentPath: '/cima-strategic-level',
  badge: '📕',
  tagline: 'The pinnacle of the CIMA qualification — mastering enterprise strategy, risk and financial leadership at the highest level.',
  duration: '12–24 months',
  qualification: 'CIMA Strategic Diploma / CGMA Designation',
  color: '#dc2626',
  gradient: 'linear-gradient(135deg, #3b0000 0%, #7f1d1d 50%, #dc2626 100%)',
  subjects: [
    {
      code: 'E3',
      name: 'Strategic Management',
      icon: '🗺️',
      subtitle: 'Formulating and implementing competitive business strategy',
      description:
        'E3 covers the formulation, evaluation and implementation of strategy at the enterprise level. Students analyse the competitive environment, develop strategic options, manage strategic risk and lead organisational change to deliver the strategy.',
      highlights: [
        'Strategic analysis — PESTLE, Porter\'s Five Forces, SWOT',
        'Corporate strategy — Ansoff matrix, BCG portfolio',
        'Competitive strategy — differentiation, cost leadership',
        'Innovation and disruptive strategy',
        'Strategic implementation and change management',
        'Corporate social responsibility and sustainability',
      ],
      syllabus: [
        { topic: 'Strategic Position Analysis', desc: 'External environment analysis (PESTLE), industry analysis (Porter\'s Five Forces) and internal capability assessment.' },
        { topic: 'Strategic Choices', desc: 'Growth strategies, diversification, mergers & acquisitions, alliances and corporate portfolio management.' },
        { topic: 'Competitive Advantage', desc: 'Porter\'s generic strategies, value chain analysis, resource-based view and dynamic capabilities.' },
        { topic: 'Innovation & Digital Strategy', desc: 'Disruptive innovation, digital business models and strategic responses to technological change.' },
        { topic: 'Strategy Implementation', desc: 'Change management, organisational alignment, culture, leadership and balanced scorecard.' },
      ],
      outcomes: [
        'Conduct comprehensive strategic analysis using key analytical frameworks.',
        'Evaluate strategic options and recommend the most appropriate strategy.',
        'Design strategies for competitive advantage in complex market environments.',
        'Lead strategic implementation including change, culture and performance alignment.',
        'Integrate sustainability and CSR considerations into strategic decision-making.',
      ],
    },
    {
      code: 'P3',
      name: 'Risk Management',
      icon: '🛡️',
      subtitle: 'Identifying, assessing and managing enterprise-level risk',
      description:
        'P3 equips students with the tools and frameworks to identify, assess, quantify and manage risks facing complex organisations. Topics include enterprise risk management, treasury management, financial risk instruments and cybersecurity.',
      highlights: [
        'Enterprise Risk Management (ERM) frameworks — COSO, ISO 31000',
        'Financial risk — interest rate, currency, credit and liquidity risk',
        'Treasury management and hedging strategies',
        'Derivatives — futures, options, swaps and FRAs',
        'Cybersecurity risk and governance',
        'Business continuity and resilience planning',
      ],
      syllabus: [
        { topic: 'Enterprise Risk Management', desc: 'Risk identification, assessment, appetite, tolerance and ERM frameworks (COSO, ISO 31000).' },
        { topic: 'Financial Risks & Treasury', desc: 'Interest rate risk, foreign currency risk, credit risk, liquidity risk and treasury policy.' },
        { topic: 'Hedging Instruments', desc: 'Forward contracts, futures, options, swaps and interest rate instruments — calculation and strategy.' },
        { topic: 'Cybersecurity & Technology Risk', desc: 'IT governance, cybersecurity frameworks (CISA knowledge), data protection and incident response.' },
        { topic: 'Business Continuity', desc: 'BCP planning, disaster recovery, resilience strategies and crisis management.' },
      ],
      outcomes: [
        'Apply ERM frameworks to identify and prioritise enterprise risks.',
        'Calculate and evaluate strategies for managing financial risks including FX and interest rate risk.',
        'Select and price appropriate derivative instruments for hedging purposes.',
        'Assess cybersecurity risks and recommend governance controls.',
        'Develop and evaluate business continuity and resilience plans.',
      ],
    },
    {
      code: 'F3',
      name: 'Financial Strategy',
      icon: '💎',
      subtitle: 'Corporate finance, valuation and strategic financial decision-making',
      description:
        'F3 covers the advanced corporate finance topics required for financial leadership. Students evaluate financing, dividend and investment decisions; value businesses; and advise on mergers, acquisitions and complex financial strategy questions.',
      highlights: [
        'Capital structure theory — Modigliani-Miller, WACC',
        'Business valuation methods — DCF, multiples, EVA',
        'Dividend policy and payout decisions',
        'Mergers & acquisitions — valuation and financing',
        'Initial Public Offerings (IPOs) and capital markets',
        'International financial management',
      ],
      syllabus: [
        { topic: 'Corporate Financing Decisions', desc: 'Sources of finance, capital structure theories, gearing and the cost of capital (WACC).' },
        { topic: 'Business Valuation', desc: 'Asset-based, income-based (DCF) and market-based valuation methods and their application.' },
        { topic: 'Mergers & Acquisitions', desc: 'M&A rationale, valuation of targets, financing structures, due diligence and integration.' },
        { topic: 'Dividend Policy', desc: 'Dividend theories, payout ratios, scrip dividends, buybacks and signalling.' },
        { topic: 'International Financial Management', desc: 'Cross-border financing, transfer pricing, political risk and international capital markets.' },
      ],
      outcomes: [
        'Evaluate corporate financing decisions and optimise the capital structure.',
        'Value businesses using multiple approaches and advise on M&A transactions.',
        'Formulate dividend policy recommendations for diverse stakeholder groups.',
        'Advise on the financial strategy for complex international businesses.',
        'Apply advanced corporate finance theory to strategic financial decisions.',
      ],
    },
    {
      code: 'SCS',
      name: 'Strategic Case Study',
      icon: '🌐',
      subtitle: 'The final integrated assessment — combining E3, P3 and F3',
      description:
        'The Strategic Case Study (SCS) is CIMA\'s most demanding integrated exam, testing mastery of E3, P3 and F3 within a complex, board-level business scenario. Success in the SCS, combined with the CIMA experience requirement, awards the CGMA designation.',
      highlights: [
        'Integration of E3, P3 and F3 at board level',
        'Complex pre-seen with full organisation simulation',
        'Board-level strategic recommendations and reports',
        'Financial strategy and risk management application',
        'Corporate governance and ethical decision-making',
        'Nanaska has produced the majority of Sri Lanka\'s SCS prize winners',
      ],
      syllabus: [
        { topic: 'Strategic Position Mastery', desc: 'In-depth analysis of the pre-seen: industry, competitive position, financial health and strategy.' },
        { topic: 'Financial Strategy Application', desc: 'Using F3 knowledge — valuations, M&A analysis, financing decisions — in the board scenario.' },
        { topic: 'Risk Management Application', desc: 'P3 frameworks applied to identify, evaluate and manage strategic and financial risks in context.' },
        { topic: 'Strategic Leadership', desc: 'E3 tools — strategic analysis, competitive positioning, CSR and sustainability in the SCS scenario.' },
        { topic: 'SCS Exam Technique', desc: 'Full mock SCS exams, marking review with Channa Gunawardana and response structuring workshops.' },
      ],
      outcomes: [
        'Produce board-level strategic reports integrating E3, P3 and F3 knowledge.',
        'Evaluate complex strategic situations and recommend financially sound decisions.',
        'Manage enterprise risk and financial strategy at the highest organisational level.',
        'Apply governance and ethical principles within complex real-world scenarios.',
        'Achieve the CGMA designation upon passing the SCS and fulfilling the experience requirement.',
      ],
    },
  ],
  whyPoints: [
    { icon: '🏆', title: 'CGMA Awaits', desc: 'Completing the Strategic Level and experience requirements awards the globally respected CGMA designation.' },
    { icon: '🌟', title: 'Sri Lanka\'s #1 for SCS', desc: 'Nanaska\'s Channa Gunawardana is the leading SCS specialist — producing the majority of Sri Lanka\'s prize winners.' },
    { icon: '🛡️', title: 'Enterprise Risk Expertise', desc: 'P3 with Indika Rajakaruna (Sri Lanka\'s only CISA Accredited Trainer) gives you unique cyber risk knowledge.' },
    { icon: '💎', title: 'Corporate Finance Mastery', desc: 'F3 with Ruchira Perera — a CPA, FCMA and CFO — gives you real-world financial strategy insights.' },
    { icon: '🗺️', title: 'Strategic Leadership', desc: 'E3 with Aloka Seneviratne builds the strategic thinking that defines senior finance leaders.' },
    { icon: '🎯', title: 'Proven Track Record', desc: 'Global and joint prize winners across SCS, MCS and OCS — Nanaska delivers results.' },
  ],
};

export default function StrategicLevelPage() {
  return <CourseLevelPage level={STRATEGIC_LEVEL} />;
}
