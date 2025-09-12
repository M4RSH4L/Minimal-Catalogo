import React, { useState } from 'react';
import { X, Upload, Package, DollarSign, Hash, Image, Plus, AlertCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useAdminProfile } from '../hooks/useAdminProfile';

interface ProductUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductUploadModal({ isOpen, onClose }: ProductUploadModalProps) {
  const { createProduct } = useProducts();
  const { profile } = useAdminProfile();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', price: '', stock: '', image_url: '' });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        image_url: formData.image_url.trim() || null,
        status: true,
      };

      const { error } = await createProduct(productData);
      
      if (error) {
        setError(error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('Error creating product');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/12 backdrop-blur-2xl rounded-3xl border border-white/25 p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Upload className="w-6 h-6" />
            <span>Subir Producto</span>
          </h2>
          <button
            onClick={handleClose}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Admin Profile Display */}
        {profile && (
          <div className="mb-6 p-4 bg-white/8 backdrop-blur-xl rounded-2xl border border-white/15">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-5 h-5 text-white/70" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">{profile.username}</p>
                <p className="text-white/60 text-sm">Creando producto</p>
              </div>
            </div>
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¡Producto Creado!</h3>
            <p className="text-white/70">El producto se ha agregado al catálogo</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-white font-medium mb-2">
                Nombre del Producto *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Ej: Camiseta Premium"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-white font-medium mb-2">
                Precio *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="29.99"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stock" className="block text-white font-medium mb-2">
                Stock Inicial
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className="block text-white font-medium mb-2">
                URL de la Imagen
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  id="image"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            {/* Image Preview */}
            {formData.image_url && (
              <div className="mt-4">
                <p className="text-white/70 text-sm mb-2">Vista previa:</p>
                <div className="aspect-square bg-white/8 rounded-2xl overflow-hidden max-w-32 mx-auto">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-300 bg-red-500/20 rounded-full px-4 py-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.price}
              className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 text-white font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>{loading ? 'Subiendo...' : 'Subir Producto'}</span>
            </button>
          </form>
        )}

        <div className="mt-4 p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
          <p className="text-blue-200 text-sm text-center">
            Los productos se publican automáticamente en el catálogo
          </p>
        </div>
      </div>
    </div>
  );
}