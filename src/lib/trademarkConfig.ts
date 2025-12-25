/**
 * Trademark Offices Configuration
 * 
 * Organized by region for scalable country management.
 * Each office includes search URL generator for trademark lookups.
 */

export interface TrademarkOffice {
  countryCode: string;
  country: string;
  flag: string;
  office: string;
  fullName: string;
  searchUrl: (brandName: string) => string;
  priority?: boolean; // Show by default in region
}

export interface TrademarkRegion {
  id: string;
  name: string;
  icon: string;
  offices: TrademarkOffice[];
}

// Region configurations with offices
export const TRADEMARK_REGIONS: TrademarkRegion[] = [
  {
    id: "americas",
    name: "Americas",
    icon: "🌎",
    offices: [
      { countryCode: "US", country: "United States", flag: "🇺🇸", office: "USPTO", fullName: "United States Patent and Trademark Office", searchUrl: () => `https://www.uspto.gov/trademarks/search`, priority: true },
      { countryCode: "CA", country: "Canada", flag: "🇨🇦", office: "CIPO", fullName: "Canadian Intellectual Property Office", searchUrl: () => `https://ised-isde.canada.ca/cipo/trademark-search/srch?lang=eng`, priority: true },
      { countryCode: "MX", country: "Mexico", flag: "🇲🇽", office: "IMPI", fullName: "Mexican Institute of Industrial Property", searchUrl: () => `https://marcia.impi.gob.mx/` },
      { countryCode: "BR", country: "Brazil", flag: "🇧🇷", office: "INPI", fullName: "National Institute of Industrial Property", searchUrl: () => `https://busca.inpi.gov.br/pePI/` },
      { countryCode: "AR", country: "Argentina", flag: "🇦🇷", office: "INPI", fullName: "National Institute of Industrial Property", searchUrl: () => `https://portaltramites.inpi.gob.ar/` },
      { countryCode: "CO", country: "Colombia", flag: "🇨🇴", office: "SIC", fullName: "Superintendence of Industry and Commerce", searchUrl: () => `https://sipi.sic.gov.co/` },
    ]
  },
  {
    id: "europe",
    name: "Europe",
    icon: "🌍",
    offices: [
      { countryCode: "EU", country: "European Union", flag: "🇪🇺", office: "EUIPO", fullName: "European Union Intellectual Property Office", searchUrl: () => `https://euipo.europa.eu/eSearch/`, priority: true },
      { countryCode: "GB", country: "United Kingdom", flag: "🇬🇧", office: "UKIPO", fullName: "UK Intellectual Property Office", searchUrl: () => `https://www.gov.uk/search-for-trademark`, priority: true },
      { countryCode: "DE", country: "Germany", flag: "🇩🇪", office: "DPMA", fullName: "German Patent and Trade Mark Office", searchUrl: () => `https://www.dpma.de/english/trade_marks/trade_mark_search/index.html` },
      { countryCode: "FR", country: "France", flag: "🇫🇷", office: "INPI", fullName: "National Institute of Industrial Property", searchUrl: () => `https://data.inpi.fr/recherche_avancee/marques` },
      { countryCode: "NL", country: "Netherlands", flag: "🇳🇱", office: "BOIP", fullName: "Benelux Office for Intellectual Property", searchUrl: () => `https://www.boip.int/en/trademarks-register` },
      { countryCode: "ES", country: "Spain", flag: "🇪🇸", office: "OEPM", fullName: "Spanish Patent and Trademark Office", searchUrl: () => `https://www.oepm.es/es/signos_distintivos/` },
      { countryCode: "IT", country: "Italy", flag: "🇮🇹", office: "UIBM", fullName: "Italian Patent and Trademark Office", searchUrl: () => `https://www.uibm.gov.it/bancadati/` },
      { countryCode: "CH", country: "Switzerland", flag: "🇨🇭", office: "IGE", fullName: "Swiss Federal Institute of Intellectual Property", searchUrl: () => `https://www.swissreg.ch/` },
    ]
  },
  {
    id: "africa",
    name: "Africa",
    icon: "🌍",
    offices: [
      { countryCode: "NG", country: "Nigeria", flag: "🇳🇬", office: "IPO Nigeria", fullName: "Intellectual Property Office Nigeria", searchUrl: () => `https://iponigeria.com/`, priority: true },
      { countryCode: "ZA", country: "South Africa", flag: "🇿🇦", office: "CIPC", fullName: "Companies and Intellectual Property Commission", searchUrl: () => `https://iponline.cipc.co.za/`, priority: true },
      { countryCode: "KE", country: "Kenya", flag: "🇰🇪", office: "KIPI", fullName: "Kenya Industrial Property Institute", searchUrl: () => `https://www.kipi.go.ke/`, priority: true },
      { countryCode: "GH", country: "Ghana", flag: "🇬🇭", office: "RGD", fullName: "Registrar-General's Department", searchUrl: () => `https://rgd.gov.gh/Industrial%20Property.html` },
      { countryCode: "EG", country: "Egypt", flag: "🇪🇬", office: "ITDA", fullName: "Internal Trade Development Authority", searchUrl: () => `https://www.itda.gov.eg/` },
      { countryCode: "MA", country: "Morocco", flag: "🇲🇦", office: "OMPIC", fullName: "Moroccan Office of Industrial and Commercial Property", searchUrl: () => `https://www.ompic.ma/` },
      { countryCode: "TZ", country: "Tanzania", flag: "🇹🇿", office: "BRELA", fullName: "Business Registrations and Licensing Agency", searchUrl: () => `https://www.brela.go.tz/` },
      { countryCode: "RW", country: "Rwanda", flag: "🇷🇼", office: "RDB", fullName: "Rwanda Development Board", searchUrl: () => `https://www.rdb.rw/` },
    ]
  },
  {
    id: "asia-pacific",
    name: "Asia-Pacific",
    icon: "🌏",
    offices: [
      { countryCode: "CN", country: "China", flag: "🇨🇳", office: "CNIPA", fullName: "China National Intellectual Property Administration", searchUrl: () => `https://english.cnipa.gov.cn/col/col2996/index.html`, priority: true },
      { countryCode: "JP", country: "Japan", flag: "🇯🇵", office: "JPO", fullName: "Japan Patent Office", searchUrl: () => `https://www.j-platpat.inpit.go.jp/`, priority: true },
      { countryCode: "IN", country: "India", flag: "🇮🇳", office: "IPO India", fullName: "Intellectual Property India", searchUrl: () => `https://tmrsearch.ipindia.gov.in/tmrpublicsearch/`, priority: true },
      { countryCode: "AU", country: "Australia", flag: "🇦🇺", office: "IP Australia", fullName: "IP Australia", searchUrl: () => `https://www.ipaustralia.gov.au/trade-marks/search-existing-trade-marks`, priority: true },
      { countryCode: "KR", country: "South Korea", flag: "🇰🇷", office: "KIPO", fullName: "Korean Intellectual Property Office", searchUrl: () => `https://www.kipris.or.kr/` },
      { countryCode: "SG", country: "Singapore", flag: "🇸🇬", office: "IPOS", fullName: "Intellectual Property Office of Singapore", searchUrl: () => `https://www.ipos.gov.sg/` },
      { countryCode: "NZ", country: "New Zealand", flag: "🇳🇿", office: "IPONZ", fullName: "Intellectual Property Office of New Zealand", searchUrl: () => `https://www.iponz.govt.nz/` },
      { countryCode: "PH", country: "Philippines", flag: "🇵🇭", office: "IPOPHL", fullName: "Intellectual Property Office of the Philippines", searchUrl: () => `https://www.ipophil.gov.ph/` },
      { countryCode: "ID", country: "Indonesia", flag: "🇮🇩", office: "DGIP", fullName: "Directorate General of Intellectual Property", searchUrl: () => `https://pdki-indonesia.dgip.go.id/` },
      { countryCode: "AE", country: "UAE", flag: "🇦🇪", office: "MOE", fullName: "Ministry of Economy", searchUrl: () => `https://www.economy.gov.ae/` },
    ]
  },
  {
    id: "international",
    name: "International",
    icon: "🌐",
    offices: [
      { countryCode: "WIPO", country: "International (WIPO)", flag: "🌐", office: "WIPO", fullName: "World Intellectual Property Organization", searchUrl: () => `https://branddb.wipo.int/`, priority: true },
      { countryCode: "OAPI", country: "OAPI (17 African Countries)", flag: "🌍", office: "OAPI", fullName: "African Intellectual Property Organization", searchUrl: () => `https://www.oapi.int/` },
      { countryCode: "ARIPO", country: "ARIPO (22 African Countries)", flag: "🌍", office: "ARIPO", fullName: "African Regional Intellectual Property Organization", searchUrl: () => `https://www.aripo.org/` },
    ]
  }
];

// Helper to get all offices as flat array
export const getAllOffices = (): TrademarkOffice[] => {
  return TRADEMARK_REGIONS.flatMap(r => r.offices);
};

// Helper to get priority offices (shown by default)
export const getPriorityOffices = (): TrademarkOffice[] => {
  return TRADEMARK_REGIONS.flatMap(r => r.offices.filter(o => o.priority));
};

// Helper to get offices by region
export const getOfficesByRegion = (regionId: string): TrademarkOffice[] => {
  return TRADEMARK_REGIONS.find(r => r.id === regionId)?.offices || [];
};

// Helper to search offices
export const searchOffices = (query: string): TrademarkOffice[] => {
  const q = query.toLowerCase();
  return getAllOffices().filter(o => 
    o.country.toLowerCase().includes(q) ||
    o.countryCode.toLowerCase().includes(q) ||
    o.office.toLowerCase().includes(q)
  );
};

// Total count
export const getTotalCountries = (): number => getAllOffices().length;

