import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ToggleTema } from './ToggleTema';
import api from '../services/api';

export function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const { t, idioma, toggleIdioma } = useLanguage();
  const navigate = useNavigate();
  const [tiendaId, setTiendaId] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (usuario?.rol === 'vendedor') {
      api.get('/mis-tiendas')
        .then(res => { if (res.data[0]) setTiendaId(res.data[0].id); })
        .catch(() => {});
    }
    if (usuario?.rol === 'cliente') {
      api.get('/carrito')
        .then(res => setCartCount(res.data.reduce((acc, item) => acc + item.cantidad, 0)))
        .catch(() => {});
    }
  }, [usuario]);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="text-lg font-bold text-gray-900 dark:text-white shrink-0">
          Silk Road
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Idioma + Tema */}
          <button
            onClick={toggleIdioma}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            {idioma === 'es' ? 'EN' : 'ES'}
          </button>
          <ToggleTema />

          {usuario ? (
            <>
              <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

              {/* Nombre (solo pantallas medianas en adelante) */}
              <span className="hidden md:block text-sm text-gray-600 dark:text-gray-400 max-w-[120px] truncate">
                {usuario.nombre}
              </span>

              {/* Perfil */}
              <Link
                to="/perfil"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {t('home.profile')}
              </Link>

              {/* Carrito + Pedidos (solo clientes) */}
              {usuario.rol === 'cliente' && (
                <>
                  <button
                    onClick={() => navigate('/carrito')}
                    className="relative flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    <span className="hidden sm:inline">{t('home.cart')}</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </button>
                  <Link
                    to="/historial"
                    className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    {t('home.orderHistory')}
                  </Link>
                </>
              )}

              {/* Mi Tienda (solo vendedores con tienda) */}
              {usuario.rol === 'vendedor' && tiendaId && (
                <button
                  onClick={() => navigate(`/tienda/${tiendaId}`)}
                  className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition cursor-pointer shrink-0"
                >
                  {t('home.myStore')}
                </button>
              )}

              {/* Panel Admin */}
              {usuario.rol === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition shrink-0"
                >
                  {idioma === 'es' ? 'Panel Admin' : 'Admin Panel'}
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 dark:text-red-400 hover:underline cursor-pointer px-2 py-1"
              >
                {t('home.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-black dark:text-white hover:underline"
            >
              {idioma === 'es' ? 'Iniciar Sesión' : 'Sign In'}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
