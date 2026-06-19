import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const MENU_ITEMS = [
  { icon: "location-outline", title: "Address", action: "/addresses" },
  { icon: "card-outline", title: "Payment method", action: null },
  { icon: "ticket-outline", title: "Voucher", action: null },
  { icon: "heart-outline", title: "My Wishlist", action: "/wishlist" },
  { icon: "star-outline", title: "Rate this app", action: null },
  { icon: "log-out-outline", title: "Log out", action: "sign-out" },
] as const;

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handlePress = (action: Href | "sign-out" | null) => {
    if (!action) return;
    if (action === "sign-out") {
      signOut();
      return;
    }
    router.push(action);
  };

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 pt-12">
          {/* Profile Header */}
          <View className="mb-14 flex-row items-center">
            <Image
              source={user?.imageUrl || require("@/assets/images/auth-image.png")}
              style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#F5F5F5" }}
              contentFit="cover"
              transition={200}
            />

            <View className="ml-4 flex-1">
              <Text className="text-lg font-medium text-black">
                {user?.firstName || "Gemstore"} {user?.lastName || "Customer"}
              </Text>
              <Text className="mt-1 text-sm text-text-secondary">
                {user?.emailAddresses?.[0]?.emailAddress || "customer@gemstore.com"}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.72}
              className="h-10 w-10 items-center justify-center"
            >
              <Ionicons name="settings-outline" size={22} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View className="overflow-hidden rounded-xl border border-[#F0F0F0] bg-white">
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                activeOpacity={0.75}
                onPress={() => handlePress(item.action)}
                className="flex-row items-center px-5"
                style={{ height: 60 }}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color="#999999"
                  style={{ width: 28, textAlign: "center" }}
                />
                <Text className="ml-3 flex-1 text-sm text-black">{item.title}</Text>
                {item.action !== "sign-out" && (
                  <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
                )}
                {index < MENU_ITEMS.length - 1 && (
                  <View className="absolute bottom-0 left-[48px] right-0 h-px bg-[#F0F0F0]" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ProfileScreen;
