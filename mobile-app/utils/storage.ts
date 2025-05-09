// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const ROUTE_CACHE_KEY = 'cached_routes';

export const saveRoutesToCache = async (routes: any[]) => {
  try {
    await AsyncStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(routes));
  } catch (error) {
    console.error('Error saving routes:', error);
  }
};

export const getRoutesFromCache = async (): Promise<any[]> => {
  try {
    const json = await AsyncStorage.getItem(ROUTE_CACHE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error reading cached routes:', error);
    return [];
  }
};
