import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { api } from '../service/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [pets, setPets] = useState([]);
  const [user, setUser] = useState(null);
  const petsLoaded      = useRef(false);
  const userRef         = useRef(null);

  const loadPets = useCallback(async (force = false) => {
    if (petsLoaded.current && !force) return pets;
    const data = await api.getPets();
    setPets(data);
    petsLoaded.current = true;
    return data;
  }, [pets]);

  const loadUser = useCallback(async (force = false) => {
    if (userRef.current && !force) return userRef.current;
    const data = await api.getUser();
    userRef.current = data;
    setUser(data);
    return data;
  }, []);

  const invalidate = useCallback(() => {
    petsLoaded.current = false;
    userRef.current    = null;
    setPets([]);
    setUser(null);
  }, []);

  return (
    <AppContext.Provider value={{ pets, user, loadPets, loadUser, invalidate }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
