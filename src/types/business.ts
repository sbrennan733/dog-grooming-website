export interface BusinessInfo {
  name: string;
  description: string;

  contact: {
    phone: string;
    email: string;
    address: string;
  };

  payment: {
    // Deposits are stored on every booking but only shown to customers
    // once online deposit collection (Stripe) exists. Until then payment
    // is cash at the appointment.
    depositsEnabled: boolean;
  };

  booking: {
    // When true, a dog must complete an assessment visit before any other
    // service can be booked. When false the assessment is hidden everywhere
    // and every dog can book any service straight away.
    assessmentRequired: boolean;
  };

  social: {
    // Only set the networks the business actually has a page on.
    facebook?: string;
    instagram?: string;
  };
}