import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

// ── Tarjeta de stat ───────────────────────────────────────────
function StatCard({ label, value, sub, color = "blue" }) {
    const colors = {
        blue:   "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
        green:  "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
        yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300",
        purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
    };
    return (
        <div className={`rounded-xl p-5 ${colors[color]}`}>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
        </div>
    );
}

// ── Badge de estado ───────────────────────────────────────────
function EstadoBadge({ estado }) {
    const map = {
        activa:     "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        pendiente:  "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
        suspendida: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    };
    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[estado] || ""}`}>
            {estado}
        </span>
    );
}

// ════════════════════════════════════════════════════════════════
// SECCIÓN DASHBOARD
// ════════════════════════════════════════════════════════════════
function SeccionDashboard({ t }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("/admin/stats").then(r => setStats(r.data)).catch(() => {});
    }, []);

    if (!stats) return <p className="text-gray-500 dark:text-gray-400 py-8">{t("home.loading")}</p>;

    return (
        <div className="space-y-8">
            {/* Usuarios */}
            <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t("admin.users")}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label={t("admin.totalUsers")} value={stats.usuarios.total} color="blue" />
                    <StatCard label={t("admin.clients")} value={stats.usuarios.clientes} color="blue" />
                    <StatCard label={t("admin.sellers")} value={stats.usuarios.vendedores} color="blue" />
                    <StatCard label={t("admin.admins")} value={stats.usuarios.admins} color="blue" />
                </div>
            </div>

            {/* Tiendas */}
            <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t("admin.stores")}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label={t("admin.totalStores")} value={stats.tiendas.total} color="purple" />
                    <StatCard label={t("admin.active")} value={stats.tiendas.activas} color="green" />
                    <StatCard label={t("admin.pending")} value={stats.tiendas.pendientes} color="yellow" />
                    <StatCard label={t("admin.suspended")} value={stats.tiendas.suspendidas} color="purple" />
                </div>
            </div>

            {/* Ventas */}
            <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Ventas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        label={t("admin.totalRevenue")}
                        value={`₡${stats.revenue_total.toLocaleString("es-CR", { minimumFractionDigits: 0 })}`}
                        color="green"
                    />
                    <StatCard
                        label={t("admin.bestProduct")}
                        value={stats.mejor_producto?.nombre || t("admin.noData")}
                        sub={stats.mejor_producto ? `${stats.mejor_producto.unidades} ${t("admin.units")}` : ""}
                        color="purple"
                    />
                    <StatCard
                        label={t("admin.topStore")}
                        value={stats.top_tienda?.nombre || t("admin.noData")}
                        sub={stats.top_tienda ? `₡${stats.top_tienda.revenue.toLocaleString("es-CR", { minimumFractionDigits: 0 })}` : ""}
                        color="yellow"
                    />
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// SECCIÓN USUARIOS
// ════════════════════════════════════════════════════════════════
function SeccionUsuarios({ t }) {
    const [usuarios, setUsuarios] = useState([]);
    const [editando, setEditando] = useState(null);

    const cargar = useCallback(() => {
        api.get("/admin/usuarios").then(r => setUsuarios(r.data)).catch(() => {});
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const cambiarRol = async (uid, rol) => {
        await api.put(`/admin/usuarios/${uid}`, { rol });
        setEditando(null);
        cargar();
    };

    const eliminar = async (uid, nombre) => {
        if (!confirm(`${t("admin.confirmDelete")} (${nombre})`)) return;
        await api.delete(`/admin/usuarios/${uid}`);
        cargar();
    };

    const roles = ["cliente", "vendedor", "admin"];
    const colores = { cliente: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", vendedor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.name")}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.email")}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.role")}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.actions")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {usuarios.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.id}</td>
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{u.nombre}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                            <td className="py-3 px-4">
                                {editando === u.id ? (
                                    <div className="flex items-center gap-2">
                                        <select
                                            defaultValue={u.rol}
                                            onChange={e => cambiarRol(u.id, e.target.value)}
                                            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        <button onClick={() => setEditando(null)} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
                                    </div>
                                ) : (
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer ${colores[u.rol]}`} onClick={() => setEditando(u.id)}>
                                        {u.rol}
                                    </span>
                                )}
                            </td>
                            <td className="py-3 px-4">
                                <button
                                    onClick={() => eliminar(u.id, u.nombre)}
                                    className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                                >
                                    {t("admin.delete")}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// SECCIÓN TIENDAS
// ════════════════════════════════════════════════════════════════
function SeccionTiendas({ t }) {
    const [tiendas, setTiendas] = useState([]);

    const cargar = useCallback(() => {
        api.get("/admin/tiendas").then(r => setTiendas(r.data)).catch(() => {});
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const cambiarEstado = async (tid, estado) => {
        await api.put(`/admin/tiendas/${tid}/estado`, { estado });
        cargar();
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.name")}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Categoría</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Vendedor</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Estado</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.actions")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {tiendas.map(tienda => (
                        <tr key={tienda.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                <div>{tienda.nombre}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{tienda.cantidad_productos} productos</div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{tienda.categoria}</td>
                            <td className="py-3 px-4">
                                <div className="text-gray-900 dark:text-white">{tienda.vendedor_nombre}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{tienda.vendedor_email}</div>
                            </td>
                            <td className="py-3 px-4"><EstadoBadge estado={tienda.estado} /></td>
                            <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-2">
                                    {tienda.estado !== "activa" && (
                                        <button onClick={() => cambiarEstado(tienda.id, "activa")}
                                            className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-md hover:bg-green-200 transition cursor-pointer">
                                            {t("admin.approve")}
                                        </button>
                                    )}
                                    {tienda.estado !== "suspendida" && (
                                        <button onClick={() => cambiarEstado(tienda.id, "suspendida")}
                                            className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-md hover:bg-red-200 transition cursor-pointer">
                                            {t("admin.suspend")}
                                        </button>
                                    )}
                                    {tienda.estado !== "pendiente" && (
                                        <button onClick={() => cambiarEstado(tienda.id, "pendiente")}
                                            className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                                            Pendiente
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// SECCIÓN PRODUCTOS
// ════════════════════════════════════════════════════════════════
function SeccionProductos({ t }) {
    const [productos, setProductos] = useState([]);
    const [tiendas, setTiendas] = useState([]);
    const [tiendaFiltro, setTiendaFiltro] = useState("todas");

    const cargar = useCallback(() => {
        api.get("/admin/productos").then(r => setProductos(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        cargar();
        api.get("/admin/tiendas").then(r => setTiendas(r.data)).catch(() => {});
    }, [cargar]);

    const eliminar = async (pid, nombre) => {
        if (!confirm(`${t("admin.confirmDelete")} (${nombre})`)) return;
        await api.delete(`/admin/productos/${pid}`);
        cargar();
    };

    const visibles = tiendaFiltro === "todas"
        ? productos
        : productos.filter(p => p.tienda_nombre === tiendaFiltro);

    return (
        <div>
            {/* Filtro de tienda */}
            <div className="flex items-center gap-3 mb-5">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">
                    {t("admin.store")}:
                </label>
                <select
                    value={tiendaFiltro}
                    onChange={e => setTiendaFiltro(e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                >
                    <option value="todas">Todas las tiendas ({productos.length})</option>
                    {tiendas.map(t => {
                        const count = productos.filter(p => p.tienda_nombre === t.nombre).length;
                        return (
                            <option key={t.id} value={t.nombre}>
                                {t.nombre} ({count})
                            </option>
                        );
                    })}
                </select>
                {tiendaFiltro !== "todas" && (
                    <button
                        onClick={() => setTiendaFiltro("todas")}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                    >
                        ✕ Limpiar
                    </button>
                )}
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {visibles.length} producto{visibles.length !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.name")}</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.store")}</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.price")}</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.stock")}</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t("admin.actions")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {visibles.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{p.nombre}</td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{p.tienda_nombre}</td>
                                <td className="py-3 px-4 text-gray-900 dark:text-white">₡{p.precio.toLocaleString()}</td>
                                <td className="py-3 px-4">
                                    <span className={`font-medium ${p.stock === 0 ? "text-red-600 dark:text-red-400" : p.stock < 5 ? "text-yellow-600 dark:text-yellow-400" : "text-gray-900 dark:text-white"}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <button onClick={() => eliminar(p.id, p.nombre)}
                                        className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer">
                                        {t("admin.delete")}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {visibles.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    {t("admin.noData")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL ADMIN
// ════════════════════════════════════════════════════════════════
export function Admin() {
    const { usuario } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [seccion, setSeccion] = useState("dashboard");

    useEffect(() => {
        if (usuario && usuario.rol !== "admin") navigate("/");
    }, [usuario]);

    const secciones = [
        { id: "dashboard", label: t("admin.dashboard"), icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
        { id: "usuarios", label: t("admin.users"), icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
        { id: "tiendas", label: t("admin.stores"), icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
        { id: "productos", label: t("admin.products"), icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    ];

    const contenido = {
        dashboard: <SeccionDashboard t={t} />,
        usuarios:  <SeccionUsuarios t={t} />,
        tiendas:   <SeccionTiendas t={t} />,
        productos: <SeccionProductos t={t} />,
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-56 shrink-0 min-h-[calc(100vh-57px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                    <nav className="p-3 space-y-1">
                        {secciones.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSeccion(s.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                                    seccion === s.id
                                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} />
                                </svg>
                                {s.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Contenido */}
                <main className="flex-1 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {secciones.find(s => s.id === seccion)?.label}
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        {contenido[seccion]}
                    </div>
                </main>
            </div>
        </div>
    );
}
