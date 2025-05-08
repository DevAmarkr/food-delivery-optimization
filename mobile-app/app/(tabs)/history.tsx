import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const screenHeight = Dimensions.get('window').height;

export default function HistoryScreen() {
  const router = useRouter();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    onTimeRate: 0,
    avgDeliveryMins: 0,
  });
  const [orders, setOrders] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        const id = await AsyncStorage.getItem('driver_id');
        if (!id) {
          router.replace('/login');
          return;
        }
        setDriverId(id);
  
        try {
          const res = await axios.get(`http://192.168.0.201:4000/api/driver/${id}/history`);
          setSummary(res.data.summary);
          setOrders(res.data.orders || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchHistory();
    }, [])
  );
  

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-orange-500 px-4 py-6">
      {/* Header */}
      <Text className="text-2xl font-bold mb-4 text-center">Delivery History</Text>

      {/* Summary Cards */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-blue-100 px-4 py-3 rounded-lg w-[30%]">
          <Text className="text-sm text-gray-600">Total</Text>
          <Text className="text-xl font-bold text-blue-700">{summary.total}</Text>
        </View>
        <View className="bg-green-100 px-4 py-3 rounded-lg w-[30%]">
          <Text className="text-sm text-gray-600">On-Time</Text>
          <Text className="text-xl font-bold text-green-700">{summary.onTimeRate}%</Text>
        </View>
        <View className="bg-yellow-100 px-4 py-3 rounded-lg w-[30%]">
          <Text className="text-sm text-gray-600">Avg Time</Text>
          <Text className="text-xl font-bold text-yellow-700">{summary.avgDeliveryMins} min</Text>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        scrollEnabled={false}
        data={orders}
        keyExtractor={(item: any) => item.order_id}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-4 mb-3 rounded-lg">
            <Text className="font-bold text-base">#{item.order_id} - {item.product_type}</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Delivered at: {new Date(item.delivered_at).toLocaleTimeString()}
            </Text>
            <Text className="text-sm text-gray-600">
              Deadline: {new Date(item.delivery_deadline).toLocaleTimeString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-6">No deliveries yet.</Text>
        }
      />
    </ScrollView>
  );
}
