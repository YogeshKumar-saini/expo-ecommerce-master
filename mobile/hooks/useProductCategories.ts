import { useApi } from "@/lib/api";
import { ProductCategory } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useProductCategories = () => {
  const api = useApi();

  return useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data } = await api.get<ProductCategory[]>("/products/categories");
      return data;
    },
  });
};

export default useProductCategories;
