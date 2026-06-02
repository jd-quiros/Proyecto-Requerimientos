import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { IniciarSesion } from './pages/IniciarSesion';
import { Registro } from './pages/Registro';
import { Inicio } from './pages/Inicio';
import { Tienda } from './pages/Tienda';
import { Producto } from './pages/Producto';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<IniciarSesion />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/" element={<Inicio />} />
            <Route path="/tienda/:id" element={<Tienda />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;