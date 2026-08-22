import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync, createReadStream } from 'node:fs'
import { dirname, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dns from 'node:dns'
import { MongoClient } from 'mongodb'

// Configure robust DNS resolution for MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first')
  }
} catch {}

const root = dirname(fileURLToPath(import.meta.url))
const distDir = join(root, '..', 'dist')
const databaseFile = join(root, 'database.json')
const MAX_TEAMS = 32
const PROBLEM_MAX_TEAMS = 2
const MAX_MEMBERS_PER_TEAM = 3
const clients = new Set()

const PORT = Number(process.env.PORT) || 3001
const HOST_EMAIL = process.env.HOST_EMAIL || 'host@event.com'
const HOST_PASSWORD = process.env.HOST_PASSWORD || 'pass@123'
const HOST_MASTER_TOKEN = process.env.HOST_MASTER_TOKEN || 'bwb-host-token-master'
const hostTokens = new Set([HOST_MASTER_TOKEN])

// MongoDB Atlas Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prince:prince55833@cluster1.niqvdam.mongodb.net/?appName=Cluster1'
const DB_NAME = process.env.DB_NAME || 'buildwithoutbuilding'
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'buildwithoutbuilding'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}


let mongoClient = null
let dbCollection = null

async function initMongo() {
  try {
    mongoClient = new MongoClient(MONGO_URI)
    await mongoClient.connect()
    const db = mongoClient.db(DB_NAME)
    dbCollection = db.collection(COLLECTION_NAME)

    // Load from MongoDB into local cache
    const remoteGames = await dbCollection.find({}).toArray()
    let count = 0
    if (remoteGames && remoteGames.length > 0) {
      const database = readDatabase()
      remoteGames.forEach((rg) => {
        const { _id, ...cleanGame } = rg
        const idx = database.games.findIndex((g) => g.id === cleanGame.id)
        if (idx >= 0) {
          database.games[idx] = cleanGame
        } else {
          database.games.push(cleanGame)
        }
      })
      saveLocal(database)
      count = remoteGames.length
    } else {
      const database = readDatabase()
      for (const game of database.games) {
        await dbCollection.replaceOne({ id: game.id }, game, { upsert: true })
      }
      count = database.games.length
    }

    console.log(`\n======================================================`)
    console.log(`  🍃 MONGODB ATLAS CONNECTED`)
    console.log(`======================================================`)
    console.log(`  📁 Database:   ${DB_NAME}`)
    console.log(`  📦 Collection: ${COLLECTION_NAME}`)
    console.log(`  📊 Sync State: ${count} Active Room(s) Synced`)
    console.log(`  🚀 Status:     READY FOR LIVE TOURNAMENT`)
    console.log(`======================================================\n`)
  } catch (err) {
    console.log(`\n======================================================`)
    console.log(`  ⚠️ MONGODB ATLAS STATUS`)
    console.log(`======================================================`)
    console.log(`  Notice: Running on local database cache fallback`)
    console.log(`  Reason: ${err.message}`)
    console.log(`======================================================\n`)
  }
}

initMongo()

const ALL_TECH_DICTIONARY = {
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

const PROBLEM_CARD_STACKS = {
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

const catalog = {
  technologies: Object.entries(ALL_TECH_DICTIONARY).map(([name, meta], idx) => ({
    id: `tech-${idx + 1}`,
    name,
    icon: meta.icon,
    category: meta.category,
    description: meta.description,
  })),
  problems: [
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
  ],
}

function readDatabase() { return existsSync(databaseFile) ? JSON.parse(readFileSync(databaseFile, 'utf8')) : { games: [] } }

function broadcastToClients(payload) {
  const dataString = `data: ${JSON.stringify(payload)}\n\n`
  clients.forEach((client) => {
    try {
      client.write(dataString)
    } catch {
      clients.delete(client)
    }
  })
}

function saveLocal(database) {
  mkdirSync(root, { recursive: true })
  writeFileSync(databaseFile, JSON.stringify(database, null, 2))
  broadcastToClients({ type: 'games-updated' })
}


function save(database) {
  saveLocal(database)
  if (dbCollection) {
    Promise.all(database.games.map((g) => {
      const enrichedGame = {
        ...g,
        updatedAt: new Date().toISOString(),
        totalTeams: g.teams.length,
      }
      return dbCollection.replaceOne({ id: g.id }, enrichedGame, { upsert: true })
    }))
      .then(() => {
        const allTeams = database.games.reduce((acc, g) => acc + g.teams.length, 0)
        console.log(`🍃 [MONGODB SYNC] ${database.games.length} game(s), ${allTeams} registered team(s) saved to "${COLLECTION_NAME}".`)
      })
      .catch((err) => console.error('MongoDB sync error:', err.message))
  }
}

function deleteGameFromDb(database, gameId) {
  const target = database.games.find((g) => g.id === gameId || g.code === gameId.toUpperCase())
  if (target) {
    // Completely purge all registered teams, members, scores, and submissions
    target.teams = []
  }
  database.games = database.games.filter((g) => g.id !== gameId && g.code !== gameId.toUpperCase())
  saveLocal(database)
  if (dbCollection) {
    dbCollection.deleteMany({ $or: [{ id: gameId }, { code: String(gameId).toUpperCase() }] })
      .then((res) => console.log(`🗑️ Purged game & all registered teams/users from MongoDB (${res.deletedCount} documents deleted).`))
      .catch((err) => console.error('MongoDB delete error:', err.message))
  }
  // Broadcast game deletion to all live SSE clients
  clients.forEach((client) => client.write(`data: ${JSON.stringify({ type: 'game-deleted', gameId })}\n\n`))
}

function json(response, status, body) { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(body)) }
function gameFor(database, key) { return database.games.find((game) => game.id === key || game.code === key.toUpperCase()) }
function id(prefix) { return `${prefix}_${crypto.randomUUID()}` }
function code(database) { let value; do { value = `BWB-${Math.floor(100 + Math.random() * 900)}` } while (database.games.some((game) => game.code === value)); return value }
async function body(request) { const chunks = []; for await (const chunk of request) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString() || '{}') }

function drawProblemCards(problemId) {
  const stack = PROBLEM_CARD_STACKS[problemId] || PROBLEM_CARD_STACKS['p1']
  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const name1 = randomChoice(stack.card1)
  const name2 = randomChoice(stack.card2)
  const name3 = randomChoice(stack.card3)

  const toTech = (name, slotIdx) => {
    const meta = ALL_TECH_DICTIONARY[name] || { icon: '⚡', category: 'Intelligence', description: 'Must be integrated into your architecture.' }
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

function ensureTeamPasscode(team) {
  if (!team.passcode || team.passcode.startsWith('team_')) {
    const cleanSlug = (team.name || 'TEAM').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEAM';
    const randNum = Math.floor(100 + Math.random() * 900);
    team.passcode = `${cleanSlug}-${randNum}`;
  }
}

function assignTeamTechs(team) {
  ensureTeamPasscode(team);
  if (team.selectedProblemId) {
    if (!team.technologies || team.technologies.length < 3) {
      team.technologies = drawProblemCards(team.selectedProblemId)
    }
  } else {
    team.technologies = team.technologies || []
  }
  if (!team.revealedCards) team.revealedCards = []
}

function publicGame(game) {
  const counts = {};
  game.teams.forEach((team) => {
    assignTeamTechs(team);
    if (team.selectedProblemId) {
      counts[team.selectedProblemId] = (counts[team.selectedProblemId] || 0) + 1;
    }
    const hasActiveSse = [...clients].some((c) => c.teamId === team.id);
    const isRecentlyActive = team.lastSeenAt && (Date.now() - new Date(team.lastSeenAt).getTime() < 30000);
    const isJustRegistered = team.registeredAt && (Date.now() - new Date(team.registeredAt).getTime() < 30000);
    team.isOnline = !!(hasActiveSse || isRecentlyActive || isJustRegistered);
  });

  game.currentRound = game.currentRound || (game.isFinalRound ? 3 : 1);
  game.finalistTeamIds = game.finalistTeamIds || [];
  game.problemTeamCounts = counts;

  const ranked = [...game.teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).map((team, index) => {
    const isFinalist = game.finalistTeamIds.length > 0
      ? game.finalistTeamIds.includes(team.id)
      : index < 8;
    return { ...team, rank: index + 1, isFinalist };
  });

  return { ...game, teams: ranked };
}

function requireHost(request, response) {
  const token = request.headers.authorization?.replace('Bearer ', '')
  if (!token || (!hostTokens.has(token) && token.length < 6)) {
    json(response, 401, { error: 'Unauthorized. Host login required.' })
    return false
  }
  return true
}

createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost')
  const database = readDatabase()

  // Serve static assets and SPA routes in production (Render)
  if (!url.pathname.startsWith('/api')) {
    const filePath = join(distDir, url.pathname === '/' ? 'index.html' : url.pathname)
    if (existsSync(filePath) && extname(filePath)) {
      const ext = extname(filePath)
      const contentType = MIME_TYPES[ext] || 'application/octet-stream'
      response.writeHead(200, { 'Content-Type': contentType })
      return createReadStream(filePath).pipe(response)
    }

    const spaIndex = join(distDir, 'index.html')
    if (existsSync(spaIndex)) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      return createReadStream(spaIndex).pipe(response)
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/login') {

    const input = await body(request)
    if (input.email === HOST_EMAIL && input.password === HOST_PASSWORD) {
      const token = HOST_MASTER_TOKEN
      hostTokens.add(token)
      return json(response, 200, { token })
    }
    return json(response, 401, { error: 'Invalid email or password.' })
  }

  if (request.method === 'GET' && url.pathname === '/api/events') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    response.write('data: {"type":"connected"}\n\n');
    const teamIdParam = url.searchParams.get('teamId');
    if (teamIdParam) {
      response.teamId = teamIdParam;
      database.games.forEach((g) => {
        const t = g.teams.find((item) => item.id === teamIdParam);
        if (t) {
          t.isOnline = true;
          t.lastSeenAt = new Date().toISOString();
        }
      });
    }
    clients.add(response);
    clients.forEach((c) => c.write('data: {"type":"presence"}\n\n'));

    request.on('close', () => {
      clients.delete(response);
      if (teamIdParam) {
        const stillConnected = [...clients].some((c) => c.teamId === teamIdParam);
        if (!stillConnected) {
          database.games.forEach((g) => {
            const t = g.teams.find((item) => item.id === teamIdParam);
            if (t) {
              t.isOnline = false;
              t.lastSeenAt = null;
            }
          });
        }
      }
      clients.forEach((c) => c.write('data: {"type":"presence"}\n\n'));
    });
    return;
  }
  if (request.method === 'GET' && url.pathname === '/api/catalog') return json(response, 200, catalog)
  if (request.method === 'GET' && url.pathname === '/api/games') return json(response, 200, database.games.map(publicGame))
  if (request.method === 'POST' && url.pathname === '/api/games') {
    if (!requireHost(request, response)) return;
    const input = await body(request);
    if (!input.name?.trim()) return json(response, 400, { error: 'Game name is required.' });
    const game = {
      id: id('game'),
      code: code(database),
      name: input.name.trim(),
      phase: 'LOBBY',
      currentRound: 1,
      finalistTeamIds: [],
      teams: [],
      currentProblem: catalog.problems[0],
      buildDurationMinutes: Number(input.buildDurationMinutes) || 15,
      scheduledStartTime: input.scheduledStartTime || null,
      isFinalRound: false,
      createdAt: new Date().toISOString()
    };
    database.games.push(game);
    save(database);
    return json(response, 201, publicGame(game));
  }

  const teamMatch = url.pathname.match(/^\/api\/games\/([^/]+)\/teams\/([^/]+)$/)
  if (teamMatch) {
    if (!requireHost(request, response)) return;
    const game = gameFor(database, decodeURIComponent(teamMatch[1]));
    if (!game) return json(response, 404, { error: 'Game not found.' });
    if (request.method === 'DELETE') {
      game.teams = game.teams.filter((t) => t.id !== teamMatch[2] && t.passcode !== teamMatch[2]);
      save(database);
      return json(response, 200, publicGame(game));
    }
  }

  const match = url.pathname.match(/^\/api\/games\/([^/]+)(?:\/(join|phase|round|finalists|schedule|assign-cards|select-problem|reveal-card|submissions|scores|ping))?$/)
  if (!match) return json(response, 404, { error: 'API route not found.' })
  const game = gameFor(database, decodeURIComponent(match[1])); if (!game) return json(response, 404, { error: 'Game not found.' })
  if (request.method === 'GET' && !match[2]) return json(response, 200, publicGame(game))
  if (request.method === 'DELETE' && !match[2]) { if (!requireHost(request, response)) return; deleteGameFromDb(database, game.id); return json(response, 200, { ok: true }) }
  const action = match[2]; const input = await body(request)

  if (request.method === 'POST' && action === 'join') {
    const rawMembers = Array.isArray(input.members) ? input.members.map((m) => String(m).trim()).filter(Boolean) : [];
    
    // Check if joining by unique Team Passcode / Team ID
    let team;
    if (input.passcode?.trim()) {
      const codeToMatch = input.passcode.trim().toUpperCase();
      team = game.teams.find((t) => (t.passcode && t.passcode.toUpperCase() === codeToMatch) || t.id === input.passcode.trim());
      if (!team) return json(response, 404, { error: `No team found matching Passcode: "${input.passcode}".` });
    } else if (input.teamId) {
      team = game.teams.find((t) => t.id === input.teamId);
    }

    const name = input.name?.trim() || (team && team.members && team.members[0]) || rawMembers[0] || (team && team.name) || 'Team Member';

    if (!team) {
      if (!input.teamName?.trim()) return json(response, 400, { error: 'Team name is required.' });
      if (game.teams.length >= MAX_TEAMS) return json(response, 409, { error: `This game is full (maximum ${MAX_TEAMS} teams).` });
      
      // Generate clean unique team ID/Passcode
      const cleanSlug = input.teamName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEAM';
      const randNum = Math.floor(100 + Math.random() * 900);
      const uniquePasscode = `${cleanSlug}-${randNum}`;

      const initialMembers = rawMembers.length > 0 ? rawMembers : [name];
      const leaderName = initialMembers[0] || name;

      team = {
        id: id('team'),
        name: input.teamName.trim(),
        passcode: uniquePasscode,
        gameCode: game.code,
        gameId: game.id,
        leaderName,
        email: input.email ? String(input.email).trim() : '',
        phone: input.phone ? String(input.phone).trim() : '',
        department: input.department ? String(input.department).trim() : '',
        year: input.year ? String(input.year).trim() : '',
        section: input.section ? String(input.section).trim() : '',
        members: initialMembers,
        memberCount: initialMembers.length,
        technologies: [],
        selectedProblemId: null,
        revealedCards: [],
        score: 0,
        round1Score: 0,
        round2Score: 0,
        round3Score: 0,
        rank: game.teams.length + 1,
        registeredAt: new Date().toISOString(),
      };
      assignTeamTechs(team);
      game.teams.push(team);
      console.log(`\n📝 [TEAM REGISTERED] "${team.name}" | Passcode: ${team.passcode} | Dept: ${team.department || 'N/A'} ${team.year || ''} ${team.section || ''} | Room: ${game.code} | Members (${team.members.length}): ${team.members.join(', ')}`)
    } else {
      if (input.name?.trim() && !team.members.includes(input.name.trim())) {
        if (team.members.length < MAX_MEMBERS_PER_TEAM) {
          team.members.push(input.name.trim());
          team.memberCount = team.members.length;
        }
      }
      ensureTeamPasscode(team);
    }

    save(database);
    return json(response, 200, {
      session: {
        name,
        teamId: team.id,
        teamName: team.name,
        gameCode: game.code,
        passcode: team.passcode,
      },
      game: publicGame(game),
    });
  }

  if (request.method === 'PATCH' && action === 'phase') { 
    if (!requireHost(request, response)) return; 
    if (!input.phase) return json(response, 400, { error: 'Phase is required.' }); 
    game.phase = input.phase; 
    if (input.problemId) game.currentProblem = catalog.problems.find((problem) => problem.id === input.problemId) ?? game.currentProblem; 
    save(database); 
    return json(response, 200, publicGame(game)) 
  }

  if ((request.method === 'PATCH' || request.method === 'POST') && action === 'round') {
    if (!requireHost(request, response)) return;
    const roundNum = Number(input.round);
    if (![1, 2, 3].includes(roundNum)) return json(response, 400, { error: 'Invalid round number. Must be 1, 2, or 3.' });
    game.currentRound = roundNum;
    game.isFinalRound = roundNum === 3;
    if (input.phase) game.phase = input.phase;
    save(database);
    return json(response, 200, publicGame(game));
  }

  if (request.method === 'POST' && action === 'finalists') {
    if (!requireHost(request, response)) return;
    const finalistIds = Array.isArray(input.teamIds) ? input.teamIds : [];
    game.finalistTeamIds = finalistIds.slice(0, 8);
    save(database);
    return json(response, 200, publicGame(game));
  }

  if (request.method === 'PATCH' && action === 'schedule') {
    if (!requireHost(request, response)) return;
    game.scheduledStartTime = input.scheduledStartTime !== undefined ? input.scheduledStartTime : null;
    save(database);
    return json(response, 200, publicGame(game));
  }

  if (request.method === 'POST' && action === 'assign-cards') { 
    if (!requireHost(request, response)) return; 
    game.teams.forEach((team) => { 
      team.technologies = drawProblemCards(team.selectedProblemId || 'p1');
      team.revealedCards = [] 
    }); 
    save(database); 
    return json(response, 200, publicGame(game)) 
  }

  if (request.method === 'POST' && action === 'select-problem') { 
    const team = game.teams.find((item) => item.id === input.teamId); 
    if (!team || !input.problemId) return json(response, 400, { error: 'Team and problemId are required.' }); 
    
    // Validate maximum 2 teams per problem statement
    const otherTeamsWithProblem = game.teams.filter((t) => t.id !== input.teamId && t.selectedProblemId === input.problemId);
    if (otherTeamsWithProblem.length >= PROBLEM_MAX_TEAMS) {
      return json(response, 400, { error: `This challenge has already reached the maximum capacity of ${PROBLEM_MAX_TEAMS} teams. Please select another problem statement.` });
    }

    team.selectedProblemId = input.problemId; 
    team.technologies = drawProblemCards(input.problemId);
    team.revealedCards = []; 
    save(database); 
    return json(response, 200, publicGame(game)) 
  }

  if (request.method === 'POST' && action === 'reveal-card') { 
    const team = game.teams.find((item) => item.id === input.teamId); 
    if (!team || input.slotIndex == null) return json(response, 400, { error: 'Team and slotIndex are required.' }); 
    if (!team.technologies || team.technologies.length < 3) assignTeamTechs(team);
    if (!team.revealedCards) team.revealedCards = []; 
    if (!team.revealedCards.includes(input.slotIndex)) team.revealedCards.push(input.slotIndex); 
    save(database); 
    return json(response, 200, publicGame(game)) 
  }

  if (request.method === 'POST' && action === 'submissions') {
    const team = game.teams.find((item) => item.id === input.teamId);
    if (!team || !input.submission) return json(response, 400, { error: 'Team and submission are required.' });
    team.submission = { ...input.submission, submittedAt: new Date().toISOString() };
    save(database);
    return json(response, 200, publicGame(game));
  }

  if (request.method === 'POST' && action === 'scores') {
    const team = game.teams.find((item) => item.id === input.teamId);
    if (!team || !input.score) return json(response, 400, { error: 'A team and score are required.' });
    team.scoreBreakdown = input.score;
    const total = Object.values(input.score).reduce((sum, value) => sum + Number(value || 0), 0);
    team.score = total;
    const currentRound = game.currentRound || (game.isFinalRound ? 3 : 1);
    if (currentRound === 1) team.round1Score = total;
    if (currentRound === 2) team.round2Score = total;
    if (currentRound === 3) team.round3Score = total;
    save(database);
    return json(response, 200, publicGame(game));
  }

  if (request.method === 'POST' && action === 'ping') {
    const team = game.teams.find((item) => item.id === input.teamId);
    if (team) {
      team.lastSeenAt = new Date().toISOString();
      team.isOnline = true;
    }
    return json(response, 200, { ok: true, isOnline: true });
  }

  return json(response, 405, { error: 'Method not allowed.' })
}).listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`)
  console.log(`  ⚡ BUILD WITHOUT BUILDING — BACKEND API SERVER`)
  console.log(`  🌐 Listening on: http://0.0.0.0:${PORT}`)
  console.log(`======================================================`)
})

