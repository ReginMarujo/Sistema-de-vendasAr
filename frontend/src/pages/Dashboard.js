import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { usuario } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Sistema de Vendas!</h1>
        <p className="text-gray-600 text-lg">
          Gerencie seus produtos de forma rápida e eficiente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-4">📦</h2>
          <h3 className="text-xl font-semibold mb-2">Produtos</h3>
          <p className="text-gray-600 mb-4">
            Visualize e gerencie todos os seus produtos
          </p>
          <Link to="/produtos" className="btn-primary inline-block">
            Ir para Produtos
          </Link>
        </div>

        <div className="card text-center hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-4">➕</h2>
          <h3 className="text-xl font-semibold mb-2">Novo Produto</h3>
          <p className="text-gray-600 mb-4">
            Crie um novo produto no seu catálogo
          </p>
          <Link to="/produtos/novo" className="btn-primary inline-block">
            Criar Produto
          </Link>
        </div>

        <div className="card text-center hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-4">👤</h2>
          <h3 className="text-xl font-semibold mb-2">Perfil</h3>
          <p className="text-gray-600 mb-4">
            Usuário: <span className="font-bold">{usuario?.nome}</span>
          </p>
          <p className="text-sm text-gray-500">{usuario?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
