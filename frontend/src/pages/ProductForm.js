import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade_estoque: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchProduto();
    }
  }, [id]);

  const fetchProduto = async () => {
    try {
      const { data } = await productsAPI.get(id);
      const produto = data.produto || data;
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        quantidade_estoque: produto.quantidade_estoque,
      });
    } catch (error) {
      setToast({
        message: 'Erro ao carregar produto',
        type: 'error',
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await productsAPI.update(id, formData);
        setToast({ message: 'Produto atualizado com sucesso!', type: 'success' });
      } else {
        await productsAPI.create(formData);
        setToast({ message: 'Produto criado com sucesso!', type: 'success' });
      }
      setTimeout(() => navigate('/produtos'), 1000);
    } catch (error) {
      setToast({
        message: error.response?.data?.error || 'Erro ao salvar produto',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-8">
        {isEditing ? 'Editar Produto' : 'Novo Produto'}
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="input"
              placeholder="Nome do produto"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Descrição *</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="input resize-none"
              rows="4"
              placeholder="Descrição do produto"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Preço (R$) *</label>
              <input
                type="number"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Quantidade em Estoque *</label>
              <input
                type="number"
                name="quantidade_estoque"
                value={formData.quantidade_estoque}
                onChange={handleChange}
                className="input"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
