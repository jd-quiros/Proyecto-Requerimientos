import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CrearTiendaModal } from '../components/CrearTiendaModal';
import api from '../services/api';

export function Inicio() {
  const { usuario } = useAuth();
  const { t, idioma } = useLanguage();
  const navigate = useNavigate();

  const [tiendas, setTiendas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [miTienda, setMiTienda] = useState(null);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [notifVisible, setNotifVisible] = useState(true);

  // búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [busquedaActiva, setBusquedaActiva] = useState(false);

  useEffect(() => {
    api.get('/tiendas')
      .then(res => setTiendas(res.data))
      .catch(err => console.error('Error al cargar tiendas:', err))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (usuario?.rol === 'vendedor') {
      api.get('/mis-tiendas')
        .then(res => setMiTienda(res.data[0] || null))
        .catch(() => {});
      api.get('/mis-pedidos')
        .then(res => setTotalPedidos(res.data.length))
        .catch(() => {});
    }
  }, [usuario]);

  const categorias = [...new Set(tiendas.map(t => t.categoria).filter(Boolean))];

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busqueda.trim() && !categoriaFiltro) return;
    setBuscando(true);
    setBusquedaActiva(true);
    try {
      const params = new URLSearchParams();
      if (busqueda.trim()) params.append('busqueda', busqueda.trim());
      if (categoriaFiltro) params.append('categoria', categoriaFiltro);
      const res = await api.get(`/productos?${params.toString()}`);
      setResultados(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setBuscando(false);
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setCategoriaFiltro('');
    setBusquedaActiva(false);
    setResultados([]);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">{t('home.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-10">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {t('home.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          <Link
            to="/explorar"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {idioma === 'es' ? 'Explorar todos los productos' : 'Explore all products'}
          </Link>
        </div>

        {/* Barra de búsqueda */}
        <form onSubmit={handleBuscar} className="max-w-2xl mx-auto mb-10 flex gap-2">
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          <select
            value={categoriaFiltro}
            onChange={e => setCategoriaFiltro(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">{t('home.allCategories')}</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition cursor-pointer shrink-0"
          >
            {t('home.search')}
          </button>
          {busquedaActiva && (
            <button
              type="button"
              onClick={limpiarBusqueda}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              ✕
            </button>
          )}
        </form>

        {/* Resultados de búsqueda */}
        {busquedaActiva ? (
          <>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.searchResults')}
            </h3>
            {buscando ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('home.loading')}</p>
            ) : resultados.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('home.noResults')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {resultados.map(producto => (
                  <Link key={producto.id} to={`/producto/${producto.id}`} className="group">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {producto.imagen ? (
                          <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{producto.nombre}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{producto.tienda_nombre}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">₡{Number(producto.precio || 0).toFixed(2)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${producto.stock > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                            {producto.stock > 0 ? `${producto.stock} disp.` : (idioma === 'es' ? 'Agotado' : 'Sold out')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Botón crear tienda — solo vendedores sin tienda */}
            {usuario?.rol === 'vendedor' && !miTienda && (
              <div className="text-center mb-8">
                <button
                  onClick={() => setMostrarModal(true)}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                >
                  {t('home.createStore')}
                </button>
              </div>
            )}

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('home.stores')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiendas.map((tienda) => (
                <Link key={tienda.id} to={`/tienda/${tienda.id}`} className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {tienda.imagen ? (
                        <img src={tienda.imagen} alt={tienda.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{tienda.nombre}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {tienda.descripcion || (idioma === 'es' ? 'Sin descripción' : 'No description')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          {tienda.categoria}
                        </span>
                        <span className="text-sm font-medium text-black dark:text-white flex items-center gap-1">
                          {idioma === 'es' ? 'Ver Productos' : 'View Products'}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                  {idioma === 'es' ? 'No hay tiendas disponibles.' : 'No stores available.'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {mostrarModal && (
        <CrearTiendaModal
          onClose={() => setMostrarModal(false)}
          onTiendaCreada={(nuevaTienda) => setMiTienda(nuevaTienda)}
        />
      )}

      {/* Notificación de pedidos — solo vendedores */}
      {usuario?.rol === 'vendedor' && totalPedidos > 0 && notifVisible && (
        <div className="fixed bottom-5 right-5 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 max-w-xs w-full flex items-start gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg shrink-0">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {idioma === 'es' ? 'Pedidos recibidos' : 'Orders received'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {idioma === 'es'
                ? `Tienes ${totalPedidos} pedido${totalPedidos !== 1 ? 's' : ''} en tu tienda`
                : `You have ${totalPedidos} order${totalPedidos !== 1 ? 's' : ''} in your store`}
            </p>
            <Link
              to="/mis-pedidos"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
            >
              {idioma === 'es' ? 'Ver pedidos →' : 'View orders →'}
            </Link>
          </div>
          <button
            onClick={() => setNotifVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
