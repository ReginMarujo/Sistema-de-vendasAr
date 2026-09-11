import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProduto();
  }, [id]);

  const fetchProduto = async () => {
    try {
      setLoading(true);
      const { data } = await productsAPI.get(id);
      setProduto(data.produto || data);
    } catch (error) {
      setToast({
        message: 'Erro ao carregar produto',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!produto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-center text-gray-600">Produto não encontrado</p>
        <Link to="/produtos" className="btn-primary inline-block mt-4">
          Voltar aos Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Link to="/produtos" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Voltar aos Produtos
      </Link>

      <div className="card">
        <h1 className="text-3xl font-bold mb-4">{produto.nome}</h1>
        <p className="text-gray-600 text-lg mb-6">{produto.descricao}</p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-500">Preço</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {parseFloat(produto.preco).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quantidade em Estoque</p>
            <p className="text-2xl font-bold text-blue-600">
              {produto.quantidade_estoque}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            to={`/produtos/${produto.id}/editar`}
            className="btn-primary flex-1 text-center"
          >
            Editar Produto
          </Link>
          <button
            onClick={() => navigate('/produtos')}
            className="btn-secondary flex-1"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
