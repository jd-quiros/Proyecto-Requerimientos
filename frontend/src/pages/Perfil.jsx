import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export function Perfil() {
    const { t, idioma, toggleIdioma } = useLanguage();
    const { usuario, cerrarSesion, actualizarUsuario } = useAuth();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/perfil')
            .then(res => {
                setNombre(res.data.nombre);
                setEmail(res.data.email);
            })
            .catch(() => {});
    }, []);

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setMensaje(null);
        setError(null);
        try {
            const res = await api.put('/perfil', {
                nombre,
                email,
                password_actual: passwordActual,
                password_nueva: passwordNueva,
            });
            setMensaje(t('profile.saved'));
            setPasswordActual('');
            setPasswordNueva('');
            actualizarUsuario({ nombre: res.data.usuario.nombre, email: res.data.usuario.email });
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="max-w-lg mx-auto px-4 py-10">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('profile.backHome')}
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    {t('profile.title')}
                </h1>

                <form onSubmit={handleGuardar} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('profile.name')}
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('profile.email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('profile.currentPassword')}
                        </label>
                        <input
                            type="password"
                            value={passwordActual}
                            onChange={e => setPasswordActual(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('profile.newPassword')}
                        </label>
                        <input
                            type="password"
                            value={passwordNueva}
                            onChange={e => setPasswordNueva(e.target.value)}
                            placeholder={t('profile.newPasswordPlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white placeholder-gray-400"
                        />
                    </div>

                    {mensaje && (
                        <p className="text-green-600 dark:text-green-400 text-sm font-medium">{mensaje}</p>
                    )}
                    {error && (
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={guardando}
                        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition cursor-pointer disabled:opacity-50"
                    >
                        {guardando ? t('home.loading') : t('profile.save')}
                    </button>
                </form>
            </div>
        </div>
    );
}
