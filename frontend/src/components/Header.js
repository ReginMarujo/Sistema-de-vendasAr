import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { usuario, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-2xl hover:text-blue-200">
          📦 Sistema de Vendas
        </Link>

        {usuario && (
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <p className="font-semibold">Bem-vindo!</p>
              <p>{usuario.nome}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
