import AddressSelectionModal from "@/components/AddressSelectionModal";
import OrderSummary from "@/components/OrderSummary";
import SafeScreen from "@/components/SafeScreen";
import { useAddresses } from "@/hooks/useAddressess";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as Sentry from "@sentry/react-native";

const CartScreen = () => {
  const api = useApi();
  const {
    cart,
    cartItemCount,
    cartTotal,
    clearCart,
    isError,
    isLoading,
    isRemoving,
    isUpdating,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { addresses } = useAddresses();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const cartItems = cart?.items || [];
  const subtotal = cartTotal;
  const shipping = 10.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert("Remove Item", `Remove ${productName} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!addresses || addresses.length === 0) {
      Alert.alert("No Address", "Please add a shipping address in your profile before checking out.");
      return;
    }

    setAddressModalVisible(true);
  };

  const handleProceedWithPayment = async (selectedAddress: Address) => {
    setAddressModalVisible(false);

    Sentry.logger.info("Checkout initiated", {
      itemCount: cartItemCount,
      total: total.toFixed(2),
      city: selectedAddress.city,
    });

    try {
      setPaymentLoading(true);

      const { data } = await api.post("/payment/create-intent", {
        cartItems,
        shippingAddress: {
          fullName: selectedAddress.fullName,
          streetAddress: selectedAddress.streetAddress,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          phoneNumber: selectedAddress.phoneNumber,
        },
      });

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: "Gemstore",
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        setPaymentLoading(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Alert.alert("Payment cancelled", presentError.message);
      } else {
        Alert.alert("Success", "Your payment was successful! Your order is being processed.");
        clearCart();
      }
    } catch (error) {
      Sentry.captureException(error);
      Alert.alert("Error", "Failed to process payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;
  if (cartItems.length === 0) return <EmptyUI />;

  return (
    <SafeScreen>
      <View className="px-6 pt-4">
        <View className="mb-5 flex-row items-center justify-center">
          <Text
            style={{ fontSize: 16, fontWeight: "500", letterSpacing: 3, color: "#000000", textTransform: "uppercase" }}
          >
            Your Bag
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        <View className="gap-3 px-5">
          {cartItems.map((item) => (
            <View key={item._id} className="overflow-hidden border-b border-[#F0F0F0] bg-white pb-4">
              <View className="flex-row">
                <Image
                  source={item.product.images[0]}
                  contentFit="cover"
                  style={{ width: 100, height: 130, backgroundColor: "#F5F5F5" }}
                />

                <View className="flex-1 px-4 py-2">
                  <View className="flex-row items-start justify-between">
                    <Text className="mr-3 flex-1 text-sm leading-5 text-black" numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <TouchableOpacity
                      className="h-8 w-8 items-center justify-center"
                      activeOpacity={0.75}
                      onPress={() => handleRemoveItem(item.product._id, item.product.name)}
                      disabled={isRemoving}
                    >
                      <Ionicons name="close" size={18} color="#999999" />
                    </TouchableOpacity>
                  </View>

                  <Text className="mt-1 text-xs text-text-tertiary" numberOfLines={1}>
                    {item.product.category}
                    {item.product.subcategory ? ` | ${item.product.subcategory}` : ""}
                  </Text>

                  <Text className="mt-2 text-base font-semibold text-black" numberOfLines={1}>
                    {formatPrice(item.product.price * item.quantity)}
                  </Text>

                  <View className="mt-3 flex-row items-center justify-end">
                    <View className="flex-row items-center rounded-full border border-[#E5E5E5]">
                      <TouchableOpacity
                        className="h-8 w-8 items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                        disabled={isUpdating}
                      >
                        <Ionicons name="remove" size={14} color="#000000" />
                      </TouchableOpacity>

                      <Text className="mx-1 min-w-5 text-center text-sm font-medium text-black">
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        className="h-8 w-8 items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                        disabled={isUpdating}
                      >
                        <Ionicons name="add" size={14} color="#000000" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
      </ScrollView>

      {/* Checkout Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pb-8 pt-3">
        <TouchableOpacity
          className="h-[54px] items-center justify-center bg-black"
          activeOpacity={0.88}
          onPress={handleCheckout}
          disabled={paymentLoading}
        >
          {paymentLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={{ fontSize: 13, fontWeight: "500", letterSpacing: 2, color: "#FFFFFF", textTransform: "uppercase" }}
            >
              Proceed to Checkout
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleProceedWithPayment}
        isProcessing={paymentLoading}
      />
    </SafeScreen>
  );
};

export default CartScreen;

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-4 text-sm text-text-secondary">Loading cart...</Text>
      </View>
    </SafeScreen>
  );
}

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#CC0000" />
        <Text className="mt-4 text-lg font-medium text-black">Failed to load cart</Text>
        <Text className="mt-2 text-center text-sm text-text-secondary">
          Please check your connection and try again
        </Text>
      </View>
    </SafeScreen>
  );
}

function EmptyUI() {
  return (
    <SafeScreen>
      <View className="px-6 pt-4">
        <Text
          style={{ fontSize: 16, fontWeight: "500", letterSpacing: 3, color: "#000000", textTransform: "uppercase", textAlign: "center" }}
        >
          Your Bag
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="bag-outline" size={48} color="#CCCCCC" />
        <Text className="mt-4 text-lg font-medium text-black">Your bag is empty</Text>
        <Text className="mt-2 text-center text-sm text-text-secondary">
          Add products you love and they will appear here.
        </Text>
      </View>
    </SafeScreen>
  );
}
