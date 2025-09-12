import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  User, 
  Grid3X3, 
  RotateCcw, 
  Palette,
  LogOut,
  Settings,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { useProducts } from './hooks/useProducts';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';

interface AppProps {
  backgroundUrl?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const categories = ["Full body", "Top Body", "Head", "Pants", "Foot"];

const HomeSection = () => (
  <section className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
    {/* Background Customizer Button - Fixed Position */}
    <div className="absolute top-8 right-8 z-20">
      <button
        onClick={() => {
          // This will be handled by the parent component
          const event = new CustomEvent('openCustomizer');
          window.dispatchEvent(event);
        }}
        aria-label="Customize background"
        className="bg-white/10 backdrop-blur-2xl rounded-full p-3 lg:p-4 border border-white/15 text-white hover:bg-white/15 transition-all duration-400 ease-out shadow-2xl transform hover:scale-[1.05] active:scale-[0.95]"
      >
        <Palette className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>
    </div>

    {/* Floating 3D Object */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative">
        {/* Modern 3D Structure */}
        <div className="w-48 h-48 lg:w-72 lg:h-72 relative transform-gpu animate-float">
          {/* Main geometric shape */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/25 to-purple-600/20 backdrop-blur-2xl rounded-[2rem] border border-white/25 shadow-2xl transform rotate-12 transition-all duration-2000 ease-out">
            <div className="absolute inset-6 bg-gradient-to-tr from-blue-500/40 to-violet-500/40 rounded-2xl animate-pulse">
              <div className="absolute inset-4 bg-gradient-to-bl from-white/20 to-transparent rounded-xl"></div>
            </div>
            {/* Inner glow */}
            <div className="absolute inset-8 bg-gradient-to-r from-cyan-300/30 to-purple-400/30 rounded-xl blur-sm animate-pulse delay-500"></div>
          </div>
          
          {/* Secondary layer */}
          <div className="absolute inset-0 bg-gradient-to-tl from-pink-400/20 to-blue-500/15 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-xl transform -rotate-6 transition-all duration-2000 ease-out delay-300">
            <div className="absolute inset-6 bg-gradient-to-bl from-purple-500/35 to-pink-500/35 rounded-2xl animate-pulse delay-700">
              <div className="absolute inset-4 bg-gradient-to-tr from-white/15 to-transparent rounded-xl"></div>
            </div>
            {/* Inner glow */}
            <div className="absolute inset-8 bg-gradient-to-l from-pink-300/25 to-blue-400/25 rounded-xl blur-sm animate-pulse delay-1000"></div>
          </div>
          
          {/* Tertiary accent layer */}
          <div className="absolute inset-4 bg-gradient-to-br from-emerald-400/15 to-cyan-500/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-lg transform rotate-3 transition-all duration-2000 ease-out delay-600">
            <div className="absolute inset-4 bg-gradient-to-tr from-emerald-400/30 to-cyan-400/30 rounded-2xl animate-pulse delay-1200"></div>
          </div>
        </div>
        
        {/* Enhanced Floating Particles */}
        <div className="absolute -top-12 -left-12 w-6 h-6 bg-gradient-to-r from-cyan-400/60 to-blue-500/60 rounded-full animate-bounce delay-100 shadow-lg"></div>
        <div className="absolute -bottom-8 -right-8 w-4 h-4 bg-gradient-to-r from-purple-400/50 to-pink-500/50 rounded-full animate-bounce delay-500 shadow-md"></div>
        <div className="absolute top-16 -right-16 w-3 h-3 bg-gradient-to-r from-emerald-400/70 to-cyan-400/70 rounded-full animate-bounce delay-700 shadow-sm"></div>
        <div className="absolute -top-6 right-20 w-2 h-2 bg-white/60 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-20 -left-6 w-5 h-5 bg-gradient-to-r from-violet-400/40 to-purple-500/40 rounded-full animate-bounce delay-900 shadow-md"></div>
        
        {/* Orbital rings */}
        <div className="absolute inset-0 border border-white/10 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute inset-8 border border-cyan-400/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
      </div>
    </div>

    {/* Content */}
    <div className="text-center z-10 max-w-2xl mx-auto">
      <h1 className="text-6xl lg:text-8xl text-white mb-6 tracking-wider" style={{ fontFamily: 'Anton, sans-serif' }}>
        <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
          VirtualFit
        </span>
      </h1>
      <p className="text-xl lg:text-2xl text-white/80 font-light tracking-wide leading-relaxed">
        The future of fashion is here
      </p>
      <div className="mt-8 flex justify-center">
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </div>
    </div>
  </section>
);

// Audio context for subtle sounds
const createAudioContext = () => {
  const playClickSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playViewChangeSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return { playClickSound, playViewChangeSound };
};

interface ProductCardProps {
  product: any;
  isMain?: boolean;
  onAddToCart?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isMain = false, onAddToCart }) => {
  if (!product) {
    return (
      <div className={`bg-white/8 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl ${
        isMain ? 'w-full max-w-sm mx-auto' : 'w-64'
      } h-96 flex items-center justify-center`}>
        <div className="text-white/50">No product</div>
      </div>
    );
  }

  return (
    <div className={`bg-white/8 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl transition-all duration-500 ease-out ${
      isMain ? 'w-full max-w-sm mx-auto transform hover:scale-[1.02]' : 'w-64 transform hover:scale-[1.01]'
    } ${isMain ? 'h-auto' : 'h-96'} overflow-hidden group`}>
      
      {/* Product Image */}
      <div className={`${isMain ? 'aspect-square' : 'h-48'} bg-white/5 overflow-hidden relative`}>
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
            <User className="w-16 h-16 text-white/30" />
          </div>
        )}
        
        {/* Stock Badge */}
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-xl rounded-full px-3 py-1 border border-white/20">
          <span className="text-white text-xs font-medium">Stock: {product.stock}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-2">{product.name}</h3>
          {product.description && (
            <p className="text-white/60 text-sm mb-2 line-clamp-2">{product.description}</p>
          )}
          <p className="text-2xl sm:text-3xl font-bold text-white">${product.price}</p>
        </div>

        {/* Add to Cart Button */}
        {isMain && onAddToCart && (
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="w-full bg-white/15 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

function App({ backgroundUrl = "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920" }: AppProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Home");
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(backgroundUrl);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Touch handling for mobile swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auth and products
  const { user, role, loading: authLoading, signOut } = useSupabaseAuth();
  const { products, loading: productsLoading } = useProducts();

  // Handle customizer event from Home section
  useEffect(() => {
    const handleCustomizerEvent = () => {
      audioContext?.playClickSound();
      setIsCustomizerOpen(true);
    };

    window.addEventListener('openCustomizer', handleCustomizerEvent);
    return () => window.removeEventListener('openCustomizer', handleCustomizerEvent);
  }, []);

  useEffect(() => {
    if (products.length > 0 && currentIndex >= products.length) {
      setCurrentIndex(0);
    }
  }, [products, currentIndex]);

  const audioContext = createAudioContext();

  // Filter products by category
  const filteredProducts = selectedCategory === "Home" ? [] : products.filter(product => 
    product.status === true
  );

  const currentProduct = filteredProducts[currentIndex];
  const sideProducts = [
    filteredProducts[currentIndex - 1] || filteredProducts[filteredProducts.length - 1],
    filteredProducts[currentIndex + 1] || filteredProducts[0]
  ];

  const nextProduct = () => {
    if (isTransitioning || filteredProducts.length === 0) return;
    setIsTransitioning(true);
    audioContext?.playClickSound();
    setCurrentIndex((prev) => (prev + 1) % filteredProducts.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevProduct = () => {
    if (isTransitioning || filteredProducts.length === 0) return;
    setIsTransitioning(true);
    audioContext?.playClickSound();
    setCurrentIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768 || !touchStart || isTransitioning) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Allow more natural movement
    const offset = diff * 0.8;
    
    setSwipeOffset(offset);
    setTouchEnd(currentTouch);
  };

  const handleTouchEnd = () => {
    if (window.innerWidth >= 768 || !touchStart || !touchEnd || isTransitioning) {
      resetSwipe();
      return;
    }

    const distance = touchEnd - touchStart;
    const cardWidth = cardRef.current?.offsetWidth || 300;
    const threshold = cardWidth * 0.4; // 40% threshold
    
    const isLeftSwipe = distance < -threshold;
    const isRightSwipe = distance > threshold;

    if (isLeftSwipe) {
      // Swipe left - go to next product
      animateSwipeOut('left');
      setTimeout(() => {
        nextProduct();
      }, 250);
    } else if (isRightSwipe) {
      // Swipe right - go to previous product
      animateSwipeOut('right');
      setTimeout(() => {
        prevProduct();
      }, 250);
    } else {
      // Return to original position
      animateSwipeReturn();
    }
  };

  const animateSwipeOut = (direction: 'left' | 'right') => {
    const cardWidth = cardRef.current?.offsetWidth || 300;
    const targetOffset = direction === 'left' ? -cardWidth : cardWidth;
    setSwipeOffset(targetOffset);
    
    setTimeout(() => {
      resetSwipe();
    }, 250);
  };

  const animateSwipeReturn = () => {
    setSwipeOffset(0);
    setTimeout(() => {
      resetSwipe();
    }, 200);
  };

  const resetSwipe = () => {
    setTouchStart(null);
    setTouchEnd(null);
    setSwipeOffset(0);
    setIsSwipeActive(false);
  };

  const addToCart = (product: any) => {
    audioContext?.playClickSound();
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image_url
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    audioContext?.playClickSound();
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleWhatsAppOrder = () => {
    const orderDetails = cart.map(item => 
      `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const total = getTotalPrice().toFixed(2);
    const message = `Hola! Me gustaría hacer el siguiente pedido:\n\n${orderDetails}\n\nTotal: $${total}`;
    
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const backgroundOptions = [
    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920",
    "https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=1920",
    "https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=1920",
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "radial-gradient(circle, #ff6b6b, #4ecdc4)"
  ];

  const handleSignOut = async () => {
    await signOut();
    setShowAdminPanel(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: currentBackground.startsWith('http') 
          ? `url(${currentBackground}) center/cover no-repeat`
          : currentBackground
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-center pt-4 sm:pt-8 pb-4 sm:pb-6 px-4" role="banner">
          <h2 className="sr-only">Product Categories Navigation</h2>
          <nav className="flex space-x-1 bg-white/10 backdrop-blur-2xl rounded-full p-1 sm:p-2 border border-white/15 shadow-2xl overflow-x-auto">
            {["Home", ...categories].map((category, index) => (
              <button
                key={category}
                onClick={() => {
                  audioContext?.playViewChangeSound();
                  setSelectedCategory(category);
                  setCurrentIndex(0);
                }}
                className={`px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-400 ease-out whitespace-nowrap transform ${
                  selectedCategory === category
                    ? 'bg-white/20 text-white shadow-lg scale-[1.02] backdrop-blur-xl'
                    : 'text-white/70 hover:text-white hover:bg-white/12 hover:scale-[1.01]'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {category}
              </button>
            ))}
          </nav>
        </header>

        {/* Top Controls */}
        <div className={`flex justify-between items-center px-4 sm:px-8 mb-4 sm:mb-8 ${selectedCategory === "Home" ? "opacity-0 pointer-events-none" : "opacity-100"} transition-all duration-500 ease-out`}>
          {/* Brand */}
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-2xl rounded-full px-3 sm:px-6 py-2 sm:py-3 border border-white/15 shadow-2xl transform hover:scale-[1.01] transition-all duration-400 ease-out" role="banner">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-white font-medium text-sm sm:text-base" aria-label="VirtualFit brand logo">VirtualFit</span>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3" role="toolbar" aria-label="View and cart controls">
            <h3 className="sr-only">View Options</h3>
            <div className="flex space-x-1 sm:space-x-2 bg-white/10 backdrop-blur-2xl rounded-full p-1 sm:p-2 border border-white/15 shadow-2xl">
              <button
                onClick={() => {
                  audioContext?.playViewChangeSound();
                  setViewMode('carousel');
                }}
                aria-label="Carousel view"
                className={`p-2 sm:p-3 rounded-full transition-all duration-300 ${
                  viewMode === 'carousel' 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/12'
                }`}
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => {
                  audioContext?.playViewChangeSound();
                  setViewMode('grid');
                }}
                aria-label="Grid view"
                className={`p-2 sm:p-3 rounded-full transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/12'
                }`}
              >
                <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Auth & Admin Controls */}
            <div className="flex items-center space-x-2">
              {!user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-white/10 backdrop-blur-2xl rounded-full px-4 py-2 border border-white/15 text-white hover:bg-white/15 transition-all duration-300"
                >
                  Iniciar sesión
                </button>
              ) : (
                <>
                  {role === 'admin' && (
                    <button
                      onClick={() => setShowAdminPanel(!showAdminPanel)}
                      className="bg-white/10 backdrop-blur-2xl rounded-full p-2 sm:p-3 border border-white/15 text-white hover:bg-white/15 transition-all duration-300"
                    >
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="bg-white/10 backdrop-blur-2xl rounded-full p-2 sm:p-3 border border-white/15 text-white hover:bg-white/15 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => {
                audioContext?.playClickSound();
                setIsCartOpen(true);
              }}
              aria-label={`Shopping cart with ${getTotalItems()} items`}
              className="relative bg-white/10 backdrop-blur-2xl rounded-full p-2 sm:p-3 border border-white/15 text-white hover:bg-white/15 transition-all duration-400 ease-out shadow-2xl transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Admin Panel */}
        {showAdminPanel && role === 'admin' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen p-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Panel de Administración</h2>
                  <button
                    onClick={() => setShowAdminPanel(false)}
                    className="bg-white/10 backdrop-blur-2xl rounded-full p-3 border border-white/15 text-white hover:bg-white/15 transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <AdminPanel />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8" role="main">
          {selectedCategory === "Home" ? (
            <HomeSection />
          ) : (
            <>
              <h2 className="sr-only">{selectedCategory} Products Catalog</h2>
              {viewMode === 'carousel' ? (
                /* Carousel View */
                <section className="flex items-center justify-center space-x-2 sm:space-x-8 max-w-7xl w-full" aria-label="Product carousel">
                  
                  {/* Left Navigation */}
                  <button
                    onClick={prevProduct}
                    disabled={isTransitioning || filteredProducts.length === 0}
                    aria-label="View previous product"
                    className="hidden sm:flex p-2 sm:p-4 bg-white/10 backdrop-blur-2xl rounded-full border border-white/15 text-white hover:bg-white/15 transition-all duration-300 ease-out z-20 shadow-2xl transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>

                  {/* Mobile: Single Product View with Swipe */}
                  <div className="block sm:hidden flex-1 relative overflow-hidden">
                    {/* Next Card (Right) */}
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        transform: `translateX(${100 + (swipeOffset * 0.3)}%)`,
                        opacity: Math.max(0, Math.min(1, (-swipeOffset) / 100))
                      }}
                    >
                      <ProductCard product={sideProducts[1]} isMain={true} onAddToCart={addToCart} />
                    </div>
                    
                    {/* Previous Card (Left) */}
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        transform: `translateX(${-100 + (swipeOffset * 0.3)}%)`,
                        opacity: Math.max(0, Math.min(1, swipeOffset / 100))
                      }}
                    >
                      <ProductCard product={sideProducts[0]} isMain={true} onAddToCart={addToCart} />
                    </div>
                    
                    {/* Current Card */}
                    <div
                      ref={cardRef}
                      className={`relative z-10 transition-all ease-out ${isSwipeActive ? 'duration-0' : 'duration-300'}`}
                      style={{
                        transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)`,
                        opacity: Math.max(0.3, 1 - Math.abs(swipeOffset) / 200)
                      }}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <ProductCard product={currentProduct} isMain={true} onAddToCart={addToCart} />
                    </div>
                  </div>

                  {/* Desktop: Three Product View */}
                  <div className="hidden sm:flex items-center justify-center space-x-8 flex-1">
                    {/* Left Side Product */}
                    <div className="transform scale-75 opacity-60 transition-all duration-500 ease-out hover:scale-80 hover:opacity-80">
                      <ProductCard product={sideProducts[0]} />
                    </div>

                    {/* Main Product */}
                    <div className="transform scale-100 transition-all duration-500 ease-out z-10">
                      <ProductCard product={currentProduct} isMain={true} onAddToCart={addToCart} />
                    </div>

                    {/* Right Side Product */}
                    <div className="transform scale-75 opacity-60 transition-all duration-500 ease-out hover:scale-80 hover:opacity-80">
                      <ProductCard product={sideProducts[1]} />
                    </div>
                  </div>

                  {/* Right Navigation */}
                  <button
                    onClick={nextProduct}
                    disabled={isTransitioning || filteredProducts.length === 0}
                    aria-label="View next product"
                    className="hidden sm:flex p-2 sm:p-4 bg-white/10 backdrop-blur-2xl rounded-full border border-white/15 text-white hover:bg-white/15 transition-all duration-300 ease-out z-20 shadow-2xl transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                </section>
              ) : (
                /* Grid View */
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl w-full" aria-label="Product grid">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="transform transition-all duration-500 ease-out hover:scale-[1.02] animate-slideUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ProductCard product={product} isMain={true} onAddToCart={addToCart} />
                    </div>
                  ))}
                </section>
              )}

              {/* No Products Message */}
              {filteredProducts.length === 0 && !productsLoading && (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">No products available in this category</p>
                </div>
              )}

              {/* Loading State */}
              {productsLoading && (
                <div className="text-center py-12">
                  <div className="text-white">Loading products...</div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Dots - Only show in carousel mode */}
        {viewMode === 'carousel' && selectedCategory !== "Home" && filteredProducts.length > 0 && (
          <nav className="flex justify-center space-x-2 pb-6 sm:pb-8 px-4" aria-label="Product navigation" role="tablist">
            <h3 className="sr-only">Product Navigation Dots</h3>
            {filteredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  audioContext?.playClickSound();
                  setCurrentIndex(index);
                }}
                aria-label={`Go to product ${index + 1}`}
                role="tab"
                aria-selected={currentIndex === index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ease-out transform ${
                  currentIndex === index
                    ? 'bg-white scale-125 shadow-lg'
                    : 'bg-white/40 hover:bg-white/60 hover:scale-110'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              />
            ))}
          </nav>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white/12 backdrop-blur-2xl w-full max-w-md h-full border-l border-white/25 shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <ShoppingCart className="w-6 h-6" />
                  <span>Cart ({getTotalItems()})</span>
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center space-x-4">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                          )}
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{item.name}</h3>
                            <p className="text-white/70">${item.price}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="p-1 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="p-1 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-white">Total:</span>
                      <span className="text-2xl font-bold text-white">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleWhatsAppOrder}
                      className="w-full bg-green-500/20 backdrop-blur-xl rounded-full px-6 py-3 border border-green-400/30 text-white font-medium hover:bg-green-500/30 transition-all duration-300"
                    >
                      Order via WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Background Customizer */}
      {isCustomizerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/12 backdrop-blur-2xl rounded-3xl border border-white/25 p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Palette className="w-6 h-6" />
                <span>Customize Background</span>
              </h2>
              <button
                onClick={() => setIsCustomizerOpen(false)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {backgroundOptions.map((bg, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentBackground(bg);
                    audioContext?.playClickSound();
                  }}
                  className={`aspect-video rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                    currentBackground === bg 
                      ? 'border-white shadow-lg scale-105' 
                      : 'border-white/30 hover:border-white/60 hover:scale-102'
                  }`}
                  style={{
                    background: bg.startsWith('http') 
                      ? `url(${bg}) center/cover no-repeat`
                      : bg
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(1deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(0.5deg);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;