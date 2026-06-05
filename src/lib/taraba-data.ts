export const TARABA_LGAS = [
  "Ardo-Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo",
  "Karim-Lamido", "Kurmi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari",
  "Yorro", "Zing",
] as const;

export type TarabaLGA = (typeof TARABA_LGAS)[number];

export const BUSINESS_CATEGORIES = {
  "Agriculture": ["Crop Farming", "Livestock", "Fisheries", "Poultry", "Horticulture"],
  "Agro-processing": ["Grain Milling", "Oil Extraction", "Dairy", "Packaged Foods", "Beverages"],
  "Mining": ["Solid Minerals", "Quarrying", "Artisanal Mining"],
  "Manufacturing": ["Textiles", "Construction Materials", "Metalwork", "Plastics", "Furniture"],
  "Entrepreneurship": ["Startups", "Tech / Digital", "Consulting", "Professional Services"],
  "Trade": ["Wholesale", "Retail", "Import/Export", "Distribution"],
  "Crafts": ["Weaving", "Pottery", "Leatherwork", "Woodwork", "Beadwork"],
  "Tourism": ["Hospitality", "Tour Operations", "Eco-Tourism", "Cultural Tourism"],
  "Creative Industries": ["Music", "Film & Photography", "Fashion", "Publishing", "Visual Arts"],
  "Other": ["Other"],
} as const;

export const CATEGORY_LIST = Object.keys(BUSINESS_CATEGORIES) as Array<keyof typeof BUSINESS_CATEGORIES>;

export const OWNERSHIP_TYPES = [
  "Sole Proprietorship", "Partnership", "Limited Liability", "Cooperative", "NGO/Social Enterprise",
] as const;

export const REGISTRATION_STATUSES = ["Registered (CAC)", "Informal/Unregistered", "In Progress"] as const;
export const OPERATIONAL_STATUSES = ["Active", "Seasonal", "Inactive"] as const;
export const EMPLOYEE_BUCKETS = ["1-5", "6-10", "11-50", "51-200", "200+"] as const;
export const MARKET_REACH = ["Local", "State-wide", "National", "International"] as const;
export const EXPORT_READINESS = ["Yes", "No", "Working Towards It"] as const;
export const COMMON_CERTIFICATIONS = ["NAFDAC", "SON", "ISO 9001", "ISO 22000", "HACCP", "Organic", "Halal"];

export const SECTOR_ICONS: Record<string, string> = {
  "Agriculture": "🌾",
  "Agro-processing": "🏭",
  "Mining": "⛏️",
  "Manufacturing": "🔧",
  "Entrepreneurship": "🚀",
  "Trade": "🏪",
  "Crafts": "🎨",
  "Tourism": "🏞️",
  "Creative Industries": "🎭",
  "Other": "📦",
};
