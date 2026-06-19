import { useApi } from "@/lib/api";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface ProductFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
}

const useProducts = (filters: ProductFilters = {}) => {
  const api = useApi();

  const result = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await api.get<Product[]>("/products", { params: filters });
      return data;
    },
  });

  return result;
};

export default useProducts;
