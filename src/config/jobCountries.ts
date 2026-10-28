export interface JobCountry {
  value: string;
  label: string;
  flag: string;
}

/**
 * Destination countries used when posting or filtering jobs. Values match the
 * country names already stored on existing jobs so filters and flags stay
 * consistent with seeded data.
 */
export const jobCountries: JobCountry[] = [
  { value: 'Saudi Arabia', label: 'Saudi Arabia', flag: '🇸🇦' },
  { value: 'UAE', label: 'United Arab Emirates', flag: '🇦🇪' },
  { value: 'Qatar', label: 'Qatar', flag: '🇶🇦' },
  { value: 'Kuwait', label: 'Kuwait', flag: '🇰🇼' },
  { value: 'Oman', label: 'Oman', flag: '🇴🇲' },
  { value: 'Bahrain', label: 'Bahrain', flag: '🇧🇭' },
  { value: 'Canada', label: 'Canada', flag: '🇨🇦' },
  { value: 'USA', label: 'United States', flag: '🇺🇸' },
  { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'Netherlands', label: 'Netherlands', flag: '🇳🇱' },
  { value: 'Poland', label: 'Poland', flag: '🇵🇱' },
  { value: 'Spain', label: 'Spain', flag: '🇪🇸' },
  { value: 'Portugal', label: 'Portugal', flag: '🇵🇹' },
  { value: 'Ireland', label: 'Ireland', flag: '🇮🇪' },
  { value: 'Sweden', label: 'Sweden', flag: '🇸🇪' },
  { value: 'Norway', label: 'Norway', flag: '🇳🇴' },
  { value: 'Denmark', label: 'Denmark', flag: '🇩🇰' },
  { value: 'Italy', label: 'Italy', flag: '🇮🇹' },
  { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
  { value: 'New Zealand', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'Japan', label: 'Japan', flag: '🇯🇵' },
  { value: 'South Korea', label: 'South Korea', flag: '🇰🇷' },
  { value: 'Singapore', label: 'Singapore', flag: '🇸🇬' },
  { value: 'Remote', label: 'Remote', flag: '🌐' },
];

export const getCountryFlag = (country?: string | null): string => {
  if (!country) return '🌍';

  const match = jobCountries.find(
    (item) => item.value.toLowerCase() === country.toLowerCase(),
  );

  return match?.flag || '🌍';
};

export const getCountryLabel = (country?: string | null): string => {
  if (!country) return 'Unknown';

  const match = jobCountries.find(
    (item) => item.value.toLowerCase() === country.toLowerCase(),
  );

  return match ? `${match.flag} ${match.label}` : country;
};
