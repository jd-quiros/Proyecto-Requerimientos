import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export function EditarTiendaModal({ tienda, onClose, onTiendaActualizada }) {
  const { idioma } = useLanguage();
  const [nombre, setNombre]           = useState(tienda.nombre || '');
  const [descripcion, setDescripcion] = useState(tienda.descripcion || '');
  const [categoria, setCategoria]     = useState(tienda.categoria || '');
  const [imagen, setImagen]           = useState(tienda.imagen || '');
  const [guardando, setGuardando]     = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      const res = await api.put(`/tiendas/${tienda.id}`, { nombre, descripcion, categoria, imagen });
      onTiendaActualizada(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || (idioma === 'es' ? 'Error al guardar' : 'Error saving'));
    } finally {
      setGuardando(false);
    }
  };

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm";
  const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {idioma === 'es' ? 'Editar tienda' : 'Edit store'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>{idioma === 'es' ? 'Nombre' : 'Name'}</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{idioma === 'es' ? 'Descripción' : 'Description'}</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>{idioma === 'es' ? 'Categoría' : 'Category'}</label>
            <input
              type="text"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{idioma === 'es' ? 'URL de imagen' : 'Image URL'}</label>
            <input
              type="url"
              value={imagen}
              onChange={e => setImagen(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            {imagen && (
              <img src={imagen} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600" onError={e => e.target.style.display='none'} />
            )}
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer text-sm font-medium"
            >
              {guardando
                ? (idioma === 'es' ? 'Guardando...' : 'Saving...')
                : (idioma === 'es' ? 'Guardar cambios' : 'Save changes')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer text-sm"
            >
              {idioma === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
