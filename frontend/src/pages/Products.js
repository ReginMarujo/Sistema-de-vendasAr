import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

const Products = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data } = await productsAPI.list();
      setProdutos(data.produtos || []);
    } catch (error) {
      setToast({
        message: 'Erro ao carregar produtos',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productsAPI.delete(deleteModal.id);
      setProdutos(produtos.filter((p) => p.id !== deleteModal.id));
      setToast({ message: 'Produto removido com sucesso!', type: 'success' });
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      setToast({ message: 'Erro ao remover produto', type: 'error' });
    }
  };

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Link to="/produtos/novo" className="btn-primary">
          + Novo Produto
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full md:w-1/3"
        />
      </div>

      {produtosFiltrados.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600 text-lg">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className="card hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">{produto.nome}</h3>
              <p className="text-gray-600 text-sm mb-4">{produto.descricao}</p>
              <div className="mb-4">
                <p className="text-lg font-bold text-green-600">
                  R$ {parseFloat(produto.preco).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Estoque: {produto.quantidade_estoque}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/produtos/${produto.id}`}
                  className="flex-1 btn bg-blue-600 text-white hover:bg-blue-700 text-center"
                >
                  Ver
                </Link>
                <Link
                  to={`/produtos/${produto.id}/editar`}
                  className="flex-1 btn bg-yellow-600 text-white hover:bg-yellow-700 text-center"
                >
                  Editar
                </Link>
                <button
                  onClick={() => setDeleteModal({ isOpen: true, id: produto.id })}
                  className="flex-1 btn-danger"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        title="Confirmar Exclusão"
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
      >
        <p className="mb-6">Tem certeza que deseja deletar este produto?</p>
        <div className="flex gap-4">
          <button
            onClick={handleDelete}
            className="flex-1 btn-danger"
          >
            Deletar
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: false, id: null })}
            className="flex-1 btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
