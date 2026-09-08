export interface Civilization {
  name: string
  lon: number
  lat: number
  note: string
}

export interface Challenge {
  problem: string
  solution: string
}

export interface HumanAge {
  id: string
  name: string
  span: string
  /** Approximate start year (negative = BCE) used for ordering and the track. */
  startYear: number
  accent: string
  icon: string
  tagline: string
  summary: string
  civilizations: Civilization[]
  breakthroughs: string[]
  challenges: Challenge[]
  /** Night-light intensity 0..1 and sprawl 0..1 for the globe. */
  lights: number
  sprawl: number
  population: string
}

export const humanAges: HumanAge[] = [
  {
    id: 'stone',
    name: 'Stone Age',
    span: '3.3 million – 3300 BCE',
    startYear: -3300000,
    accent: '#d4a373',
    icon: 'fa-mountain',
    tagline: 'Fire, language and the first villages',
    summary:
      'For 99% of the human story, technology is knapped stone, fire and cooperation. Small mobile bands survive glacial cycles, cross oceans, paint caves, and—after the last ice age—invent farming independently in at least six regions, giving rise to the first towns.',
    population: '~5 million by 8000 BCE',
    civilizations: [
      { name: 'Göbekli Tepe', lon: 38.9, lat: 37.2, note: 'Monumental pillars, 9500 BCE—before farming' },
      { name: 'Çatalhöyük', lon: 32.8, lat: 37.7, note: 'Proto-city of 8,000 people, 7100 BCE' },
      { name: 'Jericho', lon: 35.4, lat: 31.9, note: 'Walled Neolithic town, 9000 BCE' },
      { name: 'Jiahu & Yangshao', lon: 113.6, lat: 33.6, note: 'Rice and millet farming, proto-writing' },
      { name: 'Mehrgarh', lon: 67.6, lat: 29.4, note: 'Wheat, barley and cattle by 7000 BCE' },
      { name: 'Jōmon Japan', lon: 140, lat: 37, note: 'World’s earliest pottery, 14,000 BCE' },
      { name: 'Lascaux & Chauvet', lon: 1.2, lat: 45, note: 'Cave art, 36,000–17,000 years ago' },
      { name: 'Blombos Cave', lon: 21.2, lat: -34.4, note: 'Engraved ochre, 75,000 years ago' },
    ],
    breakthroughs: ['Controlled fire (~1 Mya; routine by 400 kya)', 'Composite tools and the atlatl', 'Language and symbolic art', 'Sewn clothing and boats', 'Pottery (Jōmon, 14,000 BCE)', 'Domestication of wheat, rice, cattle, dogs', 'Permanent settlements and the loom'],
    challenges: [
      { problem: 'Surviving ice-age climate swings, predators and food scarcity', solution: 'Fire for warmth and cooking, projectile weapons, clothing, and shared knowledge passed through language' },
      { problem: 'Small, isolated groups vulnerable to chance', solution: 'Kinship networks, gift exchange and ritual gatherings that linked bands across hundreds of kilometres' },
      { problem: 'Feeding growing settled populations after the Younger Dryas', solution: 'Domestication of plants and animals, storage pits and granaries, irrigation ditches' },
      { problem: 'Disease and waste in the first dense villages', solution: 'Plastered floors, burial practices, and settlement relocation—the beginning of urban hygiene' },
    ],
    lights: 0.06,
    sprawl: 0.05,
  },
  {
    id: 'metals',
    name: 'Age of Metals',
    span: '3300 BCE – 1760 CE',
    startYear: -3300,
    accent: '#f59e0b',
    icon: 'fa-gavel',
    tagline: 'Bronze, iron, writing and the agrarian empires',
    summary:
      'Smelting copper with tin creates bronze and, with it, cities, kings, armies and the first writing. Iron democratises tools around 1200 BCE. Over four millennia, agrarian empires from Rome to Han China to the Inca build roads, laws, libraries and religions—then confront collapse, plague and the limits of muscle power.',
    population: '~50 million (3000 BCE) → 770 million (1760)',
    civilizations: [
      { name: 'Sumer & Babylon', lon: 45.5, lat: 32, note: 'Cuneiform writing, the wheel, Code of Hammurabi' },
      { name: 'Ancient Egypt', lon: 31.2, lat: 27, note: 'Pyramids, hieroglyphs, 3,000 years of state continuity' },
      { name: 'Indus Valley', lon: 70, lat: 27.5, note: 'Grid cities with drains at Mohenjo-daro' },
      { name: 'Shang → Han China', lon: 112, lat: 34.5, note: 'Bronze ritual vessels, paper, the Silk Road' },
      { name: 'Greece & Rome', lon: 17, lat: 40, note: 'Philosophy, democracy, aqueducts and law' },
      { name: 'Persia', lon: 52, lat: 31, note: 'Royal Road, satrapies, the first world empire' },
      { name: 'Maurya & Gupta India', lon: 84, lat: 24, note: 'Zero, decimal numerals, Buddhism spreads' },
      { name: 'Maya & Aztec', lon: -90, lat: 17.5, note: 'Astronomy, glyphs, chinampa agriculture' },
      { name: 'Inca', lon: -72, lat: -13.5, note: 'Roads across the Andes, quipu records' },
      { name: 'Abbasid Caliphate', lon: 44.4, lat: 33.3, note: 'House of Wisdom, algebra, translation movement' },
      { name: 'Mali & Songhai', lon: -3, lat: 16.8, note: 'Timbuktu’s libraries and trans-Saharan gold' },
      { name: 'Mongol Empire', lon: 106, lat: 47, note: 'Largest land empire; Pax Mongolica trade' },
    ],
    breakthroughs: ['Bronze (3300 BCE) and iron (1200 BCE) metallurgy', 'Writing: cuneiform, hieroglyphs, alphabet', 'Coinage (Lydia, 600 BCE)', 'Paper (China, 105 CE) and printing (Gutenberg, 1450)', 'Compass, gunpowder, stirrup', 'Universities and codified law', 'Ocean-going ships and global navigation'],
    challenges: [
      { problem: 'Tracking surplus grain, taxes and contracts in growing cities', solution: 'Writing, standardised weights and measures, and later coinage—accounting invented the state' },
      { problem: 'Floods and droughts on the great rivers', solution: 'Levees, canals and calendars; Egyptian nilometers and Chinese Grand Canal engineering' },
      { problem: 'Bronze Age collapse (~1200 BCE) as tin supply chains and palaces failed', solution: 'Iron—abundant and local—rebuilt economies from the village up; the alphabet made literacy cheap' },
      { problem: 'Plague: Antonine (165), Justinianic (541), Black Death (1347)', solution: 'Venice’s 40-day quarantena (1377), public hospitals, and civic health boards' },
      { problem: 'Preserving knowledge across the fall of empires', solution: 'Monasteries, the Abbasid translation movement, madrasas and universities; then movable type' },
      { problem: 'Governing millions across vast distances', solution: 'Roads, relay post, bureaucracy and legal codes from Hammurabi to Justinian to the Tang' },
    ],
    lights: 0.22,
    sprawl: 0.2,
  },
  {
    id: 'industrial',
    name: 'Industrial Age',
    span: '1760 – 1947',
    startYear: 1760,
    accent: '#ef4444',
    icon: 'fa-industry',
    tagline: 'Coal, steam, steel and electricity',
    summary:
      'Fossil energy replaces muscle. Steam engines, railways, telegraphs and factories reorganise where and how people live; life expectancy doubles once germ theory, sanitation and vaccines catch up. The same forces power colonial empires and two world wars before a new international order is built in 1945.',
    population: '770 million → 2.4 billion',
    civilizations: [
      { name: 'Britain', lon: -1.5, lat: 53, note: 'Manchester mills, Watt’s engine, the first railways' },
      { name: 'Germany', lon: 10, lat: 51, note: 'Chemicals, Siemens, Haber–Bosch' },
      { name: 'United States', lon: -80, lat: 41, note: 'Edison, Ford’s assembly line, the Wright brothers' },
      { name: 'France', lon: 2.3, lat: 48.8, note: 'Pasteur, Curie, the metric system' },
      { name: 'Meiji Japan', lon: 139.7, lat: 35.7, note: 'Rapid industrialisation from 1868' },
      { name: 'Russia / USSR', lon: 37.6, lat: 55.7, note: 'Trans-Siberian railway; forced industrialisation' },
      { name: 'Colonial India', lon: 88.4, lat: 22.6, note: 'Railways and telegraph; Calcutta, then Bombay' },
    ],
    breakthroughs: ['Watt’s steam engine (1776) and railways (1825)', 'Bessemer steel (1856)', 'Telegraph (1844), telephone (1876), radio (1901)', 'Electric grid (1882) and the light bulb', 'Germ theory, anaesthesia, vaccines, penicillin (1928)', 'Haber–Bosch fertiliser (1913)', 'Automobile, powered flight (1903), assembly line'],
    challenges: [
      { problem: 'Cholera and typhoid in overcrowded industrial cities', solution: 'John Snow’s epidemiology (1854), Bazalgette’s London sewers, chlorinated water—the biggest gain in human lifespan ever' },
      { problem: 'Child labour, 14-hour days and factory injuries', solution: 'Factory Acts, trade unions, the weekend, universal schooling' },
      { problem: 'Famine as population outran farmland', solution: 'Mechanised agriculture, refrigerated shipping, and synthetic nitrogen fertiliser' },
      { problem: 'Coal smoke and river pollution', solution: 'Smoke abatement laws and the first public parks; the full reckoning waits a century' },
      { problem: 'Industrialised total war and the Great Depression', solution: 'League of Nations, then the UN (1945), Bretton Woods, welfare states and Keynesian policy' },
      { problem: 'Distance: goods and news moved at the speed of a horse', solution: 'Railways, steamships, the telegraph and standard time zones (1884)' },
    ],
    lights: 0.42,
    sprawl: 0.4,
  },
  {
    id: 'silicon',
    name: 'Silicon Age',
    span: '1947 – 1971',
    startYear: 1947,
    accent: '#a78bfa',
    icon: 'fa-microchip',
    tagline: 'The transistor shrinks the world',
    summary:
      'Bell Labs’ transistor (1947) replaces fragile vacuum tubes; the integrated circuit (1958) puts whole circuits on a sliver of silicon. Moore’s observation in 1965 sets a 50-year trajectory. Mainframes run banks and airlines, Sputnik and Apollo race to orbit, and in 1969 the first ARPANET packets flow.',
    population: '2.4 → 3.8 billion',
    civilizations: [
      { name: 'Silicon Valley', lon: -122.1, lat: 37.4, note: 'Shockley, Fairchild, Intel (1968)' },
      { name: 'Bell Labs, New Jersey', lon: -74.4, lat: 40.7, note: 'Transistor, information theory, Unix' },
      { name: 'Soviet Union', lon: 63.3, lat: 45.9, note: 'Sputnik (1957), Gagarin (1961), Baikonur' },
      { name: 'Japan', lon: 139.7, lat: 35.7, note: 'Sony transistor radio, Shinkansen (1964)' },
      { name: 'Western Europe', lon: 7, lat: 49, note: 'CERN (1954), Airbus, the EEC (1957)' },
      { name: 'India', lon: 77.2, lat: 28.6, note: 'Green Revolution, IITs, ISRO (1969)' },
    ],
    breakthroughs: ['Point-contact transistor (1947)', 'Integrated circuit (Kilby & Noyce, 1958)', 'Structure of DNA (1953), polio vaccine (1955)', 'Sputnik (1957), Apollo 11 (1969)', 'IBM System/360 (1964), Moore’s law (1965)', 'ARPANET (1969), Unix (1969)', 'Intel 4004 microprocessor (1971)'],
    challenges: [
      { problem: 'Computers the size of rooms that failed every few hours', solution: 'Solid-state transistors, then integrated circuits with the planar process—reliability and cost fell by orders of magnitude' },
      { problem: 'Feeding a population doubling in one lifetime', solution: 'Borlaug’s high-yield wheat and rice—the Green Revolution averted predicted famines in India and Mexico' },
      { problem: 'Nuclear brinkmanship and the Cold War', solution: 'Hotlines, the Partial Test Ban (1963) and NPT (1968); the space race redirected rivalry into science' },
      { problem: 'Networks that died if a single switch failed', solution: 'Packet switching and distributed routing—the design principle behind the Internet' },
      { problem: 'Polio and smallpox', solution: 'Mass vaccination; smallpox eradication campaign begins in 1967' },
    ],
    lights: 0.6,
    sprawl: 0.55,
  },
  {
    id: 'computers',
    name: 'Computer Age',
    span: '1971 – 1991',
    startYear: 1971,
    accent: '#38bdf8',
    icon: 'fa-desktop',
    tagline: 'A computer on every desk',
    summary:
      'The microprocessor makes computing personal: Altair, Apple II, IBM PC and Macintosh bring spreadsheets, word processing and games home. Software becomes an industry, TCP/IP unifies networks, and Japan’s electronics boom fills the world with Walkmans and VCRs—while oil shocks, Chernobyl and the ozone hole show the costs of an industrial planet.',
    population: '3.8 → 5.4 billion',
    civilizations: [
      { name: 'Silicon Valley', lon: -122, lat: 37.4, note: 'Apple (1976), Xerox PARC’s GUI, Sun, Oracle' },
      { name: 'Seattle & Redmond', lon: -122.1, lat: 47.6, note: 'Microsoft (1975), MS-DOS, Windows' },
      { name: 'Japan', lon: 139.7, lat: 35.7, note: 'Sony, Nintendo, Toyota production system' },
      { name: 'Boston Route 128', lon: -71.1, lat: 42.4, note: 'DEC minicomputers, MIT, GNU (1983)' },
      { name: 'Taiwan & Korea', lon: 121.5, lat: 25, note: 'TSMC (1987), Samsung memory chips' },
      { name: 'Bangalore', lon: 77.6, lat: 13, note: 'Infosys (1981), the outsourcing wave begins' },
      { name: 'CERN, Geneva', lon: 6.05, lat: 46.2, note: 'Where the Web is about to be born (1989)' },
    ],
    breakthroughs: ['Microprocessors: Intel 8080, Motorola 68000', 'Personal computers: Apple II (1977), IBM PC (1981), Mac (1984)', 'VisiCalc, WordStar, Lotus 1-2-3', 'Ethernet, TCP/IP (1983), DNS', 'Compact disc, cellular phones (1983)', 'GNU/free software (1983); C++ and Perl', 'PCR and the first gene sequencing'],
    challenges: [
      { problem: 'Oil shocks (1973, 1979) and stagflation', solution: 'Fuel-efficiency standards, nuclear and gas expansion, Japan’s lean manufacturing revolution' },
      { problem: 'A “software crisis”—projects late, over budget, unreliable', solution: 'Structured and object-oriented programming, Unix philosophy, version control and the shrink-wrapped software market' },
      { problem: 'Incompatible proprietary networks', solution: 'Open standards—TCP/IP, Ethernet, SMTP—adopted by ARPANET in 1983 and NSFNET after' },
      { problem: 'CFCs eating the ozone layer', solution: 'The Montreal Protocol (1987)—still the most successful environmental treaty' },
      { problem: 'Chernobyl (1986) and Bhopal (1984)', solution: 'International nuclear-safety conventions and industrial-disaster regulation' },
      { problem: 'HIV/AIDS emerges', solution: 'Blood screening, public-health campaigns; antiretrovirals arrive in the next age' },
    ],
    lights: 0.72,
    sprawl: 0.7,
  },
  {
    id: 'internet',
    name: 'Internet Age',
    span: '1991 – 2004',
    startYear: 1991,
    accent: '#22d3ee',
    icon: 'fa-globe',
    tagline: 'Everything connects',
    summary:
      'Tim Berners-Lee releases the World Wide Web to the public; Mosaic and Netscape make it graphical. Amazon, eBay, Google and Wikipedia appear; Linux and Apache run the servers. A speculative bubble bursts in 2000, yet the infrastructure—fibre, browsers, search, e-commerce—survives and the human genome is read.',
    population: '5.4 → 6.4 billion',
    civilizations: [
      { name: 'Silicon Valley', lon: -122.1, lat: 37.4, note: 'Netscape, Yahoo, Google (1998), PayPal' },
      { name: 'Seattle', lon: -122.3, lat: 47.6, note: 'Amazon (1994), Windows 95' },
      { name: 'Helsinki', lon: 24.9, lat: 60.2, note: 'Linux (1991), Nokia, SMS' },
      { name: 'CERN, Geneva', lon: 6.05, lat: 46.2, note: 'WWW released into the public domain (1993)' },
      { name: 'Bangalore & Hyderabad', lon: 77.6, lat: 13, note: 'India’s IT-services boom' },
      { name: 'Shenzhen', lon: 114.1, lat: 22.5, note: 'China joins the WTO (2001); Huawei, Tencent' },
      { name: 'Seoul', lon: 127, lat: 37.5, note: 'World’s first mass broadband nation' },
      { name: 'Tokyo', lon: 139.7, lat: 35.7, note: 'i-mode mobile internet (1999)' },
    ],
    breakthroughs: ['World Wide Web (1991), Mosaic (1993)', 'Linux, Apache, MySQL, PHP—the open-source stack', 'Search engines: AltaVista, Google PageRank', 'E-commerce, SSL and online payments', 'GSM mobile phones and SMS', 'Wikipedia (2001), blogs, RSS', 'Human Genome Project completed (2003)'],
    challenges: [
      { problem: 'Finding anything in an exploding sea of pages', solution: 'Web crawlers and link-analysis ranking—Google’s PageRank turned the link graph into relevance' },
      { problem: 'Trusting strangers with money online', solution: 'SSL/TLS encryption, reputation systems (eBay), PayPal and card-fraud detection' },
      { problem: 'The dot-com bubble and its 2000–02 collapse', solution: 'Survivors built durable business models; cheap dark fibre and servers seeded the next decade' },
      { problem: 'Viruses, spam and worms (ILOVEYOU, Code Red)', solution: 'Antivirus, spam filters, automatic patching and the security industry' },
      { problem: 'Y2K date bug across legacy systems', solution: 'A global, coordinated remediation effort—the disaster that didn’t happen' },
      { problem: 'A widening digital divide', solution: 'Falling PC prices, internet cafés, and the start of the mobile leapfrog in Africa and Asia' },
    ],
    lights: 0.82,
    sprawl: 0.82,
  },
  {
    id: 'web2',
    name: 'Web 2.0 & Mobile',
    span: '2004 – 2012',
    startYear: 2004,
    accent: '#f472b6',
    icon: 'fa-mobile-alt',
    tagline: 'Social, mobile, cloud',
    summary:
      'The web becomes read-write: Facebook, YouTube and Twitter turn users into publishers. The iPhone (2007) and Android (2008) put the internet in billions of pockets; AWS (2006) turns computing into a utility. Mobile money lifts millions in Kenya, protests coordinate on Twitter—and the 2008 financial crisis, misinformation and surveillance reveal new fragilities.',
    population: '6.4 → 7.1 billion',
    civilizations: [
      { name: 'Silicon Valley', lon: -122.1, lat: 37.4, note: 'Facebook, YouTube, Twitter, the iPhone' },
      { name: 'Seattle', lon: -122.3, lat: 47.6, note: 'AWS (2006) invents the cloud' },
      { name: 'Shenzhen & Hangzhou', lon: 117, lat: 26, note: 'Alibaba, Tencent WeChat (2011), Xiaomi' },
      { name: 'Nairobi', lon: 36.8, lat: -1.3, note: 'M-Pesa mobile money (2007)' },
      { name: 'Seoul', lon: 127, lat: 37.5, note: 'Samsung Galaxy; K-content goes global' },
      { name: 'Bangalore', lon: 77.6, lat: 13, note: 'Flipkart; India’s Aadhaar digital ID (2009)' },
      { name: 'Berlin & London', lon: 6, lat: 51.5, note: 'SoundCloud, Spotify, fintech' },
      { name: 'Tunis & Cairo', lon: 20, lat: 32, note: 'Arab Spring organised on social media (2011)' },
    ],
    breakthroughs: ['Facebook (2004), YouTube (2005), Twitter (2006)', 'iPhone (2007), Android (2008), the App Store', 'Amazon Web Services and cloud computing', 'Git and GitHub (2008)', 'Bitcoin white paper (2008)', 'M-Pesa mobile payments', 'Netflix streaming, Spotify, Kindle'],
    challenges: [
      { problem: 'Servers that couldn’t scale to a billion users', solution: 'Elastic cloud infrastructure, NoSQL databases, and open-source big-data tools (Hadoop, 2006)' },
      { problem: 'The 2008 global financial crisis', solution: 'Bank recapitalisation, stress tests, Basel III—and a wave of fintech built on distrust of banks' },
      { problem: 'Billions without bank accounts', solution: 'Mobile money and digital identity: M-Pesa, Aadhaar, UPI later' },
      { problem: 'Misinformation and the attention economy', solution: 'Fact-checking networks and platform moderation—partial, contested, ongoing' },
      { problem: 'Mass surveillance revealed by Snowden (2013)', solution: 'HTTPS everywhere, end-to-end encryption, and privacy law culminating in GDPR (2018)' },
      { problem: 'Software shipping slowly and breaking often', solution: 'Agile, continuous delivery, DevOps and distributed version control' },
    ],
    lights: 0.9,
    sprawl: 0.92,
  },
  {
    id: 'ai',
    name: 'Age of AI',
    span: '2012 – today',
    startYear: 2012,
    accent: '#8b5cf6',
    icon: 'fa-brain',
    tagline: 'Machines that learn, and agents that act',
    summary:
      'AlexNet (2012) shows deep learning works at scale; the Transformer (2017) makes language the interface. GPT-3, AlphaFold, Stable Diffusion and ChatGPT (2022) bring generative AI to hundreds of millions, and by 2026 autonomous agents write code, run workflows and negotiate on our behalf. A pandemic is answered with mRNA vaccines in under a year—while trust, energy, jobs and governance become the defining problems.',
    population: '7.1 → 8.2 billion',
    civilizations: [
      { name: 'San Francisco Bay Area', lon: -122.4, lat: 37.7, note: 'OpenAI, Google DeepMind, Anthropic, Nvidia' },
      { name: 'Seattle', lon: -122.3, lat: 47.6, note: 'Microsoft, Amazon: hyperscale AI infrastructure' },
      { name: 'London', lon: -0.1, lat: 51.5, note: 'DeepMind, AlphaFold, the AI Safety Institute' },
      { name: 'Beijing & Hangzhou', lon: 116.4, lat: 39.9, note: 'Baidu, DeepSeek, Alibaba Qwen' },
      { name: 'Taiwan', lon: 121, lat: 23.7, note: 'TSMC fabricates nearly every leading AI chip' },
      { name: 'Brussels', lon: 4.35, lat: 50.85, note: 'EU AI Act (2024)—first comprehensive AI law' },
      { name: 'Bangalore & Hyderabad', lon: 78.4, lat: 15, note: 'Global capability centres; UPI at 15 billion payments/month' },
      { name: 'Abu Dhabi & Riyadh', lon: 50, lat: 24.5, note: 'Sovereign AI compute and Falcon models' },
      { name: 'Paris', lon: 2.35, lat: 48.85, note: 'Mistral; Hugging Face open-model hub' },
    ],
    breakthroughs: ['AlexNet (2012), ResNet (2015), AlphaGo (2016)', 'Transformers (2017) → GPT, BERT, LLaMA', 'AlphaFold solves protein folding (2020)', 'mRNA vaccines (2020)', 'ChatGPT (2022), GPT-4 and multimodal models (2023)', 'Coding agents and agentic workflows (2024–26)', 'Solar and batteries become the cheapest energy in history'],
    challenges: [
      { problem: 'A global pandemic (COVID-19)', solution: 'mRNA vaccine platforms designed in days, deployed in months; remote work at planetary scale' },
      { problem: 'Models that hallucinate, leak data or can be jailbroken', solution: 'RLHF and constitutional training, evals and red-teaming, retrieval grounding, and AI governance frameworks (NIST AI RMF, EU AI Act)' },
      { problem: 'Deepfakes and synthetic misinformation', solution: 'Content provenance standards (C2PA), watermarking, and platform labelling' },
      { problem: 'Compute and energy concentrated in a few firms and nations', solution: 'Open-weight models, sovereign compute programmes, efficient inference, and renewable-powered data centres' },
      { problem: 'Work being reshaped faster than institutions adapt', solution: 'Human-in-the-loop design, reskilling, and agents that amplify rather than replace judgement' },
      { problem: 'Climate change accelerating', solution: 'Solar, wind and storage undercutting fossil fuels; AI-driven grid optimisation, weather forecasting and materials discovery' },
    ],
    lights: 1,
    sprawl: 1,
  },
]
