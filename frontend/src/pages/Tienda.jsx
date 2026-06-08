import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CrearProductoModal } from '../components/CrearProductoModal';
import { EditarTiendaModal } from '../components/EditarTiendaModal';

function PedidosInline({ t, idioma }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/mis-pedidos')
      .then(r => setPedidos(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="text-gray-500 dark:text-gray-400 py-4">{t('home.loading')}</p>;
  if (pedidos.length === 0) return <p className="text-gray-500 dark:text-gray-400 py-4">{t('storeOrders.empty')}</p>;

  return (
    <div className="mt-4 space-y-4">
      {pedidos.map(p => (
        <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex flex-wrap justify-between gap-2 mb-3">
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">{t('storeOrders.order')} #{p.id}</span>
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{new Date(p.fecha).toLocaleDateString()}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">₡{p.total_tienda.toLocaleString('es-CR')}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('storeOrders.buyer')}: <strong>{p.comprador_nombre}</strong> — {p.comprador_email}</p>
          <ul className="mt-2 space-y-1">
            {p.productos.map((prod, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex justify-between">
                <span>{prod.nombre} × {prod.cantidad}</span>
                <span>₡{prod.subtotal.toLocaleString('es-CR')}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function DashboardTienda({ t }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/mi-tienda/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <p className="text-gray-500 dark:text-gray-400 py-8">{t('home.loading')}</p>;

  if (stats.revenue_total === 0 && stats.total_pedidos === 0) {
    return <p className="text-gray-500 dark:text-gray-400 py-8">{t('storeDashboard.noSales')}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">{t('storeDashboard.revenue')}</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300 mt-1">
            ₡{stats.revenue_total.toLocaleString('es-CR', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">
          <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">{t('storeDashboard.orders')}</p>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-1">{stats.total_pedidos}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5">
          <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">{t('storeDashboard.bestProduct')}</p>
          <p className="text-lg font-bold text-purple-800 dark:text-purple-300 mt-1 truncate">
            {stats.mejor_producto?.nombre || '—'}
          </p>
          {stats.mejor_producto && (
            <p className="text-xs text-purple-600 dark:text-purple-400">{stats.mejor_producto.unidades} {t('storeDashboard.units')}</p>
          )}
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5">
          <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">{t('storeDashboard.lowStock')}</p>
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mt-1">{stats.stock_bajo.length}</p>
        </div>
      </div>

      {stats.stock_bajo.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-5">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">{t('storeDashboard.lowStock')} ({t('storeDashboard.stockWarning')})</h4>
          <ul className="space-y-1">
            {stats.stock_bajo.map((p, i) => (
              <li key={i} className="flex justify-between text-sm text-yellow-700 dark:text-yellow-400">
                <span>{p.nombre}</span>
                <span className="font-medium">{p.stock} {t('storeDashboard.units')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Tienda() {
  const { id } = useParams();
  const { t, idioma } = useLanguage();
  const { usuario } = useAuth();
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [tab, setTab] = useState('productos');
  const [mostrarEditarTienda, setMostrarEditarTienda] = useState(false);

  const abrirEdicion = (producto) => {
  setProductoEditar(producto);
  setMostrarModalProducto(true);
  };

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
      <Navbar />

      {/* Banner de estado para el dueño */}
      {esDueno && tienda.estado === 'pendiente' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700">
          <div className="container mx-auto px-4 py-3 text-center text-yellow-800 dark:text-yellow-300 text-sm font-medium">
            {t('store.pendingBanner')}
          </div>
        </div>
      )}
      {esDueno && tienda.estado === 'suspendida' && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700">
          <div className="container mx-auto px-4 py-3 text-center text-red-800 dark:text-red-300 text-sm font-medium">
            {t('store.suspendedBanner')}
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tienda.nombre}</h1>
                {esDueno && (
                  <button
                    onClick={() => setMostrarEditarTienda(true)}
                    className="text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                  >
                    {idioma === 'es' ? 'Editar' : 'Edit'}
                  </button>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{tienda.descripcion || ''}</p>
              <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                {tienda.categoria} · {productos.length} {idioma === 'es' ? 'productos' : 'products'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + contenido */}
      <main className="container mx-auto px-4 py-8">

        {/* Tab bar (solo para el dueño) */}
        {esDueno && (
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTab('productos')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition cursor-pointer ${
                tab === 'productos'
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {idioma === 'es' ? 'Productos' : 'Products'}
            </button>
            <button
              onClick={() => setTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition cursor-pointer ${
                tab === 'dashboard'
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setTab('pedidos')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition cursor-pointer ${
                tab === 'pedidos'
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {idioma === 'es' ? 'Pedidos recibidos' : 'Received Orders'}
            </button>
          </div>
        )}

        {/* Dashboard tab */}
        {esDueno && tab === 'dashboard' && <DashboardTienda t={t} />}

        {/* Pedidos tab — redirige a la página existente */}
        {esDueno && tab === 'pedidos' && (
          <div className="py-4">
            <Link
              to="/mis-pedidos"
              className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {idioma === 'es' ? 'Ver página de pedidos completa' : 'View full orders page'} →
            </Link>
            <PedidosInline t={t} idioma={idioma} />
          </div>
        )}

        {/* Productos tab (o visitante) */}
        {(!esDueno || tab === 'productos') && (
          <div>
            {esDueno && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setMostrarModal(true)}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm cursor-pointer"
                >
                  + {idioma === 'es' ? 'Nuevo Producto' : 'New Product'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.map((producto) => (
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{producto.descripcion || ''}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">₡{Number(producto.precio || 0).toFixed(2)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${producto.stock > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {producto.stock > 0 ? `${producto.stock} disp.` : (idioma === 'es' ? 'Agotado' : 'Sold out')}
                        </span>
                      </div>
                      {esDueno && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={(e) => { e.preventDefault(); abrirEdicion(producto); }}
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                          >
                            {idioma === 'es' ? 'Editar' : 'Edit'}
                          </button>
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              if (!confirm(idioma === 'es' ? '¿Eliminar producto?' : 'Delete product?')) return;
                              try {
                                await api.delete(`/productos/${producto.id}`);
                                setProductos(productos.filter(p => p.id !== producto.id));
                              } catch { alert('Error eliminando'); }
                            }}
                            className="flex-1 bg-red-500 text-white rounded-lg py-1.5 text-sm hover:bg-red-600 transition cursor-pointer"
                          >
                            {idioma === 'es' ? 'Eliminar' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {productos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {idioma === 'es' ? 'Esta tienda aún no tiene productos.' : 'This store has no products yet.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

    {mostrarModal && (
      <CrearProductoModal
        tiendaId={tienda.id}
        onClose={() => setMostrarModal(false)}
        onProductoCreado={(nuevoProducto) => {
          setProductos((prev) => [...prev, nuevoProducto]);
        }}
      />
    )}

    {mostrarEditarTienda && (
      <EditarTiendaModal
        tienda={tienda}
        onClose={() => setMostrarEditarTienda(false)}
        onTiendaActualizada={(actualizada) => {
          setTienda(actualizada);
          setMostrarEditarTienda(false);
        }}
      />
    )}

    {
      mostrarModalProducto && (
        <CrearProductoModal
          productoEditar={productoEditar}
          onClose={() => {
            setMostrarModalProducto(false);
            setProductoEditar(null);
          }}
          onProductoActualizado={(productoActualizado) => {

            setProductos(
              productos.map((p) =>
                p.id === productoActualizado.id
                  ? productoActualizado
                  : p
              )
            );

            setMostrarModalProducto(false);
            setProductoEditar(null);
          }}
        />
      )
    }

    </div>
  );
}
