import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const adminUsers = [
  {
    email: 'miyuru@theredsun.org',
    name: 'Miyuru',
    role: 'superadmin' as const,
    password: 'password',
  },
  {
    email: 'info@nanaska.com',
    name: 'Nanaska Admin',
    role: 'admin' as const,
    password: 'password',
  },
];

const lecturers = [
  {
    name: 'Channa Gunawardana',
    title: 'Lead Lecturer & CEO',
    credentials: ['CIMA Fellow', 'CA Sri Lanka', 'MBA Finance', 'PhD (Candidate)'],
    bio: "Channa Gunawardana, CEO of a public listed company in Sri Lanka, is a fellow member of CIMA UK and CA Sri Lanka. He holds a Bachelor's degree in Accountancy and Financial Management from the University of Sri Jayewardenepura and an MBA in Finance from the University of Southern Queensland, Australia. He is currently pursuing a PhD at Management and Science University, Malaysia.",
    bio2: 'With 21 years of lecturing experience, he is renowned as the CIMA case study specialist, having produced over 95% of CIMA Sri Lanka prize winners, including global prize winners over the last decade. He is also a member of the CIMA Global Council.',
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2021/04/Channa.png',
    stats: [
      { number: '21+', label: 'Years Lecturing' },
      { number: '95%', label: 'Prize Winners' },
      { number: '10+', label: 'Global Winners' },
    ],
    specialties: ['CIMA Case Study', 'Strategic Level', 'Management Level', 'Operational Level'],
    sortOrder: 1,
  },
  {
    name: 'Aloka Seneviratne',
    title: 'Lecturer – E3 Strategic Management',
    credentials: ['CIMA Passed Finalist', 'DipM', 'BSc Hons Engineering Physics'],
    bio: 'Praveen Aloka Seneviratne brings a wealth of knowledge and experience, holding a BSc Hons in Engineering Physics along with credentials as a CIMA Passed Finalist and DipM. His diverse academic background and professional expertise make him a valuable asset to the Nanaska faculty.',
    bio2: "Aloka's dedication to education and his ability to convey complex concepts with clarity will undoubtedly inspire and empower students. He is the E3 lecturer at Nanaska.",
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2024/07/DSC_0454-Copy-1.png',
    stats: [
      { number: 'E3', label: 'Specialist' },
      { number: 'CIMA', label: 'Passed Finalist' },
      { number: 'BSc', label: 'Engineering Physics' },
    ],
    specialties: ['E3 Strategic Management', 'Business Strategy', 'Leadership'],
    sortOrder: 2,
  },
  {
    name: 'Indika Rajakaruna',
    title: 'Lecturer – P3 Risk Management',
    credentials: ['CISA – ISCA (USA)', 'AIB (IBSL)', 'PG Ex.Dip Bank Mgt', 'Executive MSc Marketing'],
    bio: 'Indika Rajakaruna is a banker by profession in the Governance, Risk and Control field who counts over 25 years of exposure in the banking industry. He currently leads a team of audit professionals in a listed bank awarded both titles of Best Bank and Best Digital Bank in Sri Lanka.',
    bio2: 'He is the First and Only Accredited Trainer in Sri Lanka for the CISA (Certified Information Systems Auditor) by ISACA–USA, and serves as Director for Corporate Relations of ISACA–Sri Lanka Chapter. He covers Cyber Risk within P3 at Nanaska.',
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2021/04/Indika.png',
    stats: [
      { number: '25+', label: 'Years in Banking' },
      { number: '#1', label: 'CISA Trainer SL' },
      { number: 'P3', label: 'Risk Specialist' },
    ],
    specialties: ['P3 Risk Management', 'Cybersecurity', 'IS Auditing', 'Enterprise Risk'],
    sortOrder: 3,
  },
  {
    name: 'Ruchira Perera',
    title: 'Lecturer – F3 Financial Strategy',
    credentials: ['BSc Accountancy (USJ)', 'First Class MBA (PIM)', 'ACMA', 'CPA', 'FCMA (SL)'],
    bio: 'Mr. Ruchira Perera is a graduate of the University of Sri Jayewardenepura with a first class in Accountancy and Financial Management. He holds an MBA from the Postgraduate Institute of Management and is professionally qualified with CPA (Australia), CIMA (UK) and CMA (SL).',
    bio2: 'He has nearly two decades of industry experience in senior roles including CFO and Financial Controller. He is a Governing Council Member of CMA Sri Lanka and a Technical Advisor to SAFA, and is pursuing his Doctorate at Lincoln University College, Malaysia.',
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2022/05/ruchi-1.png',
    stats: [
      { number: '18+', label: 'Years in Finance' },
      { number: 'CFO', label: 'Multinational Exp.' },
      { number: 'F3', label: 'Specialist' },
    ],
    specialties: ['F3 Financial Strategy', 'Corporate Finance', 'M&A', 'Capital Markets'],
    sortOrder: 4,
  },
  {
    name: 'Shervin Perera',
    title: 'Lecturer – F2 & BA3',
    credentials: ['ACMA (UK)', 'CGMA', 'MBA (UOS)'],
    bio: 'Shervin Perera holds impressive credentials including ACMA (UK), CGMA, and an MBA from the University of Southampton. His extensive expertise in management accounting and business analysis is invaluable as he teaches the F2 and BA3 subjects.',
    bio2: "Mr. Perera's commitment to academic excellence and practical insights will greatly benefit students, equipping them with the knowledge and skills needed to excel in their professional careers.",
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2024/06/Shervin_Perera-removebg-preview.png',
    stats: [
      { number: 'F2', label: 'Specialist' },
      { number: 'MBA', label: 'Univ. Southampton' },
      { number: 'ACMA', label: 'UK Qualified' },
    ],
    specialties: ['F2 Advanced Financial Reporting', 'BA3', 'Management Accounting'],
    sortOrder: 5,
  },
  {
    name: 'Mark Gunathilake',
    title: 'Lecturer – P2, OCS & BA2',
    credentials: ['BSc Hons (USJ)', 'ACMA', 'CGMA', 'SCS Prize Winner'],
    bio: "Mark Gunathilake is a Passed Finalist of the Chartered Institute of Management Accountants. He also holds a 1st Class Bachelor's Degree in Accountancy from the University of Sri Jayewardenepura.",
    bio2: 'Having started off his career at one of the big 4 audit firms, he brings over 3 years of experience across Manufacturing, Transportation and Retail. As a former CIMA SCS Prize Winner, he gives students a unique practical edge in their preparation.',
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2025/01/Untitled-design-11.png',
    stats: [
      { number: '🥇', label: 'SCS Prize Winner' },
      { number: 'P2', label: 'OCS & BA2' },
      { number: 'Big 4', label: 'Alumni' },
    ],
    specialties: ['P2 Management Accounting', 'OCS Case Study', 'BA2'],
    sortOrder: 6,
  },
  {
    name: 'Osmand Fernando',
    title: 'Lecturer',
    credentials: ['MBA (UK)', 'ACMA', 'CGMA'],
    bio: 'Osmand Fernando holds an MBA from the United Kingdom and ACMA/CGMA qualifications, bringing international perspective and professional finance expertise to Nanaska students.',
    bio2: 'His international academic background combined with professional qualifications equips him to deliver high-quality, globally-relevant CIMA tuition.',
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2024/07/IMG_6966-1copy.png',
    stats: [
      { number: 'MBA', label: 'UK Qualified' },
      { number: 'ACMA', label: 'CGMA' },
      { number: '🌐', label: 'International' },
    ],
    specialties: ['Management Accounting', 'Financial Strategy', 'Business Analysis'],
    sortOrder: 7,
  },
  {
    name: 'Lasantha Vidanagamage',
    title: 'Lecturer – P2 Advanced Management Accounting',
    credentials: ['CIMA Passed Finalist', 'MPAcc (USJ)', 'BPharm (USJ)'],
    bio: 'Lasantha Vidanagamage is a CIMA pass finalist and holds both a Master of Professional Accounting (MPAcc) and a Bachelor of Pharmacy (BPharm) from the University of Sri Jayewardenepura.',
    bio2: 'He teaches P2 – Advanced Management Accounting. His diverse academic background and extensive expertise in management accounting provide students with a comprehensive and practical learning experience.',
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2024/07/441312389_467371879000666_851286037044610417_n-copy-1.png',
    stats: [
      { number: 'P2', label: 'Specialist' },
      { number: 'MPAcc', label: 'USJ Graduate' },
      { number: 'CIMA', label: 'Passed Finalist' },
    ],
    specialties: ['P2 Advanced Management Accounting'],
    sortOrder: 8,
  },
  {
    name: 'Sanuda Minuraka',
    title: 'Lecturer – BA1',
    credentials: ['BSc Hons 1st Class (Plymouth UK)', 'CIMA Passed Finalist'],
    bio: 'Sanuda Minuraka holds a First-Class Honors degree in Accounting & Finance from Plymouth University, UK, reflecting his academic excellence and in-depth knowledge of the field.',
    bio2: 'As a CIMA Passed Finalist, Sanuda combines his strong theoretical foundation with practical insights into management accounting, making his teaching highly engaging and relevant to real-world applications.',
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2025/01/Untitled-design-12.png',
    stats: [
      { number: '1st', label: 'Class Hons (UK)' },
      { number: 'BA1', label: 'Specialist' },
      { number: 'CIMA', label: 'Passed Finalist' },
    ],
    specialties: ['BA1 Business Economics', 'Management Accounting'],
    sortOrder: 9,
  },
  {
    name: 'Janith Jayasinghe',
    title: 'Lecturer – Law & HRM',
    credentials: ['LB (Hons)', 'Affiliate CIPM', 'Attorney-at-Law', 'Notary Public', 'Company Secretary'],
    bio: 'Janith Jayasinghe is a multifaceted professional excelling in both the legal and human resources domains. Holding an LB (Hons) degree and a Professional Qualification in HRM from CIPM, he is an Attorney-at-Law, Notary Public, Commissioner for Oaths, and a Company Secretary.',
    bio2: 'As an Affiliate CIPM, Janith brings a unique blend of legal expertise and HR management proficiency, making him a well-rounded professional in his field.',
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2025/01/Untitled-design-15.png',
    stats: [
      { number: 'LLB', label: 'Honours' },
      { number: 'CIPM', label: 'Affiliate' },
      { number: '⚖️', label: 'Attorney-at-Law' },
    ],
    specialties: ['Business Law', 'Corporate Governance', 'HRM', 'Ethics'],
    sortOrder: 10,
  },
  {
    name: 'Ali Raheem',
    title: 'Lecturer – BA2',
    credentials: ['BSc (USJ)', 'CIMA Exams Complete'],
    bio: "Ali Raheem is a CIMA passed finalist, having completed the qualification within a span of 2 years. He is a product of St. Peter's College, Colombo and is currently an Undergraduate at the University of Sri Jayewardenepura.",
    bio2: 'Ali has been an assistant lecturer at Nanaska since 2019 and he is the BA2 lecturer at Nanaska.',
    imageUrl: 'https://www.nanaska.com/wp-content/uploads/2025/01/Untitled-design-13.png',
    stats: [
      { number: '2yrs', label: 'CIMA Completed' },
      { number: 'BA2', label: 'Specialist' },
      { number: '2019', label: 'At Nanaska' },
    ],
    specialties: ['BA2 Management Accounting', 'Business Economics'],
    sortOrder: 11,
  },
];

const defaultSettings = [
  { key: 'google_analytics_id', value: '', category: 'analytics', label: 'Google Analytics Measurement ID' },
  { key: 'meta_pixel_id', value: '', category: 'analytics', label: 'Meta Pixel ID' },
  { key: 'payment_gateway_client_id', value: '', category: 'payment', label: 'Payment Gateway Client ID' },
  { key: 'payment_gateway_secret', value: '', category: 'payment', label: 'Payment Gateway Secret' },
  { key: 'payment_success_url', value: '/payment-success', category: 'payment', label: 'Payment Success URL' },
  { key: 'payment_cancel_url', value: '/payment-cancel', category: 'payment', label: 'Payment Cancel URL' },
  { key: 'site_name', value: 'Nanaska', category: 'general', label: 'Site Name' },
  { key: 's3_bucket_url', value: '', category: 'storage', label: 'S3 Bucket URL' },
  { key: 'sse_endpoint', value: '', category: 'sse', label: 'SSE Events Endpoint' },
];

const subjects = [
  { id: 'BA1', name: 'Fundamentals of Business Economics',   price: 16000, level: 'certificate', slug: 'ba1-fundamentals-of-business-economics' },
  { id: 'BA2', name: 'Fundamentals of Management Accounting', price: 16000, level: 'certificate', slug: 'ba2-fundamentals-of-management-accounting' },
  { id: 'BA3', name: 'Fundamentals of Financial Accounting',  price: 16000, level: 'certificate', slug: 'ba3-fundamentals-of-financial-accounting' },
  { id: 'BA4', name: 'Fundamentals of Ethics & Governance',   price: 16000, level: 'certificate', slug: 'ba4-fundamentals-of-ethics-and-governance' },

  { id: 'E1',  name: 'Managing Finance in a Digital World', price: 29000, level: 'operational', slug: 'e1-managing-finance-in-a-digital-world' },
  { id: 'P1',  name: 'Management Accounting',               price: 29000, level: 'operational', slug: 'p1-management-accounting' },
  { id: 'F1',  name: 'Financial Reporting',                 price: 29000, level: 'operational', slug: 'f1-financial-reporting' },
  { id: 'E2',  name: 'Managing Performance',                price: 29000, level: 'operational', slug: 'e2-managing-performance' },

  { id: 'P2',  name: 'Advanced Management Accounting', price: 35000, level: 'management', slug: 'p2-advanced-management-accounting' },
  { id: 'F2',  name: 'Advanced Financial Reporting',   price: 35000, level: 'management', slug: 'f2-advanced-financial-reporting' },
  { id: 'MCS', name: 'Management Case Study',          price: 40000, level: 'management', slug: 'mcs-management-case-study' },

  { id: 'E3',  name: 'Strategic Management', price: 40000, level: 'strategic', slug: 'e3-strategic-management' },
  { id: 'P3',  name: 'Risk Management',      price: 40000, level: 'strategic', slug: 'p3-risk-management' },
  { id: 'F3',  name: 'Financial Strategy',   price: 40000, level: 'strategic', slug: 'f3-financial-strategy' },
  { id: 'SCS', name: 'Strategic Case Study', price: 40000, level: 'strategic', slug: 'scs-strategic-case-study' },
];

const combinations = [
  // Certificate – singles
  { id: 'cert_ba1', level: 'certificate', subjects: ['BA1'], price: 16000 },
  { id: 'cert_ba2', level: 'certificate', subjects: ['BA2'], price: 16000 },
  { id: 'cert_ba3', level: 'certificate', subjects: ['BA3'], price: 16000 },
  { id: 'cert_ba4', level: 'certificate', subjects: ['BA4'], price: 16000 },
  // Certificate – pairs
  { id: 'cert_ba1_ba2', level: 'certificate', subjects: ['BA1', 'BA2'], price: 32000 },
  { id: 'cert_ba1_ba3', level: 'certificate', subjects: ['BA1', 'BA3'], price: 32000 },
  { id: 'cert_ba1_ba4', level: 'certificate', subjects: ['BA1', 'BA4'], price: 32000 },
  { id: 'cert_ba2_ba3', level: 'certificate', subjects: ['BA2', 'BA3'], price: 32000 },
  { id: 'cert_ba2_ba4', level: 'certificate', subjects: ['BA2', 'BA4'], price: 32000 },
  { id: 'cert_ba3_ba4', level: 'certificate', subjects: ['BA3', 'BA4'], price: 32000 },
  // Certificate – full
  { id: 'cert_full', level: 'certificate', subjects: ['BA1', 'BA2', 'BA3', 'BA4'], price: 64000 },

  // Operational – singles
  { id: 'op_e1', level: 'operational', subjects: ['E1'], price: 29000 },
  { id: 'op_p1', level: 'operational', subjects: ['P1'], price: 29000 },
  { id: 'op_f1', level: 'operational', subjects: ['F1'], price: 29000 },
  { id: 'op_e2', level: 'operational', subjects: ['E2'], price: 29000 },
  // Operational – pairs
  { id: 'op_e1_p1', level: 'operational', subjects: ['E1', 'P1'], price: 58000 },
  { id: 'op_e1_f1', level: 'operational', subjects: ['E1', 'F1'], price: 58000 },
  { id: 'op_p1_f1', level: 'operational', subjects: ['P1', 'F1'], price: 58000 },
  // Operational – full
  { id: 'op_full', level: 'operational', subjects: ['E1', 'P1', 'F1', 'E2'], price: 116000 },

  // Management – singles
  { id: 'mg_p2',  level: 'management', subjects: ['P2'],         price: 35000 },
  { id: 'mg_f2',  level: 'management', subjects: ['F2'],         price: 35000 },
  { id: 'mg_mcs', level: 'management', subjects: ['MCS'],        price: 40000 },
  // Management – pairs / full
  { id: 'mg_p2_f2', level: 'management', subjects: ['P2', 'F2'],         price: 70000 },
  { id: 'mg_full',  level: 'management', subjects: ['P2', 'F2', 'MCS'],  price: 110000 },

  // Strategic – singles
  { id: 'st_e3',  level: 'strategic', subjects: ['E3'],  price: 40000 },
  { id: 'st_p3',  level: 'strategic', subjects: ['P3'],  price: 40000 },
  { id: 'st_f3',  level: 'strategic', subjects: ['F3'],  price: 40000 },
  { id: 'st_scs', level: 'strategic', subjects: ['SCS'], price: 40000 },
  // Strategic – pairs / full
  { id: 'st_e3_p3', level: 'strategic', subjects: ['E3', 'P3'],             price: 80000 },
  { id: 'st_full',  level: 'strategic', subjects: ['E3', 'P3', 'F3', 'SCS'], price: 160000 },
];

async function main() {
  console.log('Seeding admin users …');
  for (const admin of adminUsers) {
    const passwordHash = await bcrypt.hash(admin.password, SALT_ROUNDS);
    await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: { name: admin.name, role: admin.role },
      create: { email: admin.email, name: admin.name, role: admin.role, passwordHash },
    });
  }

  console.log('Seeding lecturers …');
  for (const l of lecturers) {
    const existing = await prisma.lecturer.findFirst({ where: { name: l.name } });
    if (existing) {
      await prisma.lecturer.update({
        where: { id: existing.id },
        data: { ...l, stats: l.stats as any },
      });
    } else {
      await prisma.lecturer.create({ data: { ...l, stats: l.stats as any } });
    }
  }

  console.log('Seeding site settings …');
  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { label: setting.label, category: setting.category },
      create: setting,
    });
  }

  console.log('Seeding courses …');
  for (const s of subjects) {
    await prisma.course.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  console.log('Seeding combinations …');
  for (const c of combinations) {
    await prisma.courseCombination.upsert({
      where: { id: c.id },
      update: { level: c.level, price: c.price },
      create: { id: c.id, level: c.level, price: c.price },
    });

    for (const courseId of c.subjects) {
      await prisma.courseCombinationItem.upsert({
        where: { combinationId_courseId: { combinationId: c.id, courseId } },
        update: {},
        create: { combinationId: c.id, courseId },
      });
    }
  }

  console.log('Seed complete ✓');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
