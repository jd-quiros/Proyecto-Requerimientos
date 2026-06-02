import { useState } from 'react';
import api from '../services/api';

export function CrearTiendaModal({ onClose }) {

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await api.post('/tiendas', {
        nombre,
        descripcion,
        categoria
      });

      alert('Tienda creada correctamente');

      window.location.reload();

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.error ||
        'Error al crear la tienda'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Crear Nueva Tienda
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>
            <label className="block mb-1 text-sm font-medium">
              Nombre de la Tienda
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Descripción
            </label>

            <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows="4"
            required
            className="w-full border rounded-lg px-3 py-2 resize-none"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Categoría Principal
            </label>

            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              placeholder="Tecnología"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">

            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Crear Tienda
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 border rounded-lg"
            >
              Cancelar
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}