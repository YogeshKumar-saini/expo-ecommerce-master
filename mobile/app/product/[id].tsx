import SafeScreen from "@/components/SafeScreen";
import useCart from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import useWishlist from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewing from "react-native-image-viewing";

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, isLoading } = useProduct(id);
  const { addToCart, isAddingToCart } = useCart();
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity] = useState(1);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      { productId: product._id, quantity },
      {
        onSuccess: () => Alert.alert("Success", `${product.name} added to cart!`),
        onError: (error: any) => {
          Alert.alert("Error", error?.response?.data?.error || "Failed to add to cart");
        },
      }
    );
  };

  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const inStock = product.stock > 0;
  const availableSizes = product.sizes
    ? product.sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean)
    : [];
  const activeSize = selectedSize || availableSizes[0];

  return (
    <SafeScreen>
      {/* Floating Navigation */}
      <View className="absolute left-0 right-0 top-0 z-10 flex-row items-center justify-between px-5 pt-14">
        <TouchableOpacity
          className="h-11 w-11 items-center justify-center rounded-full bg-white"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 }}
          onPress={() => router.back()}
          activeOpacity={0.72}
        >
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity
          className="h-11 w-11 items-center justify-center rounded-full bg-white"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 }}
          onPress={() => toggleWishlist(product._id)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
          activeOpacity={0.72}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? "heart" : "heart-outline"}
              size={22}
              color={isInWishlist(product._id) ? "#CC0000" : "#000000"}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Image Gallery */}
        <View className="relative bg-[#F5F5F5] rounded-b-[40px] overflow-hidden">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {product.images.map((image: string, index: number) => (
              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => setIsImageViewVisible(true)} 
                key={image + index} 
                style={{ width }}
              >
                <Image
                  source={image}
                  style={{ width, height: 440 }}
                  contentFit="contain"
                  contentPosition="center"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="absolute bottom-5 left-0 right-0 flex-row justify-center gap-2">
            {product.images.map((_: string, index: number) => (
              <View
                key={index}
                className={`rounded-full ${
                  index === selectedImageIndex ? "h-2 w-2 bg-black" : "h-1.5 w-1.5 bg-black/30"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View className="bg-white px-6 pb-8 pt-6">
          {/* Name + Price Row */}
          <View className="mb-4 flex-row items-start justify-between">
            <Text className="mr-4 flex-1 text-xl font-semibold leading-7 text-black" numberOfLines={3}>
              {product.name}
            </Text>
            <Text className="text-xl font-semibold text-black" numberOfLines={1}>
              {formatPrice(product.price)}
            </Text>
          </View>

          {/* Rating */}
          <View className="mb-6 flex-row items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={16}
                color={star <= Math.round(product.averageRating) ? "#000000" : "#E0E0E0"}
              />
            ))}
            <Text className="ml-2 text-sm text-text-tertiary">({product.totalReviews})</Text>
          </View>

          <View className="h-px bg-[#E5E5E5]" />

          {/* Catalog Tags */}
          <View className="my-5">
            <Text
              style={{ fontSize: 11, fontWeight: "500", letterSpacing: 2, color: "#999999", textTransform: "uppercase", marginBottom: 12 }}
            >
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="rounded-full border border-[#E5E5E5] px-4 py-2">
                <Text className="text-sm text-black">{product.category}</Text>
              </View>
              {product.subcategory && (
                <View className="rounded-full border border-[#E5E5E5] px-4 py-2">
                  <Text className="text-sm text-black">{product.subcategory}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Size Selector */}
          <View className="mb-5">
            <Text
              style={{ fontSize: 11, fontWeight: "500", letterSpacing: 2, color: "#999999", textTransform: "uppercase", marginBottom: 12 }}
            >
              Size
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 8 }}
            >
              {(availableSizes.length > 0 ? availableSizes.slice(0, 5) : ["Free"]).map((size) => {
                const isSelected = activeSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    activeOpacity={0.75}
                    onPress={() => setSelectedSize(size)}
                    className={`h-11 min-w-[44px] items-center justify-center rounded-full px-4 border ${
                      isSelected ? "border-black bg-black" : "border-[#E5E5E5] bg-white"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? "text-white" : "text-text-secondary"
                      }`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View className="h-px bg-[#E5E5E5]" />

          {/* Description */}
          <TouchableOpacity activeOpacity={0.7} className="flex-row items-center justify-between py-5">
            <Text className="text-base font-medium text-black">Description</Text>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>

          {product.description && (
            <Text className="-mt-2 mb-4 text-sm leading-5 text-text-secondary" numberOfLines={4}>
              {product.description}
            </Text>
          )}

          <View className="h-px bg-[#E5E5E5]" />

          {/* Reviews */}
          <TouchableOpacity activeOpacity={0.7} className="flex-row items-center justify-between py-5">
            <Text className="text-base font-medium text-black">Reviews</Text>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>

          {/* Stock */}
          <View className="mt-1 flex-row items-center">
            <View className={`mr-2 h-2 w-2 rounded-full ${inStock ? "bg-black" : "bg-[#CC0000]"}`} />
            <Text className={`text-sm ${inStock ? "text-text-secondary" : "text-[#CC0000]"}`}>
              {inStock ? `${product.stock} in stock` : "Out of stock"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pb-8 pt-3">
        <TouchableOpacity
          className={`h-[54px] flex-row items-center justify-center rounded-2xl ${
            inStock ? "bg-black" : "bg-[#CCCCCC]"
          }`}
          activeOpacity={0.86}
          onPress={handleAddToCart}
          disabled={!inStock || isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="bag-outline" size={18} color="#FFFFFF" />
              <Text
                style={{ marginLeft: 10, fontSize: 13, fontWeight: "500", letterSpacing: 2, color: "#FFFFFF", textTransform: "uppercase" }}
              >
                {inStock ? "Add To Bag" : "Out of Stock"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ImageViewing
        images={product.images.map((img: string) => ({ uri: img }))}
        imageIndex={selectedImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
      />
    </SafeScreen>
  );
};

export default ProductDetailScreen;

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-4 text-sm text-text-secondary">Loading product...</Text>
      </View>
    </SafeScreen>
  );
}

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#CC0000" />
        <Text className="mt-4 text-lg font-medium text-black">Product not found</Text>
        <Text className="mt-2 text-center text-sm text-text-secondary">
          This product may have been removed or does not exist
        </Text>
        <TouchableOpacity
          className="mt-6 bg-black px-8 py-3"
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 12, fontWeight: "500", letterSpacing: 2, color: "#FFFFFF", textTransform: "uppercase" }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
