import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Package, DollarSign, Hash, Image, Upload, User, Settings } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { Product } from '../lib/supabase';
import { ProductUploadModal } from './ProductUploadModal';
import { AdminProfileSetup } from './AdminProfileSetup';

export function AdminPanel() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const { profile, loading: profileLoading } = useAdminProfile();
  const [showForm, setShowForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image_url: '',
  });

  const resetForm = () => {
    setFormData({ name: '', price: '', stock: '', image_url: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image_url: formData.image_url || null,
      status: true,
    };

    if (editingProduct) {
      const { error } = await updateProduct(editingProduct.id, productData);
      if (!error) resetForm();
    } else {
      const { error } = await createProduct(productData);
      if (!error) resetForm();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Profile */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-2 mb-2">
              <Package className="w-8 h-8" />
              <span>Panel de Administración</span>
            </h1>
            {profile && (
              <div className="flex items-center space-x-3 text-white/70">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <span>Bienvenido, {profile.username}</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            {!profile && !profileLoading && (
              <button
                onClick={() => setShowProfileSetup(true)}
                className="bg-blue-500/20 backdrop-blur-xl rounded-full px-4 py-2 border border-blue-400/30 text-white font-medium hover:bg-blue-500/30 transition-all duration-300 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configurar Perfil</span>
              </button>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 text-white font-medium hover:from-green-500/30 hover:to-blue-500/30 transition-all duration-300 flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Subir Producto</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-white/15 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Manual</span>
            </button>
          </div>
        </div>
        
        {profile && (
          <button
            onClick={() => setShowProfileSetup(true)}
            className="text-white/50 hover:text-white/70 transition-colors duration-300 text-sm flex items-center space-x-1"
          >
            <Settings className="w-3 h-3" />
            <span>Editar perfil</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <ProductUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
      
      <AdminProfileSetup 
        isOpen={showProfileSetup} 
        onClose={() => setShowProfileSetup(false)}
        onComplete={() => {}}
      />

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/12 backdrop-blur-2xl rounded-3xl border border-white/25 p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingProduct ? 'Editar Producto' : 'Crear Producto Manual'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Nombre</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Nombre del producto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Precio</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Stock</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">URL de Imagen</label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white/15 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{editingProduct ? 'Actualizar' : 'Crear'} Producto</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 shadow-2xl hover:bg-white/12 transition-all duration-300"
          >
            {product.image_url && (
              <div className="aspect-square bg-white/8 rounded-2xl mb-4 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">{product.name}</h3>
              <p className="text-2xl font-bold text-white">${product.price}</p>
              <p className="text-white/70">Stock: {product.stock}</p>
              <p className="text-white/50 text-sm">
                Creado: {new Date(product.created_at).toLocaleDateString()}
              </p>
              {product.created_by && profile && (
                <div className="flex items-center space-x-2 text-white/40 text-xs">
                  <User className="w-3 h-3" />
                  <span>Por {profile.username}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 bg-blue-500/20 backdrop-blur-xl rounded-full px-4 py-2 border border-blue-400/30 text-white hover:bg-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 bg-red-500/20 backdrop-blur-xl rounded-full px-4 py-2 border border-red-400/30 text-white hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No hay productos creados</p>
          <p className="text-white/50">Haz clic en "Subir Producto" para comenzar</p>
        </div>
      )}
    </div>
  );
}