import * as SecureStore from 'expo-secure-store';

export const saveToken  = (token) => SecureStore.setItemAsync('access_token', token);
export const getToken   = ()      => SecureStore.getItemAsync('access_token');
export const clearToken = ()      => SecureStore.deleteItemAsync('access_token');
