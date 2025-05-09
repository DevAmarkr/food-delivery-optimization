import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import SERVER_URL from '@/config';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  Alert,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import LogoutButton from '@/components/Logout';

const screenHeight = Dimensions.get('window').height;

export default function ActiveOrdersScreen() {
  const router = useRouter();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const id = await AsyncStorage.getItem('driver_id');
        if (!id) {
          router.replace('/login');
          return;
        }
  
        setDriverId(id);
  
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required.');
          return;
        }
  
        const location = await Location.getCurrentPositionAsync({});
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;
        setDriverLocation({ lat, lng });
  
        try {
          const res = await axios.post(`${SERVER_URL}/api/driver/${id}/active-route`);
          setOrders(res.data?.optimizedDeliveryRoute || []);
        } catch (err) {
          console.error(err);
          Alert.alert('Failed to load route');
          setOrders([]);
        } finally {
          setLoading(false);
        }
      };
  
      init();
    }, [])
  );
  

  const handleDeliveryComplete = async (orderId: string) => {
    try {
      await axios.post(`${SERVER_URL}/api/order/${orderId}/complete`);
      setOrders((prev) => prev.filter((o: any) => o.order_id !== orderId));
      Alert.alert("Success ✅", `Order ${orderId} marked as delivered`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error ❌", "Failed to mark as delivered");
    }
  };

  if (loading || !driverLocation) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-orange-500">
      <LogoutButton />
      <MapView
        style={{ height: screenHeight * 0.4 }}
        initialRegion={{
          latitude: driverLocation.lat,
          longitude: driverLocation.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Driver marker */}
        <Marker
          coordinate={{
            latitude: driverLocation.lat,
            longitude: driverLocation.lng,
          }}
          title="You (Driver)"
          pinColor="blue"
        />

        {/* Customer delivery pins */}
        {Array.isArray(orders) && orders.map((order: any) => (
          <Marker
            key={order.order_id}
            coordinate={{
              latitude: order.customer_lat,
              longitude: order.customer_long,
            }}
            title={`#${order.order_id} - ${order.product_type}`}
            description={`ETA: ${order.duration}`}
            pinColor="green"
          />
        ))}
      </MapView>

      {/* Order List or empty message */}
      {orders.length > 0 ? (
        <FlatList
          className="p-4"
          data={orders}
          keyExtractor={(item: any) => item.order_id}
          renderItem={({ item }) => (
            <View className="bg-gray-100 p-4 mb-3 rounded">
              <Text className="font-bold text-base">#{item.order_id} - {item.product_type}</Text>
              <Text className="text-sm">ETA: {item.duration} | Distance: {item.distance}</Text>

              <Pressable
                onPress={() => handleDeliveryComplete(item.order_id)}
                className="bg-green-600 px-4 py-2 mt-3 rounded"
              >
                <Text className="text-white text-center font-semibold">Mark as Delivered</Text>
              </Pressable>
            </View>
          )}
        />
      ) : (
        <View className="px-4">
          <Text className="text-center text-white mt-4">
            No active orders to deliver.
          </Text>
        </View>
      )}
    </View>
  );
}
