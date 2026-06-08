import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export function HistorialPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const { t, idioma, toggleIdioma } = useLanguage();
    const { usuario, cerrarSesion } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/historial")
            .then((res) => setPedidos(res.data))
            .catch((err) => console.error(err))
            .finally(() => setCargando(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-10">
                {/* Volver al inicio */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t("orderHistory.backHome")}
                </Link>

                <h1 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">
                    {t("orderHistory.title")}
                </h1>

                {cargando ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">{t("home.loading")}</p>
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {t("orderHistory.empty")}
                        </p>
                        <Link
                            to="/"
                            className="inline-block mt-4 text-sm font-medium text-black dark:text-white hover:underline"
                        >
                            {t("orderHistory.backHome")}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pedidos.map((pedido) => (
                            <div
                                key={pedido.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                            >
                                {/* Encabezado del pedido */}
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {t("orderHistory.order")} #{pedido.id}
                                        </span>
                                        <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                                            {t("orderHistory.date")}: {pedido.fecha}
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-green-600">
                                        {t("orderHistory.total")}: ₡{pedido.monto_total.toFixed(2)}
                                    </span>
                                </div>

                                {/* Productos del pedido */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {pedido.productos.map((prod, idx) => (
                                        <div
                                            key={idx}
                                            className="px-6 py-3 flex items-center justify-between"
                                        >
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {prod.nombre}
                                            </span>
                                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                <span>₡{prod.precio} × {prod.cantidad}</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    ₡{prod.subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
