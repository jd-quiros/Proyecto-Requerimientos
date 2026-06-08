import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function Producto() {
  const { id } = useParams();
  const { t, idioma } = useLanguage();
  const { usuario } = useAuth();
  const [producto, setProducto] = useState(null);
  const [tienda, setTienda] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(res => {
        setProducto(res.data);
        setTienda(res.data.tienda || null);
      })
      .catch(err => console.error('Error al cargar producto:', err))
      .finally(() => setCargando(false));
  }, [id]);
  const agregarAlCarrito = async () => {
    console.log("BOTON PRESIONADO");

    try {
      const res = await api.post(
        `/agregar/${producto.id}`,
        { cantidad }
      );

      console.log("RESPUESTA:", res.data);
    } catch (err) {
      console.log(err.response);
      console.error(err);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">{t('home.loading')}</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-gray-900 dark:text-white mb-4">
            {idioma === 'es' ? 'Producto no encontrado' : 'Product not found'}
          </h2>
          <Link to="/" className="text-black dark:text-white font-medium hover:underline">
            {idioma === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Volver a la tienda */}
        {tienda && (
          <Link
            to={`/tienda/${tienda.id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {idioma === 'es' ? 'Volver a ' : 'Back to '}{tienda.nombre}
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagen del producto */}
          <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {producto.imagen ? (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            {/* Link a la tienda */}
            {tienda && (
              <Link
                to={`/tienda/${tienda.id}`}
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {tienda.nombre}
              </Link>
            )}

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{producto.nombre}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{producto.descripcion || ''}</p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${producto.precio.toFixed(2)}
              </span>
              <span className={`text-sm px-3 py-1 rounded-full ${
                producto.stock > 0
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {producto.stock > 0
                  ? `${producto.stock} ${idioma === 'es' ? 'disponibles' : 'available'}`
                  : (idioma === 'es' ? 'Agotado' : 'Sold out')
                }
              </span>
            </div>

            {producto.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {idioma === 'es' ? 'Cantidad' : 'Quantity'}
                  </label>
                  <input
                    id="cantidad"
                    type="number"
                    min="1"
                    max={producto.stock}
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1)))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <button
                  onClick={agregarAlCarrito}
                  className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                    />
                  </svg>
                  {idioma === 'es' ? 'Agregar al Carrito' : 'Add to Cart'}
                </button>
              </div>
            )}

            {producto.stock === 0 && (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {idioma === 'es' ? 'Este producto está agotado' : 'This product is sold out'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
