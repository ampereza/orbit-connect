export interface CountryFee {
  value: string;
  label: string;
  name: string;
  flag: string;
  fee: string;
  currency: string;
  displayFee: string;
}

export const applicationFees: CountryFee[] = [
  { value: "uganda", label: "Uganda 🇺🇬", name: "Uganda", flag: "🇺🇬", fee: "50000", currency: "UGX", displayFee: "UGX 50,000" },
  { value: "kenya", label: "Kenya 🇰🇪", name: "Kenya", flag: "🇰🇪", fee: "1750", currency: "KES", displayFee: "KES 1,750" },
  { value: "tanzania", label: "Tanzania 🇹🇿", name: "Tanzania", flag: "🇹🇿", fee: "35000", currency: "TZS", displayFee: "TZS 35,000" },
  { value: "rwanda", label: "Rwanda 🇷🇼", name: "Rwanda", flag: "🇷🇼", fee: "17500", currency: "RWF", displayFee: "RWF 17,500" },
  { value: "burundi", label: "Burundi 🇧🇮", name: "Burundi", flag: "🇧🇮", fee: "35000", currency: "BIF", displayFee: "BIF 35,000" },
];

// Subset of countries displayed in the eligibility section
export const eligibilityCountries = applicationFees.slice(0, 3);
