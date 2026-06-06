import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ToggleTema } from '../components/ToggleTema';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CrearProductoModal } from '../components/CrearProductoModal';

export function Tienda() {
  const { id } = useParams();
  const { t, idioma, toggleIdioma } = useLanguage();
  const { usuario, cerrarSesion } = useAuth();
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    api.get(`/tiendas/${id}`)
      .then(res => {
        setTienda(res.data);
        setProductos(res.data.productos || []);
      })
      .catch(err => console.error('Error al cargar tienda:', err))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">{t('home.loading')}</p>
      </div>
    );
  }

  if (!tienda) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-gray-900 dark:text-white mb-4">
            {idioma === 'es' ? 'Tienda no encontrada' : 'Store not found'}
          </h2>
          <Link to="/" className="text-black dark:text-white font-medium hover:underline">
            {idioma === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
        </div>
      </div>
    );
  }
  const esDueno = usuario && usuario.id === tienda.vendedor_id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barra superior */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white hover:underline">
            Silk Road
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleIdioma}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
            >
              {idioma === 'es' ? 'EN' : 'ES'}
            </button>
            <ToggleTema />
            <span className="text-sm text-gray-600 dark:text-gray-400">{usuario?.nombre}</span>
            <button
              onClick={() => {
                cerrarSesion();
                window.location.href = '/login';
              }}
              className="text-sm text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            >
              {t('home.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Info de la tienda */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {idioma === 'es' ? 'Volver a tiendas' : 'Back to stores'}
          </Link>
          <div className="flex items-start gap-6">
            {/* Imagen de la tienda */}
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {tienda.imagen ? (
                <img src={tienda.imagen} alt={tienda.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tienda.nombre}</h1>
              <p className="text-gray-600 dark:text-gray-400">{tienda.descripcion || ''}</p>
              <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                {tienda.categoria} · {productos.length} {idioma === 'es' ? 'productos' : 'products'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <main className="container mx-auto px-4 py-12">

      <div className="flex justify-between items-center mb-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {idioma === 'es' ? 'Productos' : 'Products'}
        </h2>

      </div>

        {esDueno && (
          <button
            onClick={() => setMostrarModal(true)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            + Nuevo Producto
          </button>
        )}

      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <Link
              key={producto.id}
              to={`/producto/${producto.id}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Imagen del producto */}
                <div className="aspect-square overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Info del producto */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{producto.nombre}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {producto.descripcion || ''}
                  </p>
                  <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₡{Number(producto.precio || 0).toFixed(2)}
                  </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      producto.stock > 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {producto.stock > 0
                        ? `${producto.stock} disp.`
                        : (idioma === 'es' ? 'Agotado' : 'Sold out')
                      }
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {productos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {idioma === 'es'
                ? 'Esta tienda aún no tiene productos.'
                : 'This store has no products yet.'
              }
            </p>
          </div>
        )}
      </main>

    {mostrarModal && (
      <CrearProductoModal
        tiendaId={tienda.id}
        onClose={() => setMostrarModal(false)}
        onProductoCreado={(nuevoProducto) => {
          setProductos((prev) => [
            ...prev,
            nuevoProducto
          ]);
        }}
      />
    )}

    </div>
  );
}
