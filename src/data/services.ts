import { Service } from "@/types/booking";

const GROOM_MINUTES = 180;

// From the business's price list. Durations are only used to block time in
// the diary (customers are never shown them): each groom takes about three
// hours. Adjust here, then re-run the seed.
export const services: Service[] = [
  {
    id: 1,
    name: "Fresh & Fluffy Bath",
    description: "Bath, blow-dry, thorough brushing, fragrance.",
    duration: GROOM_MINUTES,
    prices: { small: 20, medium: 25, large: 35 },
    deposit: 10,
  },
  {
    id: 2,
    name: "Mini Spa Groom",
    description:
      "Bath, blow-dry, thorough brushing, hygiene trim, paw pads trimmed, nails clipped, fragrance.",
    duration: GROOM_MINUTES,
    prices: { small: 25, medium: 30, large: 40 },
    deposit: 10,
  },
  {
    id: 3,
    name: "Signature Full Groom",
    description:
      "Bath, blow-dry, thorough brushing, all-over body clipping to desired length, face trim, hygiene trim, paw pads trimmed, nails clipped, fragrance.",
    duration: GROOM_MINUTES,
    prices: { small: 35, medium: 40, large: 50 },
    deposit: 10,
  },
  {
    id: 4,
    name: "Deluxe De-Shed",
    description:
      "Pre-bath brushing and detangling, bath, blow-dry, thorough brushing, full de-shedding of the coat, paw pads trimmed, nails clipped, styling if required, fragrance.",
    duration: GROOM_MINUTES,
    prices: { small: 25, medium: 30, large: 40 },
    longCoatPrice: 50,
    priceNote:
      "Prices are for short-haired dogs. Long-haired double-coated dogs: from £50.",
    deposit: 10,
  },
  {
    id: 5,
    name: "Hand-Stripping Show Finish",
    description:
      "Pre-bath hand strip to remove dead, loose topcoat, bath, blow-dry, nail clipping, fragrance.",
    duration: GROOM_MINUTES,
    prices: { small: 35, medium: 40, large: 50 },
    deposit: 10,
  },
  {
    id: 6,
    name: "Puppy Pamper Groom",
    description:
      "Bath, blow-dry, thorough brushing, hygiene trim, paw pads trimmed, nails clipped, face trim if needed, fragrance.",
    duration: GROOM_MINUTES,
    prices: { small: 20, medium: 20, large: 20 },
    isFromPrice: true,
    deposit: 10,
  },
  {
    id: 7,
    name: "Assessment Visit",
    description:
      "Initial behaviour and coat assessment required before the first full groom.",
    duration: 30,
    prices: { small: 20, medium: 20, large: 20 },
    deposit: 10,
    isAssessment: true,
  },
];

// The grooming services shown on the public price list.
export const publicServices = services.filter((service) => !service.isAssessment);

export const priceDisclaimer =
  "Prices are based on a regular grooming schedule and may vary depending on coat condition, size and temperament. Dematting may incur additional charges.";
