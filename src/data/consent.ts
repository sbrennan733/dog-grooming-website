// The terms and consent wording shown before a booking is made, and saved
// with the booking. Edit the text here, and CHANGE `CONSENT_VERSION` whenever
// the wording changes so each saved record shows which version was agreed.
//
// This is a sensible starting point, not legal advice: the owner should read
// it through (especially the cancellation fee) and adjust it to how the
// business really works.

import { businessInfo } from "@/data/business";

export const CONSENT_VERSION = "2026-10-27";

export interface TermsPoint {
  heading: string;
  text: string;
}

export const termsPoints: TermsPoint[] = [
  {
    heading: "Cancellations",
    text: "We ask for at least 24 hours' notice if you need to cancel or change an appointment, so that we can offer the space to another customer. You can cancel from your account on this website, or call or text us.",
  },
  {
    heading: "Late cancellations and missed appointments",
    text: "We understand that emergencies happen. However, we may charge up to the full price of the groom for appointments that are missed, or cancelled with less than 24 hours' notice. Any charge would be payable before a future booking is made.",
  },
  {
    heading: "Arriving late",
    text: "If you arrive 15 minutes or more after your appointment time, we may need to rearrange your appointment so that the next dog isn't kept waiting.",
  },
  {
    heading: "Payment",
    text: "Payment is taken in cash at the end of your appointment.",
  },
  {
    heading: "Prices",
    text: "Prices are based on a regular grooming schedule and can vary with coat condition, size and temperament. Dematting may cost extra, and dogs with long, double coats may start at a higher price. We will always tell you if the price will be different before we start.",
  },
];

export interface ConsentStatement {
  id: string;
  text: string;
}

export interface ConsentSection {
  heading: string;
  statements: ConsentStatement[];
}

// Every statement below must be ticked before a booking can be made.
export const consentSections: ConsentSection[] = [
  {
    heading: "Consent to groom",
    statements: [
      {
        id: "permission-to-groom",
        text: `I give ${businessInfo.name} permission to groom my dog as we have discussed, and to handle my dog as needed during the visit.`,
      },
      {
        id: "tools-and-accidents",
        text: "I understand that grooming involves scissors, clippers and other tools, and that although every care is taken, accidents can occasionally happen.",
      },
      {
        id: "higher-risk-dogs",
        text: "I understand that older dogs, overweight dogs and dogs with health conditions can be at greater risk during grooming.",
      },
    ],
  },
  {
    heading: "Health and welfare",
    statements: [
      {
        id: "good-health",
        text: "I confirm that my dog is in good health, and that I have told the groomer about any medical conditions, allergies or sensitivities.",
      },
      {
        id: "emergency-vet",
        text: "If there is an emergency, I authorise the groomer to get veterinary treatment for my dog, and I understand that I am responsible for the vet's costs.",
      },
    ],
  },
  {
    heading: "Behaviour",
    statements: [
      {
        id: "behaviour-disclosed",
        text: "I have told the groomer about any behaviour concerns, such as biting, snapping or anxiety.",
      },
      {
        id: "stop-if-distressed",
        text: "I understand that the groom may be stopped if my dog becomes very distressed or aggressive, for their safety and welfare.",
      },
    ],
  },
  {
    heading: "Matted fur and coat condition",
    statements: [
      {
        id: "matting-clip-short",
        text: "I understand that if my dog's coat is matted, the safest option may be to clip it short, and I agree to this where it is necessary.",
      },
      {
        id: "matting-skin",
        text: "I understand that removing severe matting can show skin problems underneath, and that these were already there before the groom.",
      },
    ],
  },
  {
    heading: "Terms and contact",
    statements: [
      {
        id: "agree-terms",
        text: "I have read and agree to the Terms and Conditions above.",
      },
      {
        id: "contact-consent",
        text: `I agree to ${businessInfo.name} contacting me about my appointments, reminders and relevant updates.`,
      },
    ],
  },
];

export const photoConsentOptions = {
  yes: "I give permission for photos and videos of my dog to be taken and used for marketing, including social media.",
  no: "I do not give permission for photos or videos of my dog to be used for marketing.",
} as const;

export type PhotoConsent = keyof typeof photoConsentOptions;

export const requiredStatementIds: string[] = consentSections.flatMap(
  (section) => section.statements.map((statement) => statement.id)
);

export function getStatementText(id: string): string | undefined {
  for (const section of consentSections) {
    const found = section.statements.find((statement) => statement.id === id);
    if (found) {
      return found.text;
    }
  }
  return undefined;
}
