import { Pressable, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('driver_id');
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <Pressable
    onPress={handleLogout}
    style={{
      position: 'absolute',
      top: 0,
      right: 20,
      backgroundColor: 'red',
      padding: 10,
      borderRadius: 8,
      zIndex: 100,
    }}
  >
    <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
  </Pressable>
  );
}
