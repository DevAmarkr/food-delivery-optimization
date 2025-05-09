import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, Image } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import SERVER_URL from "@/config";
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email) return Alert.alert("Email is required");

    try {
    const res = await axios.post(`${SERVER_URL}/api/driver/login`, {
      email,
      name,
    });
    console.log(res.data,'RES DATA');

      const { driver_id, message } = res.data;
      await AsyncStorage.setItem("driver_id", driver_id);

      Alert.alert(message || "Login successful");
      router.push("/"); // move to next screen
    } catch (err: any) {
      console.error(err);
      Alert.alert("Login failed", err.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
        <View>
      <Image
        source={require('../../assets/images/dm.jpg')}
        style={{ width: 200, height: 200 }}
      />
    </View>
      <Text className="text-2xl font-bold mb-6">Driver Login</Text>

      <TextInput
        className="border border-gray-300 w-full p-3 rounded mb-3"
        placeholder="Name (optional)"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="border border-gray-300 w-full p-3 rounded mb-5"
        placeholder="Email"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <Pressable onPress={handleLogin} className="bg-blue-600 px-6 py-3 rounded">
        <Text className="text-white font-semibold text-base">Login / Register</Text>
      </Pressable>
    </View>
  );
}
