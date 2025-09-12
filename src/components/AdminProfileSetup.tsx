import React, { useState } from 'react';
import { User, Camera, Save, X } from 'lucide-react';
import { useAdminProfile } from '../hooks/useAdminProfile';

interface AdminProfileSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function AdminProfileSetup({ isOpen, onClose, onComplete }: AdminProfileSetupProps) {
  const { profile, createProfile, updateProfile } = useAdminProfile();
  const [username, setUsername] = useState(profile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = profile 
        ? await updateProfile({ username: username.trim(), avatar_url: avatarUrl.trim() || undefined })
        : await createProfile(username.trim(), avatarUrl.trim() || undefined);

      if (error) {
        setError(error);
      } else {
        onComplete();
        onClose();
      }
    } catch (err) {
      setError('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/12 backdrop-blur-2xl rounded-3xl border border-white/25 p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <User className="w-6 h-6" />
            <span>{profile ? 'Editar Perfil' : 'Configurar Perfil'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white/50" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white/20 backdrop-blur-xl rounded-full p-2 border border-white/30">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-white font-medium mb-2">
              Nombre de Usuario *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Tu nombre de usuario"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label htmlFor="avatar" className="block text-white font-medium mb-2">
              URL del Avatar
            </label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                id="avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-xl rounded-full px-12 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="https://ejemplo.com/avatar.jpg"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-300 bg-red-500/20 rounded-full px-4 py-2 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full bg-white/15 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Guardando...' : 'Guardar Perfil'}</span>
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
          <p className="text-blue-200 text-sm text-center">
            Tu perfil se mostrará cuando crees o edites productos
          </p>
        </div>
      </div>
    </div>
  );
}