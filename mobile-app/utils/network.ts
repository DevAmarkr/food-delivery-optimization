// utils/network.ts
import NetInfo from '@react-native-community/netinfo';

export const subscribeToNetwork = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener(state => {
    callback(!!state.isConnected);
  });
};

export const getCurrentNetworkStatus = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return !!state.isConnected;
};
