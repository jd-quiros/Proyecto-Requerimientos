import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Carrito() {
    const [productos, setProductos] = useState([]);
    const { t, idioma, toggleIdioma } = useLanguage();
    const { usuario, cerrarSesion } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/carrito")
            .then((res) => setProductos(res.data))
            .catch((err) => console.error(err));
    }, []);

    const eliminarProducto = async (id) => {
        try {
            await api.delete(`/eliminar/${id}`);
            setProductos(productos.filter((p) => p.id !== id));
        } catch (err) {
            console.error(err);
            alert("Error al eliminar producto");
        }
    };

    const actualizarCantidad = async (id, nuevaCantidad) => {
        if (nuevaCantidad === 0) {
            return eliminarProducto(id);
        }
        try {
            await api.put(`/actualizar/${id}`, { cantidad: nuevaCantidad });
            setProductos(productos.map((p) =>
                p.id === id ? { ...p, cantidad: nuevaCantidad } : p
            ));
        } catch (err) {
            alert(err.response?.data?.error || "Error al actualizar cantidad");
        }
    };

    const comprarCarrito = async () => {
        try {
            const res = await api.post("/confirmar_pedido");
            alert(res.data.mensaje);
            setProductos([]);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error al confirmar pedido");
        }
    };

    const total = productos.reduce(
        (acum, p) => acum + p.precio * p.cantidad,
        0
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-10">
                {/* Navegación superior */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t("cart.backHome")}
                    </Link>

                    <Link
                        to="/historial"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline"
                    >
                        {t("cart.orderHistory")}
                    </Link>
                </div>

                <h1 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">
                    {t("cart.title")}
                </h1>

                {productos.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {t("cart.empty")}
                        </p>
                        <Link
                            to="/"
                            className="inline-block mt-4 text-sm font-medium text-black dark:text-white hover:underline"
                        >
                            {t("cart.backHome")}
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {productos.map((producto) => (
                                <div
                                    key={producto.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex justify-between items-center"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {producto.nombre}
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {t("cart.price")}: ₡{producto.precio}
                                        </p>
                                        <p className="font-bold text-green-600 mt-1">
                                            {t("cart.subtotal")}: ₡{producto.precio * producto.cantidad}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        {/* Selector de cantidad */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                                                className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer font-bold"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                                                {producto.cantidad}
                                            </span>
                                            <button
                                                onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                                                disabled={producto.cantidad >= producto.stock}
                                                className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => eliminarProducto(producto.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition cursor-pointer text-sm"
                                        >
                                            {t("cart.remove")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {t("cart.total")}
                                </h2>
                                <span className="text-3xl font-bold text-green-600">
                                    ₡{total}
                                </span>
                            </div>

                            <button
                                onClick={comprarCarrito}
                                className="mt-6 w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl text-lg font-semibold transition cursor-pointer"
                            >
                                {t("cart.confirm")}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Carrito;
