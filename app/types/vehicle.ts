export type PriceBySource = {
  price: number | null;
  source: string;
};

export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  color: string;
  pricesBySource: {
    [key: string]: PriceBySource;
  };
  sources: string[];
};
