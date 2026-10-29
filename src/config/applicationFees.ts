export interface CountryFee {
  value: string;
  label: string;
  name: string;
  flag: string;
  fee: string;
  currency: string;
  displayFee: string;
}

// Flat fee of 10 connects for all applications
export const flatApplicationFee = {
  value: "connects",
  label: "Connects 🔗",
  name: "Connects",
  flag: "🔗",
  fee: "10",
  currency: "Connects",
  displayFee: "10 Connects",
};

// Countries displayed in the eligibility section (no longer have individual fees)
export const eligibilityCountries = [
  { value: "uganda", label: "Uganda 🇺🇬", name: "Uganda", flag: "🇺🇬" },
  { value: "kenya", label: "Kenya 🇰🇪", name: "Kenya", flag: "🇰🇪" },
  { value: "tanzania", label: "Tanzania 🇹🇿", name: "Tanzania", flag: "🇹🇿" },
  { value: "rwanda", label: "Rwanda 🇷🇼", name: "Rwanda", flag: "🇷🇼" },
  { value: "burundi", label: "Burundi 🇧🇮", name: "Burundi", flag: "🇧🇮" },
];
