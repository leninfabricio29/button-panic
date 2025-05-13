// app/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isAuthenticated: boolean;
  user: any | null;
  setUser: React.Dispatch<React.SetStateAction<any | null>>; // 👈 NUEVO
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

// Valor por defecto del contexto
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  setUser: () => {}, // ✅ función vacía como placeholder
  login: async () => {},
  logout: async () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('auth-token');
        const userData = await AsyncStorage.getItem('user-data');
        
        console.log('Token disponible:', !!token);
        console.log('User data disponible:', !!userData);
        
        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
      }
    };
    
    checkToken();
  }, []);

  const login = async () => {
    try {
      const userData = await AsyncStorage.getItem('user-data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth-token');
      await AsyncStorage.removeItem('user-data');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Valores que se proveerán a través del contexto
  const value = {
    isAuthenticated,
    user,
    setUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);   