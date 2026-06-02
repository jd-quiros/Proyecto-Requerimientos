import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToggleTema } from '../components/ToggleTema';
import { useAuth } from '../context/AuthContext';
import { CrearTiendaModal } from '../components/CrearTiendaModal';
import api from '../services/api';


export function Inicio() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [tiendas, setTiendas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    api.get('/tiendas')
      .then(res => setTiendas(res.data))
      .catch(err => console.error('Error al cargar tiendas:', err))
      .finally(() => setCargando(false));
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Barra superior */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Silk Road
          </h1>

          <div className="flex items-center gap-4">
            <ToggleTema />
              {usuario ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {usuario.nombre}
                  </span>

                  {usuario.rol === "cliente" && (
                    <button
                      onClick={() => navigate("/carrito")}
                      className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                    >
                      Carrito
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
              <Link
                to="/login"
                className="text-sm text-black dark:text-white font-medium hover:underline"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="container mx-auto px-4 py-12">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Silk Road
          </h2>

          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Descubre las mejores tiendas con productos únicos. Explora nuestras colecciones de tecnología, hogar y más.
          </p>

<button
  onClick={() => setMostrarModal(true)}
  className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer"
>
  Crear Tienda
</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiendas.map((tienda) => (
            <Link
              key={tienda.id}
              to={`/tienda/${tienda.id}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">

                <div className="aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {tienda.imagen ? (
                    <img
                      src={tienda.imagen}
                      alt={tienda.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {tienda.nombre}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {tienda.descripcion || 'Sin descripción'}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                      {tienda.categoria}
                    </span>

                    <span className="text-sm font-medium text-black dark:text-white flex items-center gap-1">
                      Ver Productos

                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

        {tiendas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No hay tiendas disponibles en este momento.
            </p>
          </div>
        )}

      </main>

      {mostrarModal && (
    <CrearTiendaModal
      onClose={() => setMostrarModal(false)}
      onTiendaCreada={(nuevaTienda) => {
        setTiendas(prev => [...prev, nuevaTienda]);
      }}
    />
      )}

    </div>
  );
}