import { View, Text } from "react-native";
import { formatPrice } from "@/lib/utils";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSummary({ subtotal, shipping, tax, total }: OrderSummaryProps) {
  return (
    <View className="mt-6 px-5">
      <View className="rounded-xl border border-[#E5E5E5] bg-white p-5">
        <Text
          style={{ fontSize: 13, fontWeight: "500", letterSpacing: 2, color: "#000000", textTransform: "uppercase", marginBottom: 20 }}
        >
          Summary
        </Text>

        <View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-text-secondary">Product price</Text>
            <Text className="text-sm text-black">{formatPrice(subtotal)}</Text>
          </View>

          <View className="my-4 h-px bg-[#F0F0F0]" />

          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-text-secondary">Shipping</Text>
            <Text className="text-sm text-black">
              {shipping === 0 ? "Freeship" : formatPrice(shipping)}
            </Text>
          </View>

          <View className="my-4 h-px bg-[#F0F0F0]" />

          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-text-secondary">Tax</Text>
            <Text className="text-sm text-black">{formatPrice(tax)}</Text>
          </View>

          <View className="my-4 h-px bg-[#F0F0F0]" />

          <View className="flex-row items-center justify-between">
            <Text className="text-base font-medium text-black">Subtotal</Text>
            <Text className="text-xl font-semibold text-black">{formatPrice(total)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
