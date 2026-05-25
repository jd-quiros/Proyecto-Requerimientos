import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(false);
  }, []);

  const iniciarSesion = async (email, password) => {
    try {
      const response = await api.login({ email, password });
      const { token: nuevoToken, usuario: datosUsuario } = response.data;
      localStorage.setItem('token', nuevoToken);
      setToken(nuevoToken);
      setUsuario(datosUsuario);
      return { exito: true };
    } catch (error) {
      return {
        exito: false,
        error: error.response?.data?.error || 'Error al iniciar sesión',
      };
    }
  };

  const registrarUsuario = async (nombre, email, password) => {
    try {
      const response = await api.registrar({ nombre, email, password });
      const { token: nuevoToken, usuario: datosUsuario } = response.data;
      localStorage.setItem('token', nuevoToken);
      setToken(nuevoToken);
      setUsuario(datosUsuario);
      return { exito: true };
    } catch (error) {
      return {
        exito: false,
        error: error.response?.data?.error || 'Error al registrarse',
      };
    }
  };

  const cerrarSesion = async () => {
    try {
      await api.logout();
    } catch (error) {
      // No importa si falla
    }
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  const valor = {
    usuario,
    token,
    cargando,
    iniciarSesion,
    registrarUsuario,
    cerrarSesion,
    estaAutenticado: !!token,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
