import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export function PedidosTienda() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [tiendaId, setTiendaId] = useState(null);
    const { t } = useLanguage();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (usuario?.rol !== "vendedor") {
            navigate("/");
            return;
        }
        // Obtener id de la tienda para el link de volver
        api.get("/mis-tiendas")
            .then(res => { if (res.data[0]) setTiendaId(res.data[0].id); })
            .catch(() => {});

        api.get("/mis-pedidos")
            .then(res => setPedidos(res.data))
            .catch(err => console.error(err))
            .finally(() => setCargando(false));
    }, [usuario]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-10">
                {tiendaId && (
                    <Link
                        to={`/tienda/${tiendaId}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t("storeOrders.backToStore")}
                    </Link>
                )}

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    {t("storeOrders.title")}
                </h1>

                {cargando ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-12">{t("home.loading")}</p>
                ) : pedidos.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{t("storeOrders.empty")}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pedidos.map((pedido) => (
                            <div key={pedido.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                                {/* Encabezado del pedido */}
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {t("storeOrders.order")} #{pedido.id}
                                            <span className="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                {t("storeOrders.date")}: {pedido.fecha}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">{t("storeOrders.buyer")}:</span>{" "}
                                            {pedido.comprador_nombre}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-medium">{t("storeOrders.email")}:</span>{" "}
                                            {pedido.comprador_email}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("storeOrders.total")}</p>
                                        <p className="text-xl font-bold text-green-600">
                                            ₡{pedido.total_tienda.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Productos */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {pedido.productos.map((prod, idx) => (
                                        <div key={idx} className="px-6 py-3 flex items-center justify-between">
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {prod.nombre}
                                            </span>
                                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                <span>₡{prod.precio.toFixed(2)} × {prod.cantidad}</span>
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
