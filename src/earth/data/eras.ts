export interface Era {
  id: string
  name: string
  /** Start / end in millions of years ago. */
  start: number
  end: number
  accent: string
  tagline: string
  world: string
  atmosphere: string
  life: string
  events: Array<{ ma: number; label: string }>
}

export const eras: Era[] = [
  {
    id: 'hadean',
    name: 'Hadean',
    start: 4540,
    end: 4000,
    accent: '#ff6a2a',
    tagline: 'A molten world forges its Moon',
    world:
      'Earth accretes from the solar nebula and is struck by the Mars-sized Theia. The debris coalesces into the Moon while the surface is a global magma ocean. Within a few hundred million years a basaltic crust cools and the first oceans condense from a steam atmosphere—zircons from Jack Hills, Australia, record liquid water by 4.4 billion years ago.',
    atmosphere: 'Steam, carbon dioxide, nitrogen and sulphur gases; no free oxygen. Skies glow red under a haze of volcanic ash.',
    life: 'None known. Chemistry that would lead to life may already be underway in hydrothermal vents.',
    events: [
      { ma: 4540, label: 'Earth accretes' },
      { ma: 4500, label: 'Theia impact forms the Moon' },
      { ma: 4400, label: 'Crust cools, first oceans' },
      { ma: 4100, label: 'Late Heavy Bombardment begins' },
    ],
  },
  {
    id: 'archean',
    name: 'Archean',
    start: 4000,
    end: 2500,
    accent: '#f2a341',
    tagline: 'Green seas, orange skies, and the first life',
    world:
      'Small granite cratons—Vaalbara, Ur, Kenorland—rise above a planet-wide ocean rich in dissolved iron. Plate tectonics is starting: hotter mantle, faster plates, and volcanic island arcs everywhere. The oldest surviving rocks (Acasta Gneiss, 4.03 Ga) and the oldest continental fragments date from now.',
    atmosphere: 'Methane-rich and oxygen-free, tinted orange by organic haze. The faint young Sun is offset by a strong greenhouse.',
    life: 'Microbial life appears by 3.7–3.5 Ga. Stromatolite reefs built by cyanobacteria begin quietly releasing oxygen.',
    events: [
      { ma: 4030, label: 'Oldest rocks (Acasta Gneiss)' },
      { ma: 3700, label: 'Earliest evidence of life' },
      { ma: 3480, label: 'Stromatolites, Pilbara' },
      { ma: 2700, label: 'Kenorland supercontinent' },
    ],
  },
  {
    id: 'proterozoic',
    name: 'Proterozoic',
    start: 2500,
    end: 541,
    accent: '#c084fc',
    tagline: 'Oxygen, red continents, and Snowball Earth',
    world:
      'Continents grow to near-modern volume and repeatedly assemble into supercontinents—Columbia, then Rodinia, then Pannotia. Iron rusts out of the oceans and onto land as red beds. Twice the planet freezes almost to the equator, then rebounds in a hot volcanic-CO₂ greenhouse.',
    atmosphere: 'The Great Oxidation Event (~2.4 Ga) destroys the methane haze and turns the sky blue. Oxygen stays low until a second rise near the end of the era.',
    life: 'Eukaryotic cells (~1.8 Ga), sexual reproduction, multicellular algae, and finally the soft-bodied Ediacaran animals at ~575 Ma.',
    events: [
      { ma: 2400, label: 'Great Oxidation Event' },
      { ma: 2300, label: 'Huronian glaciation' },
      { ma: 1800, label: 'Columbia (Nuna) assembles; eukaryotes' },
      { ma: 1100, label: 'Rodinia assembles' },
      { ma: 717, label: 'Sturtian Snowball Earth' },
      { ma: 635, label: 'Marinoan Snowball ends' },
      { ma: 575, label: 'Ediacaran animals' },
    ],
  },
  {
    id: 'paleozoic',
    name: 'Paleozoic',
    start: 541,
    end: 252,
    accent: '#34d399',
    tagline: 'Life explodes, then paints the land green',
    world:
      'Gondwana drifts over the south pole while Laurentia and Baltica collide to build the Appalachians and Caledonides. By 300 Ma everything fuses into Pangaea, ringed by the Panthalassa ocean. The supercontinent remakes the climate: a vast arid interior, mega-monsoons on the Tethys coasts, and reef complexes hundreds of kilometres long in the shallow seas of what is now Texas.',
    atmosphere: 'Oxygen climbs past 30% in the Carboniferous coal swamps, then falls as Pangaea dries. At the very end, the Siberian Traps pump out CO₂ and sulphur for tens of thousands of years—warming the oceans ~10 °C and stripping them of oxygen.',
    life: 'The Cambrian explosion, fish, the first land plants (~470 Ma), forests and tetrapods (~370 Ma). On Pangaea, our own synapsid lineage rises: Dimetrodon, the first herbivorous vertebrates, then tusked dicynodonts and the cynodonts that lead to mammals. The Great Dying at 252 Ma erases more than 80% of species.',
    events: [
      { ma: 538, label: 'Cambrian explosion' },
      { ma: 470, label: 'First land plants' },
      { ma: 445, label: 'End-Ordovician extinction' },
      { ma: 370, label: 'Forests and tetrapods' },
      { ma: 335, label: 'Pangaea assembles' },
      { ma: 295, label: 'Dimetrodon and the first herbivores' },
      { ma: 268, label: 'Giant reefs; dicynodonts and gorgonopsians' },
      { ma: 260, label: 'Capitanian extinction' },
      { ma: 252, label: 'The Great Dying (Siberian Traps)' },
    ],
  },
  {
    id: 'mesozoic',
    name: 'Mesozoic',
    start: 252,
    end: 66,
    accent: '#22c55e',
    tagline: 'Pangaea breaks apart under the dinosaurs',
    world:
      'The Triassic opens on a devastated Pangaea: for ~5 million years the survivors—Lystrosaurus above all—dominate a hot, low-diversity world before new ecosystems appear. Pangaea then rifts along what becomes the Atlantic (~200 Ma). India tears free of Antarctica and races north; Africa and South America unzip. Sea levels are 100–250 m higher and there is no polar ice at all.',
    atmosphere: 'Warm greenhouse with CO₂ several times today’s level; oxygen dips then recovers.',
    life: 'From the ashes of the Great Dying, the age of reptiles begins: archosaurs, then dinosaurs (~230 Ma), pterosaurs, ichthyosaurs and plesiosaurs. Flowering plants (~130 Ma) rewrite ecosystems. Small mammals—the cynodonts’ heirs—and birds wait in the wings. The Chicxulub impact ends the era.',
    events: [
      { ma: 247, label: 'Lystrosaurus world; recovery begins' },
      { ma: 230, label: 'First dinosaurs' },
      { ma: 200, label: 'Pangaea starts to rift' },
      { ma: 150, label: 'Archaeopteryx; Atlantic opens' },
      { ma: 130, label: 'Flowering plants' },
      { ma: 66, label: 'Chicxulub impact' },
    ],
  },
  {
    id: 'cenozoic',
    name: 'Cenozoic',
    start: 66,
    end: 0,
    accent: '#60a5fa',
    tagline: 'Mountains, ice ages, and the arrival of humans',
    world:
      'India slams into Asia (~50 Ma) and raises the Himalaya. Antarctica isolates, glaciates (~34 Ma) and the planet cools step by step. Grasslands spread. From 2.6 Ma, ice sheets advance and retreat every ~100,000 years, dropping sea level by 120 m and exposing land bridges that humans will cross.',
    atmosphere: 'CO₂ declines from ~1000 ppm to under 300 ppm before the industrial era, then rises sharply after 1850.',
    life: 'Mammals radiate: whales, horses, primates. Hominins split from chimpanzees ~7 Ma; Homo erectus leaves Africa ~1.9 Ma; Homo sapiens appears ~300,000 years ago.',
    events: [
      { ma: 56, label: 'Paleocene–Eocene thermal maximum' },
      { ma: 50, label: 'India collides with Asia' },
      { ma: 34, label: 'Antarctic ice sheet forms' },
      { ma: 7, label: 'Hominins diverge' },
      { ma: 2.6, label: 'Quaternary ice ages begin' },
      { ma: 0.3, label: 'Homo sapiens' },
    ],
  },
]

export interface Spotlight {
  /** Shown while the scrubber sits inside [from, to] Ma. */
  from: number
  to: number
  title: string
  text: string
  accent: string
}

export const spotlights: Spotlight[] = [
  {
    from: 299,
    to: 253,
    title: 'Life on Pangaea',
    text: 'One landmass, one ocean. The interior bakes as a desert larger than any today, while mega-monsoons drench the Tethys coasts. Reefs stretch for hundreds of kilometres over shallow shelves, and on land the synapsids—Dimetrodon, tusked dicynodonts, sabre-toothed gorgonopsians—preview traits that mammals will inherit.',
    accent: '#f59e0b',
  },
  {
    from: 253,
    to: 246,
    title: 'The Great Dying',
    text: 'The Siberian Traps erupt through coal beds for ~60,000 years. CO₂ soars, oceans warm ~10 °C, acidify and lose their oxygen; forests collapse and soils wash into the sea. More than 80% of species vanish—the closest life has come to ending. The survivors, led by the pig-sized Lystrosaurus, inherit an empty world in which the age of reptiles will begin.',
    accent: '#ef4444',
  },
  {
    from: 66.5,
    to: 63,
    title: 'Chicxulub',
    text: 'A 10 km asteroid strikes the Yucatán shelf. Ejecta re-enters as a global heat pulse, then soot and sulphate darken the sky for years. Three quarters of species—including all non-avian dinosaurs—are lost; mammals and birds radiate into the gap.',
    accent: '#94a3b8',
  },
  {
    from: 720,
    to: 633,
    title: 'Snowball Earth',
    text: 'Ice reaches the tropics, and only a slushy equatorial belt may stay open. Volcanic CO₂ accumulates for millions of years beneath the frozen lid until a runaway greenhouse melts it within a few thousand years—likely twice.',
    accent: '#c084fc',
  },
]

export function spotlightAt(ma: number) {
  return spotlights.find((s) => ma <= s.from && ma >= s.to)
}

/* Non-linear scrubber: 4.54 Ga of history but most of the story is recent,
 * so give each stretch a share of the track proportional to how much happens
 * in it rather than to elapsed time. */
const segments: Array<[number, number, number]> = [
  // [track position, Ma, unused]
  [0, 4540, 0],
  [0.16, 4000, 0],
  [0.34, 2500, 0],
  [0.55, 541, 0],
  [0.72, 252, 0],
  [0.86, 66, 0],
  [1, 0, 0],
]

export function trackToMa(t: number) {
  const x = Math.min(1, Math.max(0, t))
  for (let i = 0; i < segments.length - 1; i++) {
    const [t0, ma0] = segments[i]
    const [t1, ma1] = segments[i + 1]
    if (x >= t0 && x <= t1) return ma0 + ((x - t0) / (t1 - t0)) * (ma1 - ma0)
  }
  return 0
}

export function maToTrack(ma: number) {
  const m = Math.min(4540, Math.max(0, ma))
  for (let i = 0; i < segments.length - 1; i++) {
    const [t0, ma0] = segments[i]
    const [t1, ma1] = segments[i + 1]
    if (m <= ma0 && m >= ma1) return t0 + ((ma0 - m) / (ma0 - ma1)) * (t1 - t0)
  }
  return 1
}

export function eraAt(ma: number) {
  return eras.find((e) => ma <= e.start && ma > e.end) ?? eras[eras.length - 1]
}

export function formatMa(ma: number) {
  if (ma >= 1000) return `${(ma / 1000).toFixed(2)} billion years ago`
  if (ma >= 1) return `${ma.toFixed(ma < 10 ? 1 : 0)} million years ago`
  if (ma >= 0.001) return `${Math.round(ma * 1000000).toLocaleString('en-US')} years ago`
  return 'Today'
}

export function formatMaShort(ma: number) {
  if (ma >= 1000) return `${(ma / 1000).toFixed(2)} Ga`
  if (ma >= 1) return `${ma.toFixed(ma < 10 ? 1 : 0)} Ma`
  if (ma >= 0.001) return `${Math.round(ma * 1000)} kya`
  return 'Today'
}
