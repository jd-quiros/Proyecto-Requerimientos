import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export function Explorar() {
  const { t, idioma } = useLanguage();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState('');
  const [orden, setOrden] = useState('');

  useEffect(() => {
    api.get('/productos')
      .then(res => setProductos(res.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const categorias = useMemo(
    () => [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort(),
    [productos]
  );

  const visibles = useMemo(() => {
    let lista = categoria ? productos.filter(p => p.categoria === categoria) : [...productos];
    if (orden === 'az')          lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    else if (orden === 'za')     lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
    else if (orden === 'precio-asc')  lista.sort((a, b) => a.precio - b.precio);
    else if (orden === 'precio-desc') lista.sort((a, b) => b.precio - a.precio);
    return lista;
  }, [productos, categoria, orden]);

  const selectClass = "text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-10">

        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {idioma === 'es' ? 'Explorar productos' : 'Explore products'}
            </h2>
            {!cargando && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {visibles.length} {idioma === 'es' ? 'productos' : 'products'}
                {categoria ? ` · ${categoria}` : ''}
              </p>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <select value={categoria} onChange={e => setCategoria(e.target.value)} className={selectClass}>
              <option value="">{t('home.allCategories')}</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={orden} onChange={e => setOrden(e.target.value)} className={selectClass}>
              <option value="">{idioma === 'es' ? 'Sin orden' : 'Default'}</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="precio-asc">{idioma === 'es' ? 'Precio: menor primero' : 'Price: low to high'}</option>
              <option value="precio-desc">{idioma === 'es' ? 'Precio: mayor primero' : 'Price: high to low'}</option>
            </select>

            {(categoria || orden) && (
              <button
                onClick={() => { setCategoria(''); setOrden(''); }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                ✕ {idioma === 'es' ? 'Limpiar' : 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {cargando ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">{t('home.loading')}</p>
        ) : visibles.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">{t('home.noResults')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {visibles.map(producto => (
              <Link key={producto.id} to={`/producto/${producto.id}`} className="group">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{producto.nombre}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{producto.tienda_nombre}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        ₡{Number(producto.precio || 0).toLocaleString('es-CR')}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        producto.stock > 0
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {producto.stock > 0 ? `${producto.stock}` : (idioma === 'es' ? 'Agotado' : 'Out')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
