export interface BusinessInfo {
  name: string;
  description: string;

  contact: {
    phone: string;
    email: string;
    address: string;
  };

  social: {
    instagram: string;
    facebook: string;
  };
}