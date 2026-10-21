import type { DogSize, Service } from "@/generated/prisma/client";

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
