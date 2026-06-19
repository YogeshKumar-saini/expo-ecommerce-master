import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProductCategories from "@/hooks/useProductCategories";
import useProducts from "@/hooks/useProducts";
import { ProductCategory, ProductSubcategory } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ProductSubcategory | null>(null);
  const [showCategoryProducts, setShowCategoryProducts] = useState(false);
  const { data: categories = [], isLoading: isLoadingCategories } = useProductCategories();

  const showResults = Boolean(searchQuery.trim() || selectedSubcategory || showCategoryProducts);
  const { data: products = [], isLoading, isError } = useProducts({
    search: searchQuery.trim() || undefined,
    category: selectedCategory?.name,
    subcategory: selectedSubcategory?.name,
    limit: 120,
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setShowCategoryProducts(false);
  };

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-4">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              activeOpacity={0.75}
              className="h-11 w-11 justify-center"
              onPress={() => {
                if (selectedSubcategory) {
                  setSelectedSubcategory(null);
                  setShowCategoryProducts(false);
                } else if (selectedCategory) {
                  setSelectedCategory(null);
                  setShowCategoryProducts(false);
                }
              }}
            >
              <Ionicons
                name={selectedCategory || selectedSubcategory ? "chevron-back" : "menu-outline"}
                size={selectedCategory || selectedSubcategory ? 24 : 28}
                color="#000000"
              />
            </TouchableOpacity>

            <Text
              style={{ fontSize: 18, fontWeight: "500", letterSpacing: 2, color: "#000000", textTransform: "uppercase" }}
              numberOfLines={1}
            >
              {selectedSubcategory?.name || selectedCategory?.name || (searchQuery ? "Search" : "Discover")}
            </Text>

            <TouchableOpacity activeOpacity={0.7} className="h-11 w-11 items-center justify-center">
              <Ionicons name="notifications-outline" size={24} color="#000000" />
              <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-black" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="mb-7 flex-row gap-3">
            <View className="min-h-[50px] flex-1 flex-row items-center rounded-xl border border-[#E5E5E5] bg-white px-4">
              <Ionicons color={"#999999"} size={22} name="search-outline" />
              <TextInput
                placeholder="Search"
                placeholderTextColor={"#999999"}
                className="ml-3 flex-1 text-base text-black"
                style={{ fontWeight: "400" }}
                value={searchQuery}
                onChangeText={(value) => {
                  setSearchQuery(value);
                  if (value.trim()) {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                    setShowCategoryProducts(false);
                  }
                }}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              className="h-[50px] w-[50px] items-center justify-center rounded-xl border border-[#E5E5E5] bg-white"
              onPress={resetFilters}
            >
              <Ionicons
                name={searchQuery || selectedCategory || selectedSubcategory || showCategoryProducts ? "close" : "options-outline"}
                size={22}
                color="#000000"
              />
            </TouchableOpacity>
          </View>
        </View>

        {showResults ? (
          <View className="px-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-semibold text-black">
                {products.length} Results
              </Text>
              <View className="rounded-full border border-[#E5E5E5] px-4 py-2">
                <Text className="text-sm text-text-secondary">
                  {selectedCategory?.name || "All"}
                </Text>
              </View>
            </View>

            <ProductsGrid products={products} isLoading={isLoading} isError={isError} />
          </View>
        ) : selectedCategory ? (
          <View className="px-6">
            <View className="mb-5 flex-row items-end justify-between">
              <View>
                <Text
                  style={{ fontSize: 11, fontWeight: "500", letterSpacing: 3, color: "#999999", textTransform: "uppercase" }}
                >
                  {selectedCategory.count} products
                </Text>
                <Text className="mt-2 text-2xl font-semibold text-black">
                  Choose a type
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCategoryProducts(true)}>
                <Text className="text-sm text-text-tertiary">View all</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {selectedCategory.subcategories.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.name}
                  subcategory={subcategory}
                  onPress={() => setSelectedSubcategory(subcategory)}
                />
              ))}
            </View>
          </View>
        ) : (
          <View className="px-6">
            {isLoadingCategories ? (
              <View className="h-72 items-center justify-center">
                <ActivityIndicator size="large" color="#000000" />
              </View>
            ) : (
              <>
                <Text
                  style={{ fontSize: 11, fontWeight: "500", letterSpacing: 3, color: "#999999", textTransform: "uppercase", marginBottom: 6 }}
                >
                  Browse Categories
                </Text>
                <Text className="mb-6 text-2xl font-semibold text-black">
                  Shop by category
                </Text>
                <View className="gap-4">
                  {categories.map((category) => (
                    <CategoryBanner
                      key={category.name}
                      category={category}
                      onPress={() => {
                        setSelectedCategory(category);
                        setSelectedSubcategory(null);
                        setShowCategoryProducts(false);
                      }}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

function CategoryBanner({
  category,
  onPress,
}: {
  category: ProductCategory;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      className="h-[160px] overflow-hidden rounded-2xl bg-[#F5F5F5]"
    >
      <Image source={category.image} style={{ height: "100%", width: "100%" }} contentFit="cover" />
      <View className="absolute inset-0 bg-black/25" />
      <View className="absolute bottom-5 left-5 right-5 flex-row items-end justify-between">
        <View>
          <Text className="text-2xl font-semibold text-white" numberOfLines={1}>
            {category.name}
          </Text>
          <Text className="mt-1 text-sm text-white/80">
            {category.subcategories.length} types
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/90">
          <Ionicons name="chevron-forward" size={20} color="#000000" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SubcategoryCard({
  subcategory,
  onPress,
}: {
  subcategory: ProductSubcategory;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      className="mb-4 w-[48%] overflow-hidden rounded-xl border border-[#E5E5E5] bg-white"
    >
      <Image source={subcategory.image} style={{ width: "100%", aspectRatio: 0.95 }} contentFit="cover" />
      <View className="p-3">
        <Text className="text-sm font-medium text-black" numberOfLines={2}>
          {subcategory.name}
        </Text>
        <Text className="mt-1 text-xs text-text-tertiary">{subcategory.count} items</Text>
      </View>
    </TouchableOpacity>
  );
}
