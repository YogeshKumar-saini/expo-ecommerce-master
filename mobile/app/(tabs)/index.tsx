import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProductCategories from "@/hooks/useProductCategories";
import useProducts from "@/hooks/useProducts";
import { formatPrice } from "@/lib/utils";
import { Product, ProductCategory } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

const PROMO_BANNER = require("@/assets/images/figma/banner-1.png");

const ShopScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const { data: categories = [], isLoading: isLoadingCategories } = useProductCategories();
  const activeCategory = categories.find((category) => category.name === selectedCategory);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  const { data: products, isLoading, isError } = useProducts({
    category: selectedCategory || undefined,
    subcategory: selectedSubcategory || undefined,
    limit: 48,
  });

  const featuredProducts = useMemo(() => (products || []).slice(0, 8), [products]);
  const recommendedProducts = useMemo(() => (products || []).slice(8, 20), [products]);

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-4">
          {/* Header */}
          <View className="mb-8 flex-row items-center justify-between">
            <TouchableOpacity activeOpacity={0.7} className="h-11 w-11 justify-center">
              <Ionicons name="menu-outline" size={28} color="#000000" />
            </TouchableOpacity>

            <Text
              style={{ fontWeight: "300", fontSize: 24, letterSpacing: 6, color: "#000000" }}
            >
              GEMSTORE
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              className="h-11 w-11 items-center justify-center"
              onPress={() => router.push("/orders")}
            >
              <Ionicons name="notifications-outline" size={24} color="#000000" />
              <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-black" />
            </TouchableOpacity>
          </View>

          {/* Category Pills */}
          <View className="mb-6 flex-row justify-between">
            {isLoadingCategories ? (
              <View className="h-[132px] flex-1 justify-center">
                <ActivityIndicator color="#000000" />
              </View>
            ) : (
              categories.map((category) => (
                <CategoryCard
                  key={category.name}
                  category={category}
                  isSelected={selectedCategory === category.name}
                  onPress={() => {
                    setSelectedCategory(category.name);
                    setSelectedSubcategory(null);
                  }}
                />
              ))
            )}
          </View>

          {/* Subcategory Chips */}
          {activeCategory && activeCategory.subcategories.length > 0 && (
            <View className="mb-8">
              <View className="mb-4 flex-row items-center justify-between">
                <Text
                  style={{ fontSize: 12, fontWeight: "500", letterSpacing: 3, color: "#999999", textTransform: "uppercase" }}
                >
                  Shop {activeCategory.name}
                </Text>
                <Text className="text-xs text-text-tertiary">
                  {activeCategory.subcategories.length} types
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              >
                <SubcategoryChip
                  label="All"
                  isSelected={!selectedSubcategory}
                  onPress={() => setSelectedSubcategory(null)}
                />
                {activeCategory.subcategories.map((subcategory) => (
                  <SubcategoryChip
                    key={subcategory.name}
                    label={subcategory.name}
                    isSelected={selectedSubcategory === subcategory.name}
                    onPress={() => setSelectedSubcategory(subcategory.name)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Promo Banner */}
          <Image
            source={PROMO_BANNER}
            style={{ width: "100%", aspectRatio: 936 / 424, borderRadius: 16 }}
            contentFit="cover"
          />
        </View>

        {/* Featured Products */}
        <View className="mt-10">
          <View className="mb-5 flex-row items-center justify-between px-6">
            <Text
              style={{ fontSize: 11, fontWeight: "500", letterSpacing: 3, color: "#000000", textTransform: "uppercase" }}
            >
              Featured Products
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/discover")}>
              <Text className="text-sm text-text-tertiary">Show all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="h-64 items-center justify-center">
              <ActivityIndicator size="large" color="#000000" />
            </View>
          ) : isError ? (
            <View className="px-6 py-16">
              <Text className="text-center text-sm text-text-secondary">
                Failed to load products
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {featuredProducts.map((product) => (
                <FeaturedProduct key={product._id} product={product} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recommended Grid */}
        <View className="mt-10 px-6">
          <View className="mb-5 flex-row items-center justify-between">
            <Text
              style={{ fontSize: 11, fontWeight: "500", letterSpacing: 3, color: "#000000", textTransform: "uppercase" }}
            >
              {selectedSubcategory || selectedCategory || "Recommended"}
            </Text>
            <Text className="text-xs text-text-tertiary">{recommendedProducts.length} items</Text>
          </View>

          <ProductsGrid products={recommendedProducts} isLoading={isLoading} isError={isError} />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

function CategoryCard({
  category,
  isSelected,
  onPress,
}: {
  category: ProductCategory;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      className={`h-[132px] overflow-hidden rounded-2xl border ${
        isSelected ? "border-black" : "border-[#E5E5E5]"
      }`}
      style={{ width: "31%" }}
    >
      <View className="absolute inset-0 bg-[#F5F5F5]">
        <Image
          source={category.image}
          style={{ height: "100%", width: "100%" }}
          contentFit="cover"
        />
      </View>
      <View className="absolute inset-0 bg-black/30" />
      <View className="absolute bottom-3 left-3 right-3">
        <Text className="text-lg font-semibold text-white">{category.name}</Text>
        <Text className="mt-0.5 text-xs text-white/80" numberOfLines={1}>
          {category.count} products
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SubcategoryChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className={`rounded-full border px-5 py-2.5 ${
        isSelected ? "border-black bg-black" : "border-[#E5E5E5] bg-white"
      }`}
    >
      <Text
        style={{ fontSize: 13, fontWeight: "500" }}
        className={isSelected ? "text-white" : "text-text-secondary"}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FeaturedProduct({ product }: { product: Product }) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      className="w-40"
      onPress={() => router.push(`/product/${product._id}`)}
    >
      <View className="h-52 overflow-hidden rounded-xl bg-[#F5F5F5]">
        <Image
          source={product.images[0]}
          style={{ height: "100%", width: "100%" }}
          contentFit="cover"
        />
      </View>
      <Text className="mt-3 text-sm text-text-primary" numberOfLines={1}>
        {product.name}
      </Text>
      <Text className="mt-1 text-base font-semibold text-black">{formatPrice(product.price)}</Text>
    </TouchableOpacity>
  );
}

export default ShopScreen;
