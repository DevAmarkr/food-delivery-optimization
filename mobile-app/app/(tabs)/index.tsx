import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import SERVER_URL from '@/config';
import LogoutButton from '@/components/Logout';

const ROUTE_CACHE_KEY = 'cached_routes';

export default function HomeScreen() {
  const router = useRouter();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const fetchAndCacheOrders = async (id: string) => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/driver/${id}/route`);
      const fetchedOrders = res.data.optimizedRoute;
      setOrders(fetchedOrders);
      await AsyncStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(fetchedOrders));
    } catch (err) {
      console.error('Order fetch failed:', err);
      Alert.alert('Failed to load orders from API. Showing cached data.');
      const cached = await AsyncStorage.getItem(ROUTE_CACHE_KEY);
      if (cached) {
        setOrders(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkNetworkAndLoad = async () => {
      const netState = await NetInfo.fetch();
      setIsOnline(!!netState.isConnected);

      const id = await AsyncStorage.getItem('driver_id');
      if (!id) {
        router.replace('/login');
        return;
      }

      setDriverId(id);

      if (netState.isConnected) {
        await fetchAndCacheOrders(id);
      } else {
        const cached = await AsyncStorage.getItem(ROUTE_CACHE_KEY);
        if (cached) {
          setOrders(JSON.parse(cached));
        }
        setLoading(false);
      }
    };

    checkNetworkAndLoad();

    const unsubscribe = NetInfo.addEventListener(state => {
      const status = !!state.isConnected;
      setIsOnline(status);
      if (status && driverId) {
        fetchAndCacheOrders(driverId);
      }
    });

    return () => unsubscribe();
  }, []);

  const acceptOrder = async (orderId: string) => {
    try {
      await axios.post(`${SERVER_URL}/api/order/${orderId}/accept`, {
        driver_id: driverId
      });
      setOrders((prev) => prev.filter((o: any) => o.order_id !== orderId));
      Alert.alert("Order accepted ✅");
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to accept order ❌");
    }
  };

  const rejectOrder = async (orderId: string) => {
    try {
      await axios.post(`${SERVER_URL}/api/order/${orderId}/reject`);
      setOrders((prev) => prev.filter((o: any) => o.order_id !== orderId));
      Alert.alert("Order rejected ❌");
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to reject order");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-orange-500 p-4">
      <LogoutButton />
      <View className="items-center mb-4 mt-5">
        <Text className="text-2xl font-bold">Food-Delivery Optimizer</Text>
        {!isOnline && (
          <Text className="text-white mt-1 text-sm">⚠️ Offline mode – showing cached orders</Text>
        )}
      </View>

      {orders.length === 0 ? (
        <Text>No orders assigned yet.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item: any) => item.order_id}
          renderItem={({ item }) => (
            <View className="bg-gray-100 p-4 mb-3 rounded">
              <Text className="font-bold text-base">#{item.order_id} - {item.product_type}</Text>
              <Text className="text-sm mb-1">ETA: {item.duration} | Distance: {item.distance}</Text>
              <Text>Score: {item.score.toFixed(3)}</Text>
              <View className="flex-row justify-between mt-3 space-x-1">
                <Pressable
                  onPress={() => acceptOrder(item.order_id)}
                  className="bg-green-600 flex-1 py-2 mr-2 rounded"
                >
                  <Text className="text-white text-center font-semibold">Accept</Text>
                </Pressable>

                <Pressable
                  onPress={() => rejectOrder(item.order_id)}
                  className="bg-red-500 flex-1 py-2 rounded"
                >
                  <Text className="text-white text-center font-semibold">Reject</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
