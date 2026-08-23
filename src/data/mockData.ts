import type { Game, Problem, Technology, Team } from '../types'

export const ALL_TECH_DICTIONARY: Record<string, { icon: string; category: Technology['category']; description: string }> = {
  'IoT': { icon: '📡', category: 'Connectivity', description: 'Network of interconnected physical devices collecting and exchanging real-time telemetry.' },
  'GPS': { icon: '📍', category: 'Mobility', description: 'High-precision global satellite positioning and location tracking coordinate system.' },
  'Smart Sensors': { icon: '📊', category: 'Connectivity', description: 'Micro-electronic transducers that detect physical input and convert to digital data.' },
  'Smart Camera': { icon: '📷', category: 'Intelligence', description: 'Optical visual capture units with on-device edge processing capabilities.' },
  'RFID': { icon: '🏷️', category: 'Connectivity', description: 'Radio-frequency identification tags for automated contactless tracking and inventory.' },
  'Wearable Devices': { icon: '⌚', category: 'Interface', description: 'Body-worn biometric sensors providing continuous physiological and behavioral feedback.' },
  'Motion Sensors': { icon: '🏃', category: 'Connectivity', description: 'Kinetic and infrared detectors sensing physical movement and velocity changes.' },
  'Environmental Sensors': { icon: '🌡️', category: 'Connectivity', description: 'Atmospheric telemetry for temperature, humidity, air quality, and environmental threats.' },
  'Computer Vision': { icon: '👁️', category: 'Intelligence', description: 'Algorithmic visual extraction, object recognition, and spatial scene comprehension.' },
  'Drone': { icon: '🚁', category: 'Mobility', description: 'Autonomous unmanned aerial vehicles providing rapid aerial reconnaissance and dispatch.' },
  'Drones': { icon: '🚁', category: 'Mobility', description: 'Autonomous unmanned aerial vehicles providing rapid aerial reconnaissance and dispatch.' },
  'Water-Level Sensors': { icon: '🌊', category: 'Connectivity', description: 'Submersible ultrasonic and hydrostatic pressure sensors measuring water volume in real time.' },
  'Satellite Communication': { icon: '🛰️', category: 'Connectivity', description: 'Orbital satellite uplink/downlink ensuring continuous telemetry in zero-infrastructure zones.' },
  'Biometric Authentication': { icon: '🔐', category: 'Security', description: 'Biological verification (fingerprint, facial, retina) for zero-trust identity confirmation.' },
  'Mobile App': { icon: '📱', category: 'Interface', description: 'Interactive native cross-platform mobile client for citizen and field-agent interfaces.' },
  'Digital Kiosk': { icon: '🖥️', category: 'Interface', description: 'Ruggedized public interactive terminal providing accessible offline and online services.' },
  'Soil Sensors': { icon: '🌱', category: 'Connectivity', description: 'Agricultural moisture, pH, salinity, and nitrogen probes measuring root-level soil health.' },
  'Weather Sensors': { icon: '⛅', category: 'Connectivity', description: 'Barometric, anemometric, and solar radiation gauges forecasting hyper-local weather shifts.' },
  'Bluetooth': { icon: '📶', category: 'Connectivity', description: 'Short-range low-energy wireless protocol for peer-to-peer ad-hoc device discovery.' },
  '5G': { icon: '⚡', category: 'Connectivity', description: 'Ultra-low-latency high-bandwidth cellular protocol for instantaneous edge data streams.' },
  'Crowdsourcing': { icon: '👥', category: 'Interface', description: 'Decentralized citizen telemetry gathering real-time distributed eyewitness reports.' },
  'AI': { icon: '🤖', category: 'Intelligence', description: 'Cognitive reasoning engine orchestrating autonomous decision-making and logic models.' },
  'Machine Learning': { icon: '🧠', category: 'Intelligence', description: 'Adaptive statistical algorithms that iteratively improve predictive accuracy from data.' },
  'Predictive Analytics': { icon: '📈', category: 'Intelligence', description: 'Forward-looking algorithmic forecasting detecting anomalies before failure thresholds.' },
  'NLP': { icon: '🗣️', category: 'Intelligence', description: 'Natural language processing for multilingual automated voice/text comprehension.' },
  'Generative AI': { icon: '✨', category: 'Intelligence', description: 'Foundation models synthesizing synthetic scenarios, automated reports, and solutions.' },
  'Data Analytics': { icon: '📊', category: 'Intelligence', description: 'High-throughput aggregation and correlation of multidimensional telemetry streams.' },
  'Recommendation System': { icon: '🎯', category: 'Intelligence', description: 'Context-aware decision engine suggesting optimal resource allocation and next best actions.' },
  'Big Data': { icon: '💾', category: 'Infrastructure', description: 'Distributed data lakes processing petabyte-scale unstructured event streams.' },
  'Digital Twin': { icon: '🌐', category: 'Intelligence', description: 'Real-time synchronized virtual replica mirroring the physical state and dynamics.' },
  'Mesh Network': { icon: '🕸️', category: 'Connectivity', description: 'Decentralized peer-to-peer ad-hoc topology routing packets without centralized towers.' },
  'LoRaWAN': { icon: '📻', category: 'Connectivity', description: 'Long-range low-power RF protocol transmitting sensor packets over 15km+ distances.' },
  'Edge Computing': { icon: '⚡', category: 'Infrastructure', description: 'Localized micro-datacenters processing telemetry on-premise without cloud roundtrips.' },
  'Robotics': { icon: '🦾', category: 'Mobility', description: 'Programmable electromechanical actuators executing physical tasks and automated intervention.' },
  'GIS / Digital Mapping': { icon: '🗺️', category: 'Interface', description: 'Geospatial information system mapping multi-layered spatial data and terrain layers.' },
  'Intelligent Transportation System': { icon: '🚦', category: 'Mobility', description: 'Coordinated traffic management system synchronizing signals, lanes, and transit flows.' },
  'Cloud Computing': { icon: '☁️', category: 'Infrastructure', description: 'Elastic distributed cloud infrastructure scaling compute, storage, and serverless APIs.' },
  'Smart City Technology': { icon: '🏙️', category: 'Infrastructure', description: 'Unified urban operating system integrating utilities, public safety, and infrastructure.' },
  'Remote Monitoring': { icon: '🖥️', category: 'Connectivity', description: 'Centralized telemetry dashboard streaming live diagnostics and telemetry alerts.' },
  'Blockchain': { icon: '⛓️', category: 'Security', description: 'Immutable decentralized ledger guaranteeing cryptographic auditability and data integrity.' },
  'Cybersecurity': { icon: '🛡️', category: 'Security', description: 'Zero-trust defense matrix shielding sensor endpoints from unauthorized breaches and spoofing.' },
  'Privacy-Preserving Technology': { icon: '🔒', category: 'Security', description: 'Differential privacy and zero-knowledge encryption shielding sensitive citizen information.' },
  'Digital Identity': { icon: '🆔', category: 'Security', description: 'Decentralized cryptographic credential system verifying legitimate actors and authorities.' },
  'Voice Assistant': { icon: '🎙️', category: 'Interface', description: 'Hands-free conversational voice AI interface for low-literacy and emergency operations.' },
  'Autonomous Vehicles': { icon: '🚗', category: 'Mobility', description: 'Self-navigating ground vehicles executing automated transport, dispatch, and collection.' },
  'IoT Automation': { icon: '⚙️', category: 'Connectivity', description: 'Rule-based event triggers automatically driving physical actuators based on sensor inputs.' },
  'Web Application': { icon: '💻', category: 'Interface', description: 'Responsive universal web portal accessible across any browser and lightweight device.' },
}

export const PROBLEM_CARD_STACKS: Record<string, { card1: string[]; card2: string[]; card3: string[] }> = {
  p1: {
    card1: ['IoT', 'GPS', 'Smart Sensors', 'Smart Camera', 'RFID', 'Wearable Devices', 'Motion Sensors', 'Environmental Sensors'],
    card2: ['AI', 'Machine Learning', 'Computer Vision', 'Predictive Analytics', 'NLP', 'Generative AI', 'Data Analytics', 'Recommendation System'],
    card3: ['Mesh Network', 'LoRaWAN', 'Satellite Communication', 'Edge Computing', 'Drones', 'Robotics', 'Mobile App', 'GIS / Digital Mapping'],
  },
  p2: {
    card1: ['Smart Camera', 'IoT', 'GPS', 'Smart Sensors', 'Computer Vision', 'RFID', 'Drone', 'Motion Sensors'],
    card2: ['AI', 'Machine Learning', 'Predictive Analytics', 'Computer Vision', 'Big Data', 'Data Analytics', 'Digital Twin', 'Generative AI'],
    card3: ['Mobile App', '5G', 'Edge Computing', 'GIS / Digital Mapping', 'Intelligent Transportation System', 'Cloud Computing', 'Smart City Technology', 'Digital Twin'],
  },
  p3: {
    card1: ['IoT', 'Smart Sensors', 'Water-Level Sensors', 'Environmental Sensors', 'GPS', 'Smart Camera', 'Drone', 'Satellite Communication'],
    card2: ['AI', 'Machine Learning', 'Predictive Analytics', 'Computer Vision', 'Data Analytics', 'Big Data', 'Digital Twin', 'Recommendation System'],
    card3: ['GIS / Digital Mapping', 'Cloud Computing', 'Edge Computing', 'LoRaWAN', 'Mobile App', 'Remote Monitoring', 'Blockchain', 'Satellite Communication'],
  },
  p4: {
    card1: ['IoT', 'Wearable Devices', 'RFID', 'Smart Sensors', 'Biometric Authentication', 'Smart Camera', 'Mobile App', 'Digital Kiosk'],
    card2: ['AI', 'Machine Learning', 'Predictive Analytics', 'Computer Vision', 'NLP', 'Recommendation System', 'Data Analytics', 'Generative AI'],
    card3: ['Cloud Computing', 'Edge Computing', 'Cybersecurity', 'Privacy-Preserving Technology', 'Digital Identity', 'Robotics', 'Voice Assistant', 'Remote Monitoring'],
  },
  p5: {
    card1: ['IoT', 'Smart Sensors', 'Smart Camera', 'Computer Vision', 'RFID', 'GPS', 'Drone', 'Environmental Sensors'],
    card2: ['AI', 'Machine Learning', 'Predictive Analytics', 'Computer Vision', 'Big Data', 'Data Analytics', 'Recommendation System', 'Digital Twin'],
    card3: ['Robotics', 'Autonomous Vehicles', 'GPS', 'GIS / Digital Mapping', 'Mobile App', 'Cloud Computing', 'Edge Computing', 'Smart City Technology'],
  },
  p6: {
    card1: ['IoT', 'Soil Sensors', 'Environmental Sensors', 'Weather Sensors', 'GPS', 'Drone', 'Satellite Communication', 'Smart Camera'],
    card2: ['AI', 'Machine Learning', 'Predictive Analytics', 'Computer Vision', 'Data Analytics', 'Recommendation System', 'Generative AI', 'Big Data'],
    card3: ['Robotics', 'Edge Computing', 'Cloud Computing', 'GIS / Digital Mapping', 'Voice Assistant', 'Mobile App', 'IoT Automation', 'Remote Monitoring'],
  },
  p7: {
    card1: ['GPS', 'IoT', 'Smart Sensors', 'RFID', 'Smart Camera', 'Bluetooth', '5G', 'Computer Vision'],
    card2: ['AI', 'Machine Learning', 'Predictive Analytics', 'Computer Vision', 'Big Data', 'Data Analytics', 'Digital Twin', 'Recommendation System'],
    card3: ['Mobile App', 'Web Application', 'GIS / Digital Mapping', 'Intelligent Transportation System', 'Cloud Computing', 'Edge Computing', 'Digital Kiosk', 'Voice Assistant'],
  },
  p8: {
    card1: ['Computer Vision', 'Smart Camera', 'IoT', 'Smart Sensors', 'Drone', 'GPS', 'Crowdsourcing', 'Environmental Sensors'],
    card2: ['AI', 'Machine Learning', 'Predictive Analytics', 'Computer Vision', 'Big Data', 'Data Analytics', 'Generative AI', 'Digital Twin'],
    card3: ['GIS / Digital Mapping', 'Mobile App', 'Web Application', 'Cloud Computing', 'Edge Computing', 'Robotics', 'Smart City Technology', 'Remote Monitoring'],
  },
}

export function drawProblemCards(problemId: string): Technology[] {
  const stack = PROBLEM_CARD_STACKS[problemId] || PROBLEM_CARD_STACKS['p1']
  const randomChoice = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  const name1 = randomChoice(stack.card1)
  const name2 = randomChoice(stack.card2)
  const name3 = randomChoice(stack.card3)

  const toTech = (name: string, slotIdx: number): Technology => {
    const meta = ALL_TECH_DICTIONARY[name] || { icon: '⚡', category: 'Intelligence', description: 'Core technological component.' }
    const cleanId = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + `-${slotIdx}`
    return {
      id: cleanId,
      name,
      icon: meta.icon,
      category: meta.category,
      description: meta.description,
    }
  }

  return [toTech(name1, 1), toTech(name2, 2), toTech(name3, 3)]
}

export const TECHNOLOGIES: Technology[] = Object.entries(ALL_TECH_DICTIONARY).map(([name, meta], idx) => ({
  id: `tech-${idx + 1}`,
  name,
  icon: meta.icon,
  category: meta.category,
  description: meta.description,
}))

export const PROBLEMS: Problem[] = [
  {
    id: 'p1',
    title: 'Emergency Response Without the Internet',
    category: 'Disaster Response',
    description: 'During a major disaster such as a flood, cyclone, or earthquake, mobile networks and internet connectivity may become unavailable. Emergency teams still need to identify people who need help, prioritize locations, and coordinate rescue operations.',
    challenge: 'Design a system that can identify, prioritize, and coordinate emergency assistance without relying on normal internet connectivity.',
    twist: 'No Internet — the solution must work without normal internet connectivity.',
  },
  {
    id: 'p2',
    title: "The City That Can't Predict Traffic",
    category: 'Urban Mobility',
    description: 'Traffic congestion can suddenly appear because of accidents, road damage, VIP movement, weather, or large public events. By the time authorities react, thousands of commuters may already be stuck.',
    challenge: 'Design a system that can detect abnormal traffic conditions early and automatically suggest actions to reduce congestion before it becomes critical.',
    twist: 'Budget Cut — Your solution cannot depend on expensive infrastructure.',
  },
  {
    id: 'p3',
    title: 'Find the Water Before It Runs Out',
    category: 'Water Management',
    description: 'Many communities lose large amounts of water through leaking pipelines, unauthorized usage, and inefficient distribution. Authorities often discover the problem only after significant water has already been wasted.',
    challenge: 'Design a system that can identify where water is being wasted, predict potential shortages, and help authorities prioritize action.',
    twist: 'Rural Mode — The solution must work in areas with limited connectivity and infrastructure.',
  },
  {
    id: 'p4',
    title: 'The Hospital Waiting Room',
    category: 'Healthcare',
    description: 'Emergency departments can become overcrowded. Patients with serious conditions may wait alongside people with less urgent problems, while hospital staff struggle to understand the situation across multiple departments.',
    challenge: 'Design a system that can identify patient urgency, manage waiting-room congestion, and help hospitals allocate limited resources more intelligently.',
    twist: "Privacy Mode — You cannot expose a patient's personal medical information.",
  },
  {
    id: 'p5',
    title: 'The Waste Nobody Wants to Pick Up',
    category: 'Waste Management',
    description: 'Public waste bins are often either collected too early, wasting collection resources, or too late, causing overflowing garbage and unhygienic conditions.',
    challenge: 'Design a system that can predict when waste collection is actually required and dynamically optimize collection routes.',
    twist: 'Scale It — Your solution must work for a city with 1 million+ people.',
  },
  {
    id: 'p6',
    title: "The Farmer Who Doesn't Know What's Coming",
    category: 'Agriculture',
    description: 'Farmers make decisions about irrigation, crop protection, harvesting, and planting without always having timely information about changing weather, soil conditions, pests, or market conditions.',
    challenge: 'Design a system that gives farmers early warnings and actionable recommendations before a potential crop loss occurs.',
    twist: 'No Smartphone — The farmer cannot be expected to continuously use a smartphone app.',
  },
  {
    id: 'p7',
    title: 'Where Did the Bus Go?',
    category: 'Public Transport',
    description: 'Public transport passengers often don\'t know whether a bus is actually coming, delayed, overcrowded, or diverted. This leads to wasted time and unnecessary crowding at bus stops.',
    challenge: 'Design a system that can predict bus arrival conditions, detect overcrowding, and help passengers make better travel decisions in real time.',
    twist: 'Power Failure — Your system must continue providing essential functionality during temporary power loss.',
  },
  {
    id: 'p8',
    title: "The City That Doesn't Notice Its Problems",
    category: 'Civic Infrastructure',
    description: 'Thousands of small problems—potholes, broken streetlights, illegal dumping, damaged signs, blocked drains, water leakage—exist across cities. Authorities cannot manually inspect every street every day.',
    challenge: 'Design a system that can automatically detect infrastructure problems, determine their severity, and prioritize which problems authorities should fix first.',
    twist: 'Citizen + Government — Your solution must allow both citizens and authorities to participate without creating duplicate reports.',
  },
]

export const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'Code Crushers', members: ['Alex', 'Sam', 'Jordan'], score: 87, rank: 1, rankChange: 2 },
  { id: 't2', name: 'Byte Busters', members: ['Riya', 'Dev'], score: 82, rank: 2, rankChange: -1 },
  { id: 't3', name: 'Stack Overflow', members: ['Morgan', 'Casey', 'Taylor'], score: 79, rank: 3, rankChange: 1 },
  { id: 't4', name: 'Null Pointers', members: ['Chris', 'Jamie'], score: 74, rank: 4, rankChange: 0 },
  { id: 't5', name: 'Git Push Force', members: ['Priya', 'Arun', 'Neha'], score: 71, rank: 5, rankChange: -2 },
  { id: 't6', name: '404 Found', members: ['Lee', 'Kim'], score: 68, rank: 6, rankChange: 0 },
]

export const MOCK_GAME: Game = {
  id: 'game-1',
  code: 'BWB-472',
  name: 'TechFest 2026 Finals',
  phase: 'BUILDING',
  currentRound: 1,
  teams: MOCK_TEAMS,
  currentProblem: PROBLEMS[0],
  buildDurationMinutes: 15,
  isFinalRound: false,
  finalistTeamIds: [],
}

export const TOURNAMENT_ROUNDS = [
  {
    round: 1,
    name: 'Round 1: Problem Understanding & Existing Landscape',
    subtitle: '100 Pts Evaluation · Zero Elimination',
    elimination: 'Zero Elimination — All registered squads advance to Round 2!',
    rule: 'Teams select their problem statement, draft 3 surprise tech cards, and pitch how deeply they understand the root causes, existing market solutions, and core limitations.',
    focus: 'Problem Root Causes, User Pain Points, Existing Solution Critique, Initial Tech Alignment',
    marks: '100 Pts Total',
    capacity: 'Open Entry',
    badge: 'Round 1 / Zero Elimination (100 Pts)',
  },
  {
    round: 2,
    name: 'Round 2: Solution Architecture & Innovation Enhancement',
    subtitle: '100 Pts Evaluation · Top 8 Qualify for Grand Finals',
    elimination: 'Top 8 squads with highest cumulative scores advance to Round 3 Grand Finals.',
    rule: 'Teams present how they enhance and build on their solution, integrating all 3 surprise frontier tech cards into a feasible, scalable architecture.',
    focus: 'Enhanced Solution Architecture, 3-Card Tech Integration, Feasibility & Scalability, Novel Ideation',
    marks: '100 Pts Total',
    capacity: '16 Teams (8 × 2)',
    badge: 'Round 2 / Top 8 Qualify (100 Pts)',
  },
  {
    round: 3,
    name: 'Round 3: Grand Finals & Championship Defense',
    subtitle: 'Top 8 Finalists · Top 4 Crowned on Podium',
    elimination: 'Top 4 Awarded: 🥇 1st Place (1), 🥈 2nd Place (1), 🥉 Dual 3rd Place (2)',
    rule: 'The Top 8 finalist squads deliver their refined master pitch and defend their architecture live against rigorous judge Q&A.',
    focus: 'Master System Pitch, Live Defense & Q&A, Business Viability & Impact',
    marks: 'Championship Podium Ranking',
    capacity: '8 Finalists',
    badge: 'Round 3 / Grand Finals (Top 4 Prized)',
  },
] as const

export const SCORING_CRITERIA = [
  { key: 'problemUnderstanding', label: 'Problem Understanding & Landscape', max: 30, desc: 'Clarity on root causes, pain points & shortcomings of existing solutions' },
  { key: 'creativity', label: 'Novelty & Architecture Ideation', max: 20, desc: 'Innovative approach and creative formulation' },
  { key: 'technologyUsage', label: '3-Card Tech Integration', max: 20, desc: 'How effectively the 3 surprise frontier tech cards are embedded' },
  { key: 'technicalFeasibility', label: 'Feasibility & Edge-to-Cloud Flow', max: 15, desc: 'Realistic components, scalability, and system flows' },
  { key: 'pitch', label: 'Pitch Presentation Clarity', max: 10, desc: 'Concise, clear, and compelling delivery within time' },
  { key: 'defense', label: 'Judge Q&A Defense', max: 5, desc: 'Resilience and clarity under judge technical questions' },
]

export const ROUND_1_SCORING_CRITERIA = [
  { key: 'problemUnderstanding', label: 'Problem & Root Cause Understanding', max: 35, desc: 'Depth of understanding, target audience needs, and ecosystem pain points' },
  { key: 'technicalFeasibility', label: 'Critique of Existing Solutions & Gaps', max: 25, desc: 'Identification of why current methods fail and where the opportunity lies' },
  { key: 'technologyUsage', label: 'Initial Tech Stack Formulation', max: 20, desc: 'Relevance of the 3 frontier technologies to the core challenge' },
  { key: 'pitch', label: 'Clarity & Structure of Pitch', max: 15, desc: 'Structure, focus, and effectiveness of problem articulation' },
  { key: 'defense', label: 'Judge Q&A Defense', max: 5, desc: 'Response to initial judge queries and problem nuances' },
]

export const ROUND_2_SCORING_CRITERIA = [
  { key: 'technologyUsage', label: 'Enhanced 3-Card Tech Integration', max: 30, desc: 'Deep technical synthesis of all 3 surprise frontier tech cards' },
  { key: 'creativity', label: 'Novelty & Enhanced Architecture', max: 25, desc: 'Originality, architectural enhancement, and differentiation' },
  { key: 'technicalFeasibility', label: 'System Flow & Scaling Feasibility', max: 20, desc: 'Edge-to-cloud handshakes, failover resilience & BOM cost realism' },
  { key: 'problemUnderstanding', label: 'Problem-Solution Alignment', max: 10, desc: 'How precisely the enhanced system solves the verified problem' },
  { key: 'pitch', label: 'Elevator Pitch Delivery', max: 10, desc: 'Compelling 60-second architecture walkthrough' },
  { key: 'defense', label: 'Judge Attack Defense', max: 5, desc: 'Handling rigorous edge-case technical attacks' },
]

export const ROUND_3_SCORING_CRITERIA = [
  { key: 'creativity', label: 'Master System Architecture & Innovation', max: 30, desc: 'End-to-end master system blueprint and technological elegance' },
  { key: 'technicalFeasibility', label: 'Production Viability & Resilience', max: 25, desc: 'Real-world deployment feasibility, security, and edge fallback' },
  { key: 'technologyUsage', label: 'Seamless Tech Synthesis', max: 20, desc: 'Mastery over the frontier tech stack components' },
  { key: 'defense', label: 'Live Stage Defense & Q&A Mastery', max: 15, desc: 'Composure and technical depth during live judge interrogation' },
  { key: 'pitch', label: 'Championship Pitch Delivery', max: 10, desc: 'Stage presence, storytelling, and high-impact presentation' },
]

export function getScoringCriteriaForRound(round: number = 1) {
  if (round === 1) return ROUND_1_SCORING_CRITERIA
  if (round === 2) return ROUND_2_SCORING_CRITERIA
  if (round === 3) return ROUND_3_SCORING_CRITERIA
  return SCORING_CRITERIA
}

export const PHASE_LABELS: Record<string, string> = {
  LOBBY: 'Lobby',
  PROBLEM_REVEAL: 'Problem Reveal',
  CARD_REVEAL: 'Card Reveal',
  BUILDING: 'Building',
  SUBMISSION_LOCKED: 'Submissions Locked',
  PITCHING: 'Pitching',
  JUDGE_ATTACK: 'Judge Attack',
  JUDGING: 'Judging',
  LEADERBOARD: 'Leaderboard',
  FINAL_ROUND: 'Final Round',
  RESULTS: 'Final Results',
}

export const PHASE_FLOW = [
  'LOBBY',
  'PROBLEM_REVEAL',
  'CARD_REVEAL',
  'BUILDING',
  'SUBMISSION_LOCKED',
  'PITCHING',
  'JUDGE_ATTACK',
  'JUDGING',
  'LEADERBOARD',
  'RESULTS',
] as const


