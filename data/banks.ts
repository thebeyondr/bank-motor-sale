import type { Bank } from "~/types/bank";

export const banks: Bank[] = [
  {
    id: "8fc8081e-32cf-4f27-90ec-8e440ea6dcd4",
    name: "JMMB",
    viewInstructions:
      "View at KACS Auto Sales: 37 Dunrobin Avenue, Kingston 10 | 876-227-2776",
    saleTerms:
      "Vehicles sold as-is, where-is. All reasonable offers considered.",
    bidInstructions:
      "Bid at KACS Auto Sales: 37 Dunrobin Avenue, Kingston 10 | 876-227-2776",
    contactInfo: {
      phones: ["876-551-6507", "876-564-5928", "876-284-6933"],
      emails: [""],
      address: "",
      website: "https://www.jmmb.com/",
    },
    operatingHours: {
      weekdays: "9:00 AM - 4:00 PM",
      weekends: "Closed",
    },
  },
  {
    id: "cf984f5d-4bf8-405d-93f4-c518e258f7fe",
    name: "NCB",
    viewInstructions:
      "Visit Nihon Trucking: 45-47 Constant Spring Road, Kingston 10",
    saleTerms: "All vehicles are sold as-is where-is.",
    bidInstructions: "Email bids to vehiclebids@jncb.com",
    contactInfo: {
      phones: ["888-429-5950", "876-589-9835", "876-285-4809"],
      emails: ["vehiclebids@jncb.com"],
      address: "6 Haughton Terrace, Kingston 10, Jamaica",
      website: "https://www.jncb.com",
    },
    operatingHours: {
      weekdays: "8:30 AM - 3:00 PM",
      weekends: "Closed",
    },
  },
  {
    id: "33ff7536-112c-4a40-9b16-a60666ac7d4f",
    name: "CIBC",
    viewInstructions:
      "View at Collections Solutions Ltd: 30 Cowper Drive, Kingston 20 | Mon - Fri 9:00 AM - 4:30 PM",
    saleTerms: "Sold as-is, where-is, under the power of sale.",
    bidInstructions:
      "[DEADLINE March 19, 2025] Collect bid forms at Collections Solutions Ltd: 30 Cowper Drive, Kingston 20 or CIBC Caribbean",
    contactInfo: {
      phones: ["1-246-467-2960 Ext 7318 or 7319"],
      emails: ["duane.skeete@cibcfcib.com", "wayne.weekes@cibcfcib.com"],
      address: "CIBC, Kingston, Jamaica",
      website: "https://www.cibcfcib.com",
    },
    operatingHours: {
      weekdays: "8:30 AM - 4:30 PM",
      weekends: "Closed",
    },
  },
];
