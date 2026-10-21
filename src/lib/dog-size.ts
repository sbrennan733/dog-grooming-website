import type { Dog, DogSize, Service } from "@/generated/prisma/client";

export const dogSizeValues = ["SMALL", "MEDIUM", "LARGE"] as const;

export const dogSizeLabels: Record<DogSize, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

// The price (in pence) a dog of this size pays for a service.
export function priceForSize(
  service: Pick<Service, "priceSmall" | "priceMedium" | "priceLarge">,
  size: DogSize
): number {
  switch (size) {
    case "SMALL":
      return service.priceSmall;
    case "MEDIUM":
      return service.priceMedium;
    case "LARGE":
      return service.priceLarge;
  }
}

export interface DogPrice {
  // Pence.
  pence: number;
  // True when the amount is a starting price (final price assessed on the day).
  isFrom: boolean;
}

// The price a particular dog pays for a service: by size, or the service's
// long-coat starting price for long-haired double-coated dogs.
export function priceForDog(
  service: Pick<
    Service,
    "priceSmall" | "priceMedium" | "priceLarge" | "priceLongCoat" | "isFromPrice"
  >,
  dog: Pick<Dog, "size" | "hasLongDoubleCoat">
): DogPrice {
  if (dog.hasLongDoubleCoat && service.priceLongCoat !== null) {
    return { pence: service.priceLongCoat, isFrom: true };
  }

  return {
    pence: priceForSize(service, dog.size),
    isFrom: service.isFromPrice,
  };
}
