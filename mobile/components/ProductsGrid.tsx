import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";

interface ProductsGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
}

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const { isAddingToCart, addToCart } = useCart();

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          Alert.alert("Success", `${productName} added to cart!`);
        },
        onError: (error: any) => {
          Alert.alert("Error", error?.response?.data?.error || "Failed to add to cart");
        },
      }
    );
  };

  const renderProduct = ({ item: product }: { item: Product }) => (
    <TouchableOpacity
      className="mb-5 overflow-hidden bg-white rounded-2xl"
      style={{ width: "48%" }}
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${product._id}`)}
    >
      <View className="relative">
        <Image
          source={{ uri: product.images[0] }}
          className="h-48 w-full bg-[#F5F5F5] rounded-2xl"
          resizeMode="contain"
        />

        <TouchableOpacity
          className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-white/95"
          activeOpacity={0.7}
          onPress={() => toggleWishlist(product._id)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? "heart" : "heart-outline"}
              size={17}
              color={isInWishlist(product._id) ? "#CC0000" : "#000000"}
            />
          )}
        </TouchableOpacity>
      </View>

      <View className="pt-3 pb-1">
        <Text
          style={{ fontSize: 10, fontWeight: "500", letterSpacing: 1.5, color: "#999999", textTransform: "uppercase" }}
        >
          {product.subcategory || product.category}
        </Text>
        <Text className="mb-2 mt-1 min-h-[36px] text-xs leading-4 text-black" numberOfLines={2}>
          {product.name}
        </Text>

        <View className="mb-2 flex-row items-center">
          <Ionicons name="star" size={11} color="#000000" />
          <Text className="ml-1 text-xs text-black">
            {product.averageRating.toFixed(1)}
          </Text>
          <Text className="ml-1 text-xs text-text-tertiary">({product.totalReviews})</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-sm font-semibold text-black" numberOfLines={1}>
            {formatPrice(product.price)}
          </Text>

          <TouchableOpacity
            className="h-7 w-7 items-center justify-center rounded-full bg-black"
            activeOpacity={0.7}
            onPress={() => handleAddToCart(product._id, product.name)}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="add" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="text-text-secondary mt-4 text-sm">Loading products...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-20 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={40} color="#CC0000" />
        <Text className="text-black font-medium mt-4">Failed to load products</Text>
        <Text className="text-text-secondary text-sm mt-2">Please try again later</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      ListEmptyComponent={NoProductsFound}
    />
  );
};

export default ProductsGrid;

function NoProductsFound() {
  return (
    <View className="py-20 items-center justify-center">
      <Ionicons name="search-outline" size={40} color={"#CCCCCC"} />
      <Text className="text-black font-medium mt-4">No products found</Text>
      <Text className="text-text-secondary text-sm mt-2">Try adjusting your filters</Text>
    </View>
  );
}
