import type { CityLight } from '../globe/surface'

interface City extends CityLight {
  /** Index into humanAges from which the city glows. */
  from: number
}

/* Weight ≈ present-day brightness; `from` is the first age in which the
 * place is a significant settlement. Radii are angular degrees. */
const cities: City[] = [
  // Ancient cores
  { lon: 44.4, lat: 33.3, weight: 0.5, radius: 2.4, from: 1 }, // Baghdad / Babylon
  { lon: 31.2, lat: 30.05, weight: 0.8, radius: 2.6, from: 1 }, // Cairo
  { lon: 68.4, lat: 27.3, weight: 0.4, radius: 2.4, from: 1 }, // Indus
  { lon: 112.5, lat: 34.7, weight: 0.5, radius: 2.4, from: 1 }, // Luoyang
  { lon: 116.4, lat: 39.9, weight: 0.95, radius: 3, from: 1 }, // Beijing
  { lon: 118.8, lat: 32, weight: 0.7, radius: 2.5, from: 1 }, // Nanjing
  { lon: 12.5, lat: 41.9, weight: 0.6, radius: 2.4, from: 1 }, // Rome
  { lon: 23.7, lat: 38, weight: 0.5, radius: 2, from: 1 }, // Athens
  { lon: 29, lat: 41, weight: 0.85, radius: 2.6, from: 1 }, // Istanbul
  { lon: 51.4, lat: 35.7, weight: 0.7, radius: 2.4, from: 1 }, // Tehran / Persia
  { lon: 77.2, lat: 28.6, weight: 0.95, radius: 3, from: 1 }, // Delhi
  { lon: 83, lat: 25.3, weight: 0.5, radius: 2.2, from: 1 }, // Varanasi
  { lon: 72.9, lat: 19.1, weight: 0.9, radius: 2.6, from: 1 }, // Mumbai
  { lon: -99.1, lat: 19.4, weight: 0.85, radius: 2.8, from: 1 }, // Mexico City
  { lon: -89.6, lat: 20.9, weight: 0.35, radius: 1.8, from: 1 }, // Yucatán
  { lon: -77, lat: -12, weight: 0.65, radius: 2.2, from: 1 }, // Lima / Andes
  { lon: -72, lat: -13.5, weight: 0.3, radius: 1.6, from: 1 }, // Cusco
  { lon: 39.8, lat: 21.4, weight: 0.5, radius: 2, from: 1 }, // Mecca
  { lon: -3, lat: 16.8, weight: 0.25, radius: 1.6, from: 1 }, // Timbuktu
  { lon: 35.2, lat: 31.8, weight: 0.5, radius: 1.8, from: 1 }, // Jerusalem
  { lon: 135.5, lat: 34.7, weight: 0.9, radius: 2.6, from: 1 }, // Osaka / Kyoto
  { lon: 139.7, lat: 35.7, weight: 1, radius: 3, from: 1 }, // Tokyo
  { lon: 127, lat: 37.5, weight: 0.85, radius: 2.4, from: 1 }, // Seoul
  { lon: 106.7, lat: 10.8, weight: 0.6, radius: 2.2, from: 1 }, // Saigon
  { lon: 100.5, lat: 13.7, weight: 0.7, radius: 2.4, from: 1 }, // Bangkok
  { lon: 106.8, lat: -6.2, weight: 0.8, radius: 2.6, from: 1 }, // Jakarta
  { lon: -74, lat: 4.7, weight: 0.5, radius: 2, from: 1 }, // Bogotá
  { lon: 38.7, lat: 9, weight: 0.45, radius: 2, from: 1 }, // Addis Ababa
  { lon: 2.35, lat: 48.85, weight: 0.85, radius: 2.6, from: 1 }, // Paris
  { lon: -0.1, lat: 51.5, weight: 0.9, radius: 2.6, from: 1 }, // London
  { lon: -3.7, lat: 40.4, weight: 0.6, radius: 2.2, from: 1 }, // Madrid
  { lon: 37.6, lat: 55.7, weight: 0.85, radius: 2.8, from: 1 }, // Moscow
  { lon: 30.5, lat: 50.45, weight: 0.5, radius: 2, from: 1 }, // Kyiv
  { lon: 4.9, lat: 52.4, weight: 0.65, radius: 2, from: 1 }, // Amsterdam / Rhine
  { lon: 88.4, lat: 22.6, weight: 0.8, radius: 2.4, from: 1 }, // Kolkata
  { lon: 80.3, lat: 13.1, weight: 0.7, radius: 2.2, from: 1 }, // Chennai
  { lon: 67, lat: 24.9, weight: 0.8, radius: 2.4, from: 1 }, // Karachi
  { lon: 90.4, lat: 23.8, weight: 0.8, radius: 2.4, from: 1 }, // Dhaka
  { lon: 121.5, lat: 31.2, weight: 0.95, radius: 2.8, from: 1 }, // Shanghai
  { lon: 113.3, lat: 23.1, weight: 0.95, radius: 3, from: 1 }, // Guangzhou / PRD
  { lon: 104.1, lat: 30.7, weight: 0.7, radius: 2.4, from: 1 }, // Chengdu
  { lon: 108.9, lat: 34.3, weight: 0.5, radius: 2, from: 1 }, // Xi'an
  { lon: 3.4, lat: 6.5, weight: 0.8, radius: 2.4, from: 1 }, // Lagos region (Ife/Benin)
  { lon: 32.6, lat: 15.6, weight: 0.4, radius: 1.8, from: 1 }, // Khartoum / Kush
  { lon: 47, lat: 30, weight: 0.5, radius: 1.8, from: 1 }, // Basra
  { lon: 58.4, lat: 23.6, weight: 0.4, radius: 1.6, from: 1 }, // Muscat
  { lon: 36.8, lat: -1.3, weight: 0.5, radius: 2, from: 2 }, // Nairobi
  // Industrial-era growth
  { lon: -74, lat: 40.7, weight: 1, radius: 3.2, from: 2 }, // New York
  { lon: -87.6, lat: 41.9, weight: 0.85, radius: 2.8, from: 2 }, // Chicago
  { lon: -75.2, lat: 39.9, weight: 0.7, radius: 2.4, from: 2 }, // Philadelphia
  { lon: -79.4, lat: 43.7, weight: 0.65, radius: 2.4, from: 2 }, // Toronto
  { lon: -83, lat: 42.3, weight: 0.6, radius: 2.2, from: 2 }, // Detroit
  { lon: -118.2, lat: 34, weight: 0.95, radius: 3, from: 2 }, // Los Angeles
  { lon: -122.4, lat: 37.7, weight: 0.85, radius: 2.6, from: 2 }, // Bay Area
  { lon: -95.4, lat: 29.8, weight: 0.7, radius: 2.4, from: 2 }, // Houston
  { lon: -80.2, lat: 25.8, weight: 0.65, radius: 2.2, from: 2 }, // Miami
  { lon: -43.2, lat: -22.9, weight: 0.8, radius: 2.4, from: 2 }, // Rio
  { lon: -46.6, lat: -23.5, weight: 0.9, radius: 2.8, from: 2 }, // São Paulo
  { lon: -58.4, lat: -34.6, weight: 0.8, radius: 2.4, from: 2 }, // Buenos Aires
  { lon: -70.7, lat: -33.4, weight: 0.5, radius: 2, from: 2 }, // Santiago
  { lon: 13.4, lat: 52.5, weight: 0.7, radius: 2.4, from: 2 }, // Berlin
  { lon: 7, lat: 51.4, weight: 0.85, radius: 2.6, from: 2 }, // Ruhr
  { lon: -2.2, lat: 53.5, weight: 0.75, radius: 2.4, from: 2 }, // Manchester
  { lon: 9.2, lat: 45.5, weight: 0.6, radius: 2.2, from: 2 }, // Milan
  { lon: 30.3, lat: 59.9, weight: 0.6, radius: 2.2, from: 2 }, // St Petersburg
  { lon: 18.1, lat: 59.3, weight: 0.4, radius: 1.8, from: 2 }, // Stockholm
  { lon: 28, lat: -26.2, weight: 0.7, radius: 2.4, from: 2 }, // Johannesburg
  { lon: 18.4, lat: -33.9, weight: 0.4, radius: 1.8, from: 2 }, // Cape Town
  { lon: 151.2, lat: -33.9, weight: 0.65, radius: 2.2, from: 2 }, // Sydney
  { lon: 145, lat: -37.8, weight: 0.6, radius: 2.2, from: 2 }, // Melbourne
  { lon: 174.8, lat: -36.9, weight: 0.35, radius: 1.6, from: 2 }, // Auckland
  { lon: 55.3, lat: 25.2, weight: 0.6, radius: 2, from: 2 }, // Dubai
  { lon: 46.7, lat: 24.7, weight: 0.6, radius: 2.2, from: 2 }, // Riyadh
  { lon: 103.8, lat: 1.3, weight: 0.6, radius: 1.8, from: 2 }, // Singapore
  { lon: 121, lat: 14.6, weight: 0.8, radius: 2.4, from: 2 }, // Manila
  { lon: 121.5, lat: 25, weight: 0.6, radius: 2, from: 2 }, // Taipei
  { lon: 82.9, lat: 55, weight: 0.4, radius: 1.8, from: 2 }, // Novosibirsk
  { lon: 76.9, lat: 43.2, weight: 0.3, radius: 1.6, from: 2 }, // Almaty
  { lon: 69.3, lat: 41.3, weight: 0.4, radius: 1.8, from: 2 }, // Tashkent
  { lon: 77.6, lat: 13, weight: 0.8, radius: 2.4, from: 3 }, // Bangalore
  { lon: 78.5, lat: 17.4, weight: 0.65, radius: 2.2, from: 3 }, // Hyderabad
  { lon: -122.3, lat: 47.6, weight: 0.7, radius: 2.2, from: 3 }, // Seattle
  { lon: 114.1, lat: 22.5, weight: 0.9, radius: 2.4, from: 4 }, // Shenzhen
  { lon: 120.2, lat: 30.3, weight: 0.7, radius: 2.2, from: 4 }, // Hangzhou
  { lon: 7, lat: 4.8, weight: 0.4, radius: 1.8, from: 4 }, // Niger delta
  { lon: 15.3, lat: -4.3, weight: 0.55, radius: 2.2, from: 4 }, // Kinshasa
  { lon: 32.6, lat: 0.3, weight: 0.3, radius: 1.6, from: 4 }, // Kampala
  { lon: -17.4, lat: 14.7, weight: 0.3, radius: 1.6, from: 4 }, // Dakar
  { lon: -7.6, lat: 33.6, weight: 0.45, radius: 2, from: 4 }, // Casablanca
  { lon: 36.8, lat: -1.3, weight: 0.5, radius: 2, from: 4 }, // Nairobi
  { lon: 39.3, lat: -6.8, weight: 0.4, radius: 1.8, from: 4 }, // Dar es Salaam
  { lon: 44.5, lat: 40.2, weight: 0.3, radius: 1.5, from: 4 }, // Caucasus
  { lon: -96.8, lat: 32.8, weight: 0.7, radius: 2.4, from: 4 }, // Dallas
  { lon: -84.4, lat: 33.7, weight: 0.65, radius: 2.2, from: 4 }, // Atlanta
  { lon: -112.1, lat: 33.4, weight: 0.5, radius: 2, from: 4 }, // Phoenix
  { lon: -104.9, lat: 39.7, weight: 0.45, radius: 2, from: 4 }, // Denver
  { lon: -123.1, lat: 49.3, weight: 0.45, radius: 1.8, from: 4 }, // Vancouver
  { lon: 106.9, lat: 47.9, weight: 0.2, radius: 1.4, from: 4 }, // Ulaanbaatar
  { lon: 96.2, lat: 16.8, weight: 0.4, radius: 1.8, from: 4 }, // Yangon
  { lon: 105.8, lat: 21, weight: 0.5, radius: 2, from: 4 }, // Hanoi
  { lon: 101.7, lat: 3.1, weight: 0.55, radius: 2, from: 4 }, // Kuala Lumpur
  { lon: 47.5, lat: -18.9, weight: 0.25, radius: 1.5, from: 4 }, // Antananarivo
  { lon: 25.2, lat: -17.8, weight: 0.15, radius: 1.3, from: 4 }, // Zambezi
  { lon: 50.6, lat: 26.2, weight: 0.4, radius: 1.5, from: 5 }, // Bahrain/Qatar
  { lon: 54.4, lat: 24.5, weight: 0.5, radius: 1.8, from: 5 }, // Abu Dhabi
  { lon: -66.9, lat: 10.5, weight: 0.45, radius: 2, from: 5 }, // Caracas
  { lon: -78.5, lat: -0.2, weight: 0.3, radius: 1.6, from: 5 }, // Quito
  { lon: -56.2, lat: -34.9, weight: 0.3, radius: 1.5, from: 5 }, // Montevideo
  { lon: -47.9, lat: -15.8, weight: 0.4, radius: 1.8, from: 5 }, // Brasília
  { lon: 91.1, lat: 29.6, weight: 0.1, radius: 1.2, from: 5 }, // Lhasa
  { lon: 87.6, lat: 43.8, weight: 0.3, radius: 1.6, from: 5 }, // Ürümqi
  { lon: 129.7, lat: 62, weight: 0.12, radius: 1.3, from: 5 }, // Yakutsk
  { lon: -21.9, lat: 64.1, weight: 0.15, radius: 1.2, from: 5 }, // Reykjavik
  { lon: -149.9, lat: 61.2, weight: 0.15, radius: 1.2, from: 5 }, // Anchorage
  { lon: -157.9, lat: 21.3, weight: 0.2, radius: 1.2, from: 5 }, // Honolulu
]

/** Lights visible in a given age, with brightness ramping in over the
 * following age so a settlement grows rather than blinks on. */
export function cityLightsForAge(ageIndex: number): CityLight[] {
  return cities
    .filter((c) => c.from <= ageIndex)
    .map(({ lon, lat, weight, radius, from }) => {
      const maturity = Math.min(1, (ageIndex - from + 1) / 2)
      return { lon, lat, weight: weight * maturity, radius: radius * (0.6 + 0.4 * maturity) }
    })
}
