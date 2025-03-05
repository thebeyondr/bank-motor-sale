export type ContactInfo = {
  phones: string[];
  emails: string[];
  address: string;
  website: string;
};

export type OperatingHours = {
  weekdays: string;
  weekends: string;
};

export type Bank = {
  id: string;
  name: string;
  viewInstructions: string;
  saleTerms: string;
  bidInstructions: string;
  contactInfo: ContactInfo;
  operatingHours: OperatingHours;
};
