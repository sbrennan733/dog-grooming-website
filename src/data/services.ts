import { Service } from "@/types/booking";

export const services: Service[] = [
  {
    id: 1,
    name: "Assessment Visit",
    description:
      "Initial behaviour and coat assessment required before the first full groom.",
    duration: 30,
    price: 20,
    deposit: 10,
  },
  {
    id: 2,
    name: "Full Groom",
    description:
      "Complete grooming package including wash, trim, styling and drying.",
    duration: 90,
    price: 40,
    deposit: 10,
  },
  {
    id: 3,
    name: "Wash & Dry",
    description:
      "Freshen up your dog with a professional wash and blow dry.",
    duration: 45,
    price: 20,
    deposit: 10,
  },
  {
    id: 4,
    name: "Nail Trim",
    description:
      "Quick and safe nail trimming to keep paws healthy.",
    duration: 15,
    price: 10,
    deposit: 10,
  },
];