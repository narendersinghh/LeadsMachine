export interface CurrencyOption {
  symbol: string;
  code: string;
  name: string;
  country: string;
  exampleLeadValue: number;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { symbol: '₹', code: 'INR', name: 'Indian Rupee', country: 'India', exampleLeadValue: 3500 },
  { symbol: '$', code: 'USD', name: 'US Dollar', country: 'United States', exampleLeadValue: 750 },
  { symbol: '€', code: 'EUR', name: 'Euro', country: 'European Union', exampleLeadValue: 650 },
  { symbol: '£', code: 'GBP', name: 'British Pound', country: 'United Kingdom', exampleLeadValue: 550 },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar', country: 'Australia', exampleLeadValue: 950 },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar', country: 'Canada', exampleLeadValue: 850 },
  { symbol: 'AED', code: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', exampleLeadValue: 2500 },
  { symbol: 'SGD', code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', exampleLeadValue: 900 },
];

export function formatMoney(amount: number, currencySymbol: string = '₹'): string {
  const symbol = currencySymbol || '₹';
  const formattedNumber = Math.round(amount).toLocaleString();
  return `${symbol}${formattedNumber}`;
}
