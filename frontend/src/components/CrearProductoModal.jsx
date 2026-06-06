import { useState } from 'react';
import api from '../services/api';

export function CrearProductoModal({
  onClose,
  onProductoCreado
}) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [imagen, setImagen] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/productos', {
        nombre,
        descripcion,
        precio: Number(precio),
        stock: Number(stock),
        imagen
      });

      alert('Producto creado correctamente');

      onProductoCreado(response.data);

      onClose();

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.error ||
        'Error al crear producto'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-xl">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Agregar Producto
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
              Nombre
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
              Precio
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Cantidad en inventario
            </label>

            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              URL Imagen
            </label>

            <input
              type="text"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              placeholder="https://..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">

            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Guardar Producto
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