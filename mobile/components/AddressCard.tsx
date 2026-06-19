import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Address } from "@/types";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string, label: string) => void;
  isUpdatingAddress: boolean;
  isDeletingAddress: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  isUpdatingAddress,
  isDeletingAddress,
}: AddressCardProps) {
  return (
    <View className="rounded-xl border border-[#E5E5E5] bg-white p-5 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={20} color="#000000" className="mr-2" />
          <Text className="text-black font-semibold text-base ml-2">{address.label}</Text>
        </View>
        {address.isDefault && (
          <View className="bg-black px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">Default</Text>
          </View>
        )}
      </View>
      
      <View className="ml-8 mb-4">
        <Text className="text-black font-medium mb-1">{address.fullName}</Text>
        <Text className="text-text-secondary text-sm leading-5 mb-1">{address.streetAddress}</Text>
        <Text className="text-text-secondary text-sm mb-1">
          {address.city}, {address.state} {address.zipCode}
        </Text>
        <Text className="text-text-secondary text-sm">{address.phoneNumber}</Text>
      </View>

      <View className="flex-row border-t border-[#F0F0F0] pt-4 gap-4">
        <TouchableOpacity
          className="flex-1 border border-[#E5E5E5] py-2.5 rounded-lg items-center"
          activeOpacity={0.7}
          onPress={() => onEdit(address)}
          disabled={isUpdatingAddress}
        >
          <Text className="text-black text-sm font-medium">Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="flex-1 border border-[#E5E5E5] py-2.5 rounded-lg items-center"
          activeOpacity={0.7}
          onPress={() => onDelete(address._id, address.label)}
          disabled={isDeletingAddress}
        >
          <Text className="text-[#CC0000] text-sm font-medium">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
