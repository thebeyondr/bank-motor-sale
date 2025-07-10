import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useBankMappings() {
  const bankMappings = useQuery(api.banks.getBankMappings);

  return {
    bankNames: bankMappings?.bankNames || {},
    bankIds: bankMappings?.bankIds || {},
    isLoading: bankMappings === undefined,
  };
}
