/**
 * Official AIESEC Global Volunteer Project Portfolio & Professional Opportunity Catalogs
 * Sources:
 * - AIESEC Global Volunteer Hub (Project Portfolio linked to UN SDGs & Activities)
 * - AIESEC Exchange Program Policies (AEPP 4.2.1.4, APIP 5.2.3.1)
 * - Moroccan Statutory Floor: 3,500 MAD/month
 */

export interface SdgIndicator {
  sdgNumber: number;
  sdgName: string;
  colorHex: string;
}

export const SDG_CATALOG: Record<number, SdgIndicator> = {
  1: { sdgNumber: 1, sdgName: 'No Poverty', colorHex: '#E5243B' },
  2: { sdgNumber: 2, sdgName: 'Zero Hunger', colorHex: '#DDA63A' },
  3: { sdgNumber: 3, sdgName: 'Good Health and Well-being', colorHex: '#4C9F38' },
  4: { sdgNumber: 4, sdgName: 'Quality Education', colorHex: '#C5192D' },
  5: { sdgNumber: 5, sdgName: 'Gender Equality', colorHex: '#FF3A21' },
  6: { sdgNumber: 6, sdgName: 'Clean Water and Sanitation', colorHex: '#26BDE2' },
  7: { sdgNumber: 7, sdgName: 'Affordable and Clean Energy', colorHex: '#FCC30B' },
  8: { sdgNumber: 8, sdgName: 'Decent Work and Economic Growth', colorHex: '#A21942' },
  9: { sdgNumber: 9, sdgName: 'Industry, Innovation and Infrastructure', colorHex: '#FD6925' },
  10: { sdgNumber: 10, sdgName: 'Reduced Inequalities', colorHex: '#DD1367' },
  11: { sdgNumber: 11, sdgName: 'Sustainable Cities and Communities', colorHex: '#FD9D24' },
  12: { sdgNumber: 12, sdgName: 'Responsible Consumption and Production', colorHex: '#BF8B2E' },
  13: { sdgNumber: 13, sdgName: 'Climate Action', colorHex: '#3F7E44' },
  14: { sdgNumber: 14, sdgName: 'Life Below Water', colorHex: '#0A97D9' },
  15: { sdgNumber: 15, sdgName: 'Life on Land', colorHex: '#56C02B' },
  16: { sdgNumber: 16, sdgName: 'Peace, Justice and Strong Institutions', colorHex: '#00689D' },
  17: { sdgNumber: 17, sdgName: 'Partnerships for the Goals', colorHex: '#19486A' },
};

export interface OfficialGvProject {
  id: string;
  name: string;
  primarySdg: number;
  secondarySdgs: number[];
  targetBeneficiaries: string;
  typicalActivities: string[];
  expectedOutputs: string;
  description: string;
}

/**
 * 16 Official Global Volunteer Projects defined by AIESEC Global Portfolio
 */
export const OFFICIAL_GV_PROJECTS: OfficialGvProject[] = [
  {
    id: 'proj_heartbeat',
    name: 'Heartbeat',
    primarySdg: 3,
    secondarySdgs: [10, 17],
    targetBeneficiaries: 'Underprivileged patients, community clinics, rural youth',
    typicalActivities: [
      'Hygiene & preventive health workshops',
      'Blood donation & mobile screening campaigns',
      'Mental wellbeing awareness sessions',
      'Clinical assistance in community dispensaries',
    ],
    expectedOutputs: 'Minimum 150 community members reached with health screenings; 4 preventative workshops delivered.',
    description: 'Promotes health education, disease prevention, and community wellbeing in underserved areas.',
  },
  {
    id: 'proj_fingerprint',
    name: 'Fingerprint',
    primarySdg: 10,
    secondarySdgs: [4, 16],
    targetBeneficiaries: 'Special needs youth, orphanages, neurodivergent children',
    typicalActivities: [
      'Art & expressive therapy workshops',
      'Social inclusion & anti-stigma days',
      'Sensory learning and motor skill development',
      'Inclusive community sports activities',
    ],
    expectedOutputs: '30 youth engaged in weekly developmental sessions; 1 community inclusion showcase.',
    description: 'Empowers children and youth with special physical or cognitive needs to foster societal inclusion.',
  },
  {
    id: 'proj_global_classroom',
    name: 'Global Classroom',
    primarySdg: 4,
    secondarySdgs: [1, 8],
    targetBeneficiaries: 'Public school students aged 8-16 in priority education zones',
    typicalActivities: [
      'Interactive English & French communication clubs',
      'Digital literacy and introductory coding basics',
      'Cross-cultural awareness and geography labs',
      'Creative arts and critical thinking modules',
    ],
    expectedOutputs: '100+ students completing 24 hours of interactive language and digital modules.',
    description: 'Expands quality education and cross-cultural understanding in Moroccan public schools and local associations.',
  },
  {
    id: 'proj_green_leaders',
    name: 'Green Leaders',
    primarySdg: 13,
    secondarySdgs: [7, 12],
    targetBeneficiaries: 'Local youth associations, schools, coastal & urban municipalities',
    typicalActivities: [
      'Climate change mitigation & renewable energy workshops',
      'Zero-waste and circular economy initiatives',
      'Tree planting & urban reforestation days',
      'Plastic-free school audit campaigns',
    ],
    expectedOutputs: '500+ trees planted or 2 tons of plastic diverted; 4 eco-clubs launched.',
    description: 'Equips young people with environmental awareness, climate activism tools, and sustainable habits.',
  },
  {
    id: 'proj_youth_4_impact',
    name: 'Youth 4 Impact',
    primarySdg: 8,
    secondarySdgs: [4, 9],
    targetBeneficiaries: 'University graduates, vocational trainees, NEET youth',
    typicalActivities: [
      'CV crafting, LinkedIn branding & mock interviews',
      'Freelancing and digital marketing bootcamps',
      'Soft skills: leadership, public speaking, negotiation',
      'Career mentorship circles with local entrepreneurs',
    ],
    expectedOutputs: '60 young jobseekers certified in employability modules; 1 regional career hackathon.',
    description: 'Enhances youth employability and bridge skills gaps for young people entering the Moroccan labor market.',
  },
  {
    id: 'proj_raise_your_voice',
    name: 'Raise Your Voice',
    primarySdg: 5,
    secondarySdgs: [10, 16],
    targetBeneficiaries: 'Young girls and women in peri-urban cooperatives and centers',
    typicalActivities: [
      'Women leadership & self-advocacy labs',
      'Gender-based violence prevention awareness',
      'Financial literacy and artisanal e-commerce coaching',
      'STEM empowerment workshops for adolescent girls',
    ],
    expectedOutputs: '45 women trained in digital commerce or leadership; 2 community gender dialogues held.',
    description: 'Advances gender equality, female leadership, and economic agency in marginalized communities.',
  },
  {
    id: 'proj_explorer',
    name: 'Explorer',
    primarySdg: 11,
    secondarySdgs: [8, 12],
    targetBeneficiaries: 'Cultural heritage sites, medina artisans, eco-tourism cooperatives',
    typicalActivities: [
      'Digital documentation of historical artisan crafts',
      'Eco-tourism trail mapping and multilingual signage',
      'Heritage preservation workshops with youth',
      'Promotional content creation for local heritage cooperatives',
    ],
    expectedOutputs: '10 local artisan portfolios published online; 1 guided eco-heritage walking trail mapped.',
    description: 'Preserves cultural heritage and promotes sustainable tourism in Moroccan historic medinas and regions.',
  },
  {
    id: 'proj_happy_bus',
    name: 'Happy Bus',
    primarySdg: 4,
    secondarySdgs: [3, 10],
    targetBeneficiaries: 'Children in hospitals, cancer recovery wards, and shelters',
    typicalActivities: [
      'Puppet shows, music therapy, and clowning',
      'Bedside reading and interactive storytelling',
      'Art expression and mural painting in pediatric wards',
      'Donation drives for pediatric recreational libraries',
    ],
    expectedOutputs: '80+ hospitalized children visited across 6 weekly creative intervention days.',
    description: 'Brings emotional relief, laughter, and educational activities to children in long-term hospital care.',
  },
  {
    id: 'proj_skill_up',
    name: 'Skill Up!',
    primarySdg: 8,
    secondarySdgs: [4, 9],
    targetBeneficiaries: 'High school students, teenage apprentices',
    typicalActivities: [
      'Design thinking & problem-solving bootcamps',
      'Basic coding, web design, and digital literacy',
      'Personal finance & budget management games',
      'Mini-enterprise ideation sprints',
    ],
    expectedOutputs: '75 high schoolers completing 5 design sprints and producing a community prototype.',
    description: 'Fosters entrepreneurial mindsets, innovation, and digital competencies in high school youth.',
  },
  {
    id: 'proj_on_the_map',
    name: 'On The Map',
    primarySdg: 8,
    secondarySdgs: [11, 12],
    targetBeneficiaries: 'Small-scale rural guesthouses, cultural craftswomen, rural guides',
    typicalActivities: [
      'Google Maps & online travel agency verification',
      'Social media photography & storytelling for rural co-ops',
      'Hospitality and customer care best-practice sessions',
      'Sustainable tourism guide brochures in multiple languages',
    ],
    expectedOutputs: '12 rural micro-businesses onboarded to digital maps and international booking channels.',
    description: 'Puts local Moroccan rural and cultural initiatives on the global map through digital visibility.',
  },
  {
    id: 'proj_equify',
    name: 'Equify',
    primarySdg: 10,
    secondarySdgs: [5, 16],
    targetBeneficiaries: 'Sub-Saharan migrant youth, refugees, marginalized diaspora families',
    typicalActivities: [
      'Language exchange (Darija, French, English)',
      'Intercultural community meals and storytelling circles',
      'Administrative & legal clinic orientation support',
      'Youth empowerment workshops and talent shows',
    ],
    expectedOutputs: '50 migrant and refugee youth participating in social integration programs.',
    description: 'Builds empathy, human dignity, and social cohesion between host communities and migrant populations.',
  },
  {
    id: 'proj_eco_city',
    name: 'Eco City',
    primarySdg: 11,
    secondarySdgs: [12, 13],
    targetBeneficiaries: 'Urban neighborhoods, municipal community centers, apartment associations',
    typicalActivities: [
      'Rooftop and community urban gardening',
      'Neighborhood composting and selective sorting setups',
      'Public transport & cycling advocacy rides',
      'Public park cleanups and green space revitalization',
    ],
    expectedOutputs: '3 community composters installed; 2 public garden plots rehabilitated.',
    description: 'Transforms urban spaces into cleaner, greener, and more resilient neighborhood habitats.',
  },
  {
    id: 'proj_aquatica',
    name: 'Aquatica',
    primarySdg: 14,
    secondarySdgs: [12, 13],
    targetBeneficiaries: 'Coastal communities, marine parks, fishing villages, surfers/divers',
    typicalActivities: [
      'Beach cleanups & marine debris categorization',
      'Ocean plastic recycling & art installation workshops',
      'School visits on marine biodiversity and overfishing',
      'Collaboration with port authorities on oil/waste disposal',
    ],
    expectedOutputs: '1,500 kg of coastal trash collected and cataloged; 200 children educated on marine life.',
    description: 'Protects Moroccan coastal waters and marine ecosystems through civic action and cleanups.',
  },
  {
    id: 'proj_rooted',
    name: 'Rooted',
    primarySdg: 15,
    secondarySdgs: [13, 12],
    targetBeneficiaries: 'Arid zone farming cooperatives, Atlas mountain villages',
    typicalActivities: [
      'Drip irrigation & water conservation workshops',
      'Endemic plant preservation (Argan, Atlas cedar, Olive)',
      'Combating soil erosion and desertification barriers',
      'Permaculture design and sustainable composting',
    ],
    expectedOutputs: '1,000 endemic saplings planted; 2 erosion mitigation demonstration sites built.',
    description: 'Combats desertification, restores local terrestrial biodiversity, and protects Moroccan native flora.',
  },
  {
    id: 'proj_myself_my_world',
    name: 'Myself My World',
    primarySdg: 4,
    secondarySdgs: [10, 16],
    targetBeneficiaries: 'Primary school children (ages 6-12)',
    typicalActivities: [
      'World culture festivals and culinary discovery',
      'Universal children rights and peace education',
      'Anti-bullying and emotional expression exercises',
      'Global citizenship games and pen-pal programs',
    ],
    expectedOutputs: '120 children certified as Young Global Citizens across 6 weekly cultural modules.',
    description: 'Introduces young children to world cultures, human rights, and peaceful collaboration.',
  },
  {
    id: 'proj_scale_up',
    name: 'Scale Up!',
    primarySdg: 8,
    secondarySdgs: [9, 12],
    targetBeneficiaries: 'Early-stage social enterprises, non-profit organizations, community incubators',
    typicalActivities: [
      'Grant proposal drafting and crowdfunding setup',
      'Digital presence, brand identity & website creation',
      'Impact measurement frameworks and donor reporting',
      'Process automation and Google Workspace setup',
    ],
    expectedOutputs: '8 local social initiatives receiving operational diagnostic and fundraising materials.',
    description: 'Accelerates the operational and technological capacity of Moroccan NGOs and grassroots changemakers.',
  },
];

/**
 * iGTa: 6 Official Functional Fields per AIESEC Global Portfolio
 */
export const IGTA_FUNCTIONAL_FIELDS = [
  { id: 'BUSINESS_ADMINISTRATION', label: 'Business Administration & Operations' },
  { id: 'BUSINESS_DEVELOPMENT', label: 'Business Development & International Sales' },
  { id: 'MARKETING', label: 'Digital Marketing & Content Strategy' },
  { id: 'FINANCE', label: 'Corporate Finance, Accounting & Audit' },
  { id: 'INFORMATION_TECHNOLOGY', label: 'Software Engineering, DevOps & Data' },
  { id: 'ENGINEERING', label: 'Industrial, Mechanical & Electrical Engineering' },
] as const;

/**
 * iGTe: Official Academic Subjects & Teaching Levels
 */
export const IGTE_SUBJECTS = [
  { id: 'ENGLISH_LANGUAGE', label: 'English Language & Literature' },
  { id: 'FRENCH_LANGUAGE', label: 'French Language & Humanities' },
  { id: 'SPANISH_LANGUAGE', label: 'Spanish Language' },
  { id: 'GERMAN_LANGUAGE', label: 'German Language' },
  { id: 'STEM_EDUCATION', label: 'STEM & Robotics Education' },
  { id: 'MATHEMATICS', label: 'Advanced Mathematics' },
  { id: 'SCIENCE', label: 'Physics, Chemistry & Biology' },
  { id: 'EARLY_CHILDHOOD', label: 'Early Childhood Development' },
] as const;

export const IGTE_TEACHING_LEVELS = [
  { id: 'KINDERGARTEN', label: 'Kindergarten & Pre-School (Ages 3-5)' },
  { id: 'PRIMARY', label: 'Primary School (Ages 6-11)' },
  { id: 'MIDDLE_SCHOOL', label: 'Middle School (Ages 12-14)' },
  { id: 'HIGH_SCHOOL', label: 'High School (Ages 15-18)' },
  { id: 'VOCATIONAL_ADULT', label: 'Language Institute / Adult Learning' },
  { id: 'UNIVERSITY', label: 'Higher Education / University' },
] as const;

export interface OpportunitySlotWave {
  id: string;
  opportunityId: string;
  waveLabel: string;
  startDate: string;
  endDate: string;
  capacity: number;
  appliedCount: number;
  acceptedCount: number;
  approvedCount: number;
  realizedCount: number;
  completedCount: number;
}

export interface B2BContract {
  id: string;
  orgId: string;
  dealId?: string;
  contractNumber: string;
  signedDate: string;
  expiryDate: string;
  contractDocumentUrl?: string;
  termsSummary: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  signatoryPartner: string;
  signatoryAiesec: string;
}

export const INITIAL_B2B_CONTRACTS: B2BContract[] = [
  {
    id: 'ct_001',
    orgId: 'org_rabat_001',
    dealId: 'deal_001',
    contractNumber: 'MOU-2026-RAB-042',
    signedDate: '2026-09-15',
    expiryDate: '2027-09-14',
    contractDocumentUrl: 'https://docs.aiesec.org.ma/contracts/MOU-2026-RAB-042.pdf',
    termsSummary: 'Hosts 5 iGV volunteers for Youth Digital Literacy project with full accommodation provided.',
    status: 'ACTIVE',
    signatoryPartner: 'Karim Bennani (Director)',
    signatoryAiesec: 'Wadii Hani (LCP Rabat)',
  },
  {
    id: 'ct_002',
    orgId: 'org_rabat_002',
    dealId: 'deal_002',
    contractNumber: 'MOU-2026-RAB-089',
    signedDate: '2026-09-22',
    expiryDate: '2027-06-30',
    contractDocumentUrl: 'https://docs.aiesec.org.ma/contracts/MOU-2026-RAB-089.pdf',
    termsSummary: '3 STEM Teaching Assistants, 5,500 MAD/month salary per intern, educational visa sponsorship.',
    status: 'ACTIVE',
    signatoryPartner: 'Sarah Jenkins (Head of School)',
    signatoryAiesec: 'Wadii Hani (LCP Rabat)',
  },
  {
    id: 'ct_003',
    orgId: 'org_rabat_003',
    dealId: 'deal_003',
    contractNumber: 'MOU-2026-RAB-114',
    signedDate: '2026-10-12',
    expiryDate: '2027-10-11',
    contractDocumentUrl: 'https://docs.aiesec.org.ma/contracts/MOU-2026-RAB-114.pdf',
    termsSummary: '2 Fullstack engineers, 6,000 MAD/month, partly remote (4 weeks remote, 22 weeks onsite).',
    status: 'ACTIVE',
    signatoryPartner: 'Mehdi Alami (CTO)',
    signatoryAiesec: 'Wadii Hani (LCP Rabat)',
  },
];
