export interface Dog{
    id: number;
    name: string;
}

export interface SizePrices {
  small: number;
  medium: number;
  large: number;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  // Minutes. Drives how long the slot is blocked in the diary.
  duration: number;
  // Pounds, by dog size.
  prices: SizePrices;
  // Show "From £x" because the final price depends on the dog and its coat.
  isFromPrice?: boolean;
  // Extra pricing detail, e.g. a coat-type surcharge.
  priceNote?: string;
  deposit: number;
  // The mandatory first visit, offered to new dogs only (not on the price list).
  isAssessment?: boolean;
}
