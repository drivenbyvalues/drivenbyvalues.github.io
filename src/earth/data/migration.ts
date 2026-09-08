export interface Waypoint {
  id: string
  name: string
  lon: number
  lat: number
  /** Thousands of years ago when people are established here. */
  kya: number
  evidence: string
}

export interface Route {
  id: string
  from: string
  to: string
  /** Departure and arrival, thousands of years ago. */
  start: number
  end: number
  family: keyof typeof routeFamilies
}

export const routeFamilies = {
  africa: { color: '#fbbf24', label: 'Within Africa' },
  southern: { color: '#fb923c', label: 'Southern coastal route' },
  northern: { color: '#38bdf8', label: 'Into Eurasia' },
  americas: { color: '#f472b6', label: 'Into the Americas' },
  oceania: { color: '#4ade80', label: 'Across the Pacific' },
  voyages: { color: '#c084fc', label: 'Late seafaring' },
}

export const waypoints: Waypoint[] = [
  { id: 'eastAfrica', name: 'East Africa', lon: 36.5, lat: 3, kya: 300, evidence: 'Omo Kibish, Herto; Jebel Irhoud in Morocco at 315 kya' },
  { id: 'southAfrica', name: 'Southern Africa', lon: 24, lat: -30, kya: 170, evidence: 'Pinnacle Point and Blombos Cave: shellfish, ochre, engraving' },
  { id: 'westAfrica', name: 'West Africa', lon: -5, lat: 10, kya: 120, evidence: 'Deep genetic lineages; Iwo Eleru' },
  { id: 'levant', name: 'The Levant', lon: 35.3, lat: 32.5, kya: 120, evidence: 'Misliya (185 kya), Skhul and Qafzeh burials' },
  { id: 'arabia', name: 'Southern Arabia', lon: 50, lat: 17, kya: 70, evidence: 'Nubian Complex tools in Dhofar; Al Wusta finger bone (85 kya)' },
  { id: 'india', name: 'South Asia', lon: 78, lat: 18, kya: 62, evidence: 'Jwalapuram tools beneath and above Toba ash' },
  { id: 'sunda', name: 'Sundaland', lon: 106, lat: 2, kya: 55, evidence: 'Niah Cave, Borneo; Tam Pà Ling, Laos' },
  { id: 'australia', name: 'Sahul (Australia)', lon: 133, lat: -20, kya: 50, evidence: 'Madjedbebe rock shelter (up to 65 kya); Lake Mungo' },
  { id: 'europe', name: 'Europe', lon: 12, lat: 46, kya: 43, evidence: 'Bacho Kiro (45 kya), Grotta del Cavallo; Neanderthal contact' },
  { id: 'eastAsia', name: 'East Asia', lon: 112, lat: 34, kya: 42, evidence: 'Tianyuan Cave near Beijing (40 kya)' },
  { id: 'japan', name: 'Japan', lon: 138, lat: 36, kya: 36, evidence: 'Early Upper Palaeolithic sites; trapezoids and edge-ground axes' },
  { id: 'siberia', name: 'Arctic Siberia', lon: 135, lat: 66, kya: 31, evidence: 'Yana Rhinoceros Horn Site at 71°N (32 kya)' },
  { id: 'beringia', name: 'Beringia', lon: -165, lat: 64, kya: 22, evidence: 'Land bridge exposed by 120 m lower seas; Bluefish Caves' },
  { id: 'northAmerica', name: 'North America', lon: -100, lat: 40, kya: 15, evidence: 'White Sands footprints (21–23 kya) to Clovis (13 kya)' },
  { id: 'southAmerica', name: 'South America', lon: -60, lat: -15, kya: 13.5, evidence: 'Monte Verde, Chile (14.5 kya)' },
  { id: 'nearOceania', name: 'Near Oceania', lon: 152, lat: -5, kya: 3.3, evidence: 'Lapita pottery, Bismarck Archipelago' },
  { id: 'polynesia', name: 'Central Polynesia', lon: -172, lat: -14, kya: 2.8, evidence: 'Samoa and Tonga settled by Lapita voyagers' },
  { id: 'hawaii', name: 'Hawaiʻi', lon: -157, lat: 20.5, kya: 1, evidence: 'Radiocarbon dates cluster around 1000–1200 CE' },
  { id: 'rapaNui', name: 'Rapa Nui', lon: -109.4, lat: -27.1, kya: 0.85, evidence: 'Anakena settlement ~1200 CE' },
  { id: 'aotearoa', name: 'Aotearoa (New Zealand)', lon: 174, lat: -40, kya: 0.72, evidence: 'Wairau Bar; the last large landmass settled' },
  { id: 'madagascar', name: 'Madagascar', lon: 47, lat: -19, kya: 1.3, evidence: 'Austronesian outrigger crossing from Borneo' },
  { id: 'iceland', name: 'Iceland', lon: -19, lat: 65, kya: 1.15, evidence: 'Norse landnám ~870 CE' },
  { id: 'greenland', name: 'Greenland', lon: -45, lat: 64, kya: 1.04, evidence: 'Erik the Red, 985 CE; Thule Inuit arrive from the west' },
]

export const routes: Route[] = [
  { id: 'r-south-africa', from: 'eastAfrica', to: 'southAfrica', start: 220, end: 170, family: 'africa' },
  { id: 'r-west-africa', from: 'eastAfrica', to: 'westAfrica', start: 160, end: 120, family: 'africa' },
  { id: 'r-levant', from: 'eastAfrica', to: 'levant', start: 135, end: 120, family: 'africa' },
  { id: 'r-arabia', from: 'eastAfrica', to: 'arabia', start: 75, end: 70, family: 'southern' },
  { id: 'r-india', from: 'arabia', to: 'india', start: 68, end: 62, family: 'southern' },
  { id: 'r-sunda', from: 'india', to: 'sunda', start: 60, end: 55, family: 'southern' },
  { id: 'r-australia', from: 'sunda', to: 'australia', start: 54, end: 50, family: 'southern' },
  { id: 'r-europe', from: 'levant', to: 'europe', start: 47, end: 43, family: 'northern' },
  { id: 'r-east-asia', from: 'india', to: 'eastAsia', start: 48, end: 42, family: 'northern' },
  { id: 'r-japan', from: 'eastAsia', to: 'japan', start: 38, end: 36, family: 'northern' },
  { id: 'r-siberia', from: 'eastAsia', to: 'siberia', start: 35, end: 31, family: 'northern' },
  { id: 'r-beringia', from: 'siberia', to: 'beringia', start: 25, end: 22, family: 'americas' },
  { id: 'r-north-america', from: 'beringia', to: 'northAmerica', start: 17, end: 15, family: 'americas' },
  { id: 'r-south-america', from: 'northAmerica', to: 'southAmerica', start: 15, end: 13.5, family: 'americas' },
  { id: 'r-near-oceania', from: 'sunda', to: 'nearOceania', start: 3.6, end: 3.3, family: 'oceania' },
  { id: 'r-polynesia', from: 'nearOceania', to: 'polynesia', start: 3.2, end: 2.8, family: 'oceania' },
  { id: 'r-hawaii', from: 'polynesia', to: 'hawaii', start: 1.1, end: 1, family: 'oceania' },
  { id: 'r-rapa-nui', from: 'polynesia', to: 'rapaNui', start: 0.95, end: 0.85, family: 'oceania' },
  { id: 'r-aotearoa', from: 'polynesia', to: 'aotearoa', start: 0.78, end: 0.72, family: 'oceania' },
  { id: 'r-madagascar', from: 'sunda', to: 'madagascar', start: 1.5, end: 1.3, family: 'voyages' },
  { id: 'r-iceland', from: 'europe', to: 'iceland', start: 1.2, end: 1.15, family: 'voyages' },
  { id: 'r-greenland', from: 'iceland', to: 'greenland', start: 1.1, end: 1.04, family: 'voyages' },
]

export const migrationChapters = [
  { kya: 300, title: 'Origins in Africa', text: 'Homo sapiens emerges across Africa—from Jebel Irhoud in Morocco to Omo Kibish in Ethiopia—as a network of populations exchanging genes and ideas for over 200,000 years.' },
  { kya: 120, title: 'First steps out', text: 'During wet phases of the Sahara and Arabia, people reach the Levant. These early ventures largely fade; the lasting exodus comes later.' },
  { kya: 70, title: 'The southern route', text: 'A small founding population crosses the Bab-el-Mandeb into Arabia and follows the coasts to India and Sundaland within ~15,000 years.' },
  { kya: 50, title: 'Reaching Sahul', text: 'Open-water crossings of at least 90 km bring people to Australia and New Guinea—the first deliberate seafaring in human history.' },
  { kya: 43, title: 'Into Europe and East Asia', text: 'Modern humans meet Neanderthals in Europe and Denisovans in Asia; today every non-African carries ~2% Neanderthal DNA.' },
  { kya: 30, title: 'The Arctic frontier', text: 'Mammoth-steppe hunters live above the Arctic Circle in Siberia—tailored clothing and sewn shelters make this possible.' },
  { kya: 16, title: 'The Americas', text: 'As ice sheets retreat, people move from Beringia down the Pacific coast and through an ice-free corridor, reaching Chile by 14,500 years ago.' },
  { kya: 3.3, title: 'Lapita and the Pacific', text: 'Austronesian voyagers with double-hulled canoes and star navigation settle the remote Pacific from the Bismarcks to Samoa.' },
  { kya: 1, title: 'The last landfalls', text: 'Hawaiʻi, Rapa Nui, Madagascar, Iceland and finally Aotearoa (~1280 CE): humans now inhabit every continent but Antarctica.' },
]

export function formatKya(kya: number) {
  if (kya >= 1) return `${(Math.round(kya * 10) * 100).toLocaleString('en-US')} years ago`
  const year = Math.round(2026 - kya * 1000)
  return `${year} CE`
}
