import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Grid3X3, List, User, X, Plus, Minus, MessageCircle, Trash2, Settings, Palette, Check } from 'lucide-react';

interface AppProps {
  backgroundUrl?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  color: string;
  size: string;
}

interface CartItem extends Product {
  quantity: number;
}

const products: Product[] = [
  {
    id: 1,
    name: "Basic T-shirt",
    price: 105,
    image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Top Body",
    color: "White",
    size: "M"
  },
  {
    id: 2,
    name: "Basic Sweater",
    price: 105,
    image: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Top Body",
    color: "Gray",
    size: "L"
  },
  {
    id: 3,
    name: "Basic Shirt",
    price: 105,
    image: "https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Top Body",
    color: "White",
    size: "M"
  },
  {
    id: 4,
    name: "Premium Hoodie",
    price: 125,
    image: "https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Top Body",
    color: "Black",
    size: "L"
  },
  {
    id: 5,
    name: "Casual Tee",
    price: 95,
    image: "https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Top Body",
    color: "Navy",
    size: "S"
  },
  {
    id: 6,
    name: "Denim Jacket",
    price: 145,
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Top Body",
    color: "Blue",
    size: "M"
  }
];

const categories = ["Full body", "Top Body", "Head", "Pants", "Foot"];

// Audio context for subtle sounds
const createAudioContext = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (frequency: number, duration: number, volume: number = 0.015) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };
  
  return {
    playSlideSound: () => playTone(880, 0.04, 0.012),      // Navigation arrows
    playClickSound: () => playTone(1200, 0.03, 0.010),     // General buttons
    playViewChangeSound: () => playTone(660, 0.05, 0.015), // View mode toggle
    playCartSound: () => playTone(1000, 0.035, 0.012),     // Cart actions
    playDotSound: () => playTone(1100, 0.025, 0.008),      // Navigation dots
    playWhatsAppSound: () => playTone(750, 0.04, 0.013),   // WhatsApp button
    playRemoveSound: () => playTone(500, 0.03, 0.010)      // Remove from cart
  };
};

function App({ backgroundUrl = "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920" }: AppProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Top Body");
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [audioContext, setAudioContext] = useState<any>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(backgroundUrl || "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920");
  const [backgroundInput, setBackgroundInput] = useState("");
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAudio = () => {
      try {
        setAudioContext(createAudioContext());
      } catch (error) {
        console.log('Audio not supported');
      }
    };
    
    // Initialize audio on first user interaction
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable swipe on mobile (screen width < 768px)
    if (window.innerWidth >= 768) return;
    
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768 || !touchStart || isTransitioning) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Limit swipe distance to prevent excessive movement
    const maxSwipe = 150;
    const offset = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
    
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
    const targetOffset = direction === 'left' ? -cardWidth * 1.2 : cardWidth * 1.2;
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

  const nextProduct = () => {
    if (isTransitioning) return;
    audioContext?.playSlideSound();
    setSlideDirection('right');
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 150);
    
    setTimeout(() => {
      setSlideDirection(null);
      setIsTransitioning(false);
    }, 600);
  };

  const prevProduct = () => {
    if (isTransitioning) return;
    audioContext?.playSlideSound();
    setSlideDirection('left');
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    }, 150);
    
    setTimeout(() => {
      setSlideDirection(null);
      setIsTransitioning(false);
    }, 600);
  };

  const goToProduct = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    audioContext?.playDotSound();
    const direction = index > currentIndex ? 'right' : 'left';
    setSlideDirection(direction);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentIndex(index);
    }, 150);
    
    setTimeout(() => {
      setSlideDirection(null);
      setIsTransitioning(false);
    }, 600);
  };

  const toggleViewMode = () => {
    audioContext?.playViewChangeSound();
    setViewMode(prev => prev === 'carousel' ? 'grid' : 'carousel');
  };

  const addToCart = (product: Product) => {
    audioContext?.playCartSound();
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    audioContext?.playRemoveSound();
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    audioContext?.playCartSound();
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const sendToWhatsApp = (product?: Product) => {
    audioContext?.playWhatsAppSound();
    const phoneNumber = "1234567890"; // Replace with your WhatsApp number
    let message = "";
    
    if (product) {
      message = `Hola! Me interesa este producto:\n\n${product.name}\nPrecio: $${product.price}\nColor: ${product.color}\nTalla: ${product.size}`;
    } else if (cart.length > 0) {
      message = "Hola! Me interesan estos productos:\n\n";
      cart.forEach(item => {
        message += `${item.name} (x${item.quantity}) - $${item.price * item.quantity}\n`;
      });
      message += `\nTotal: $${getTotalPrice()}`;
    }
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const applyBackground = () => {
    if (backgroundInput.trim()) {
      audioContext?.playClickSound();
      setCurrentBackground(backgroundInput.trim());
      setBackgroundInput("");
      setIsCustomizerOpen(false);
    }
  };

  const resetBackground = () => {
    audioContext?.playClickSound();
    setCurrentBackground("https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920");
    setBackgroundInput("");
  };

  const presetBackgrounds = [
    {
      name: "Default",
      url: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920"
    },
    {
      name: "Urban",
      url: "https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=1920"
    },
    {
      name: "Nature",
      url: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920"
    },
    {
      name: "Purple Gradient",
      url: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      name: "Ocean Gradient",
      url: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      name: "Sunset Gradient",
      url: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 50%, #ffcc02 100%)"
    }
  ];

  const currentProduct = products[currentIndex];
  const sideProducts = [
    products[(currentIndex - 1 + products.length) % products.length],
    products[(currentIndex + 1) % products.length]
  ];

  const ProductCard = ({ product, isMain = false, onClick, index }: { 
    product: Product; 
    isMain?: boolean; 
    onClick?: () => void;
    index?: number;
  }) => {
    const cardClass = isMain 
      ? "w-full max-w-xs mx-auto" 
      : "w-32 sm:w-40 lg:w-48 flex-shrink-0";
    
    const contentClass = isMain
      ? "bg-white/12 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 lg:p-8 shadow-2xl"
      : "bg-white/8 backdrop-blur-xl rounded-2xl border border-white/15 p-3 lg:p-4 shadow-xl";

    return (
      <div 
        className={`${cardClass} transform transition-all duration-600 ease-out ${
          isTransitioning && isMain
            ? slideDirection === 'right' 
              ? 'translate-x-full opacity-0 scale-95 rotate-3' 
              : '-translate-x-full opacity-0 scale-95 -rotate-3'
            : 'translate-x-0 opacity-100 scale-100 rotate-0'
        } ${
          !isMain ? 'hover:scale-105 hover:bg-white/10 cursor-pointer opacity-70 hover:opacity-100' : 'hover:scale-[1.01]'
        }`}
        onClick={onClick}
        style={{
          animationDelay: index ? `${index * 100}ms` : '0ms'
        }}
      >
        <div className={contentClass}>
          <div className={`aspect-square bg-white/8 rounded-2xl mb-4 overflow-hidden relative group ${
            isMain ? 'mb-6' : 'mb-3'
          }`}>
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"></div>
          </div>
          
          <div className="text-center">
            <h3 className={`font-bold text-white mb-2 transition-all duration-300 ease-out ${
              isMain ? 'text-xl lg:text-2xl' : 'text-sm lg:text-base'
            }`}>
              {product.name}
            </h3>
            <p className={`font-bold text-white mb-4 transition-all duration-300 ease-out ${
              isMain ? 'text-2xl lg:text-3xl' : 'text-sm lg:text-base'
            }`}>
              ${product.price}
            </p>
            
            {isMain && (
              <React.Fragment>
                <div className="flex justify-center space-x-3 lg:space-x-4 text-sm mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 lg:px-4 py-2 border border-white/20 transform hover:scale-105 transition-all duration-300 ease-out shadow-md">
                    <span className="text-white/80">Size: </span>
                    <span className="text-white font-medium">{product.size}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 lg:px-4 py-2 border border-white/20 transform hover:scale-105 transition-all duration-300 ease-out shadow-md">
                    <span className="text-white/80">Color: </span>
                    <span className="text-white font-medium">{product.color}</span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-white/12 backdrop-blur-xl rounded-full px-6 lg:px-8 py-3 border border-white/20 text-white font-medium hover:bg-white/18 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => sendToWhatsApp(product)}
                    className="bg-green-500/20 backdrop-blur-xl rounded-full px-4 py-3 border border-green-400/30 text-white font-medium hover:bg-green-500/30 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="hidden lg:inline">WhatsApp</span>
                  </button>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out"
        style={{
          backgroundImage: currentBackground.includes('gradient') ? currentBackground : `url('${currentBackground}')`
        }}
      >
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main heading for SEO - visually hidden but accessible */}
        <h1 className="sr-only">VirtualFit Premium Clothing Catalog - Interactive Shopping Experience</h1>
        
        {/* Header */}
        <header className="flex justify-center pt-4 sm:pt-8 pb-4 sm:pb-6 px-4" role="banner">
          <h2 className="sr-only">Product Categories Navigation</h2>
          <nav className="flex space-x-1 bg-white/10 backdrop-blur-2xl rounded-full p-1 sm:p-2 border border-white/15 shadow-2xl overflow-x-auto">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => {
                  audioContext?.playViewChangeSound();
                  setSelectedCategory(category);
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
        <div className="flex justify-between items-center px-4 sm:px-8 mb-4 sm:mb-8">
          {/* Brand */}
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-2xl rounded-full px-3 sm:px-6 py-2 sm:py-3 border border-white/15 shadow-2xl transform hover:scale-[1.01] transition-all duration-400 ease-out" role="banner">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-white font-medium text-sm sm:text-base" aria-label="VirtualFit brand logo">VirtualFit</span>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3" role="toolbar" aria-label="View and cart controls">
            <h3 className="sr-only">View Options</h3>
            
            {/* Background Customizer Button */}
            <button
              onClick={() => {
                audioContext?.playClickSound();
                setIsCustomizerOpen(true);
              }}
              aria-label="Customize background"
              className="bg-white/10 backdrop-blur-2xl rounded-full p-2 sm:p-3 border border-white/15 text-white hover:bg-white/15 transition-all duration-400 ease-out shadow-2xl transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className="flex space-x-1 sm:space-x-2 bg-white/10 backdrop-blur-2xl rounded-full p-1 sm:p-2 border border-white/15 shadow-2xl">
              <button
                onClick={toggleViewMode}
                aria-label={`Switch to ${viewMode === 'carousel' ? 'grid' : 'carousel'} view`}
                aria-pressed={viewMode === 'carousel'}
                className={`p-2 rounded-full transition-all duration-400 ease-out transform ${
                  viewMode === 'carousel'
                    ? 'bg-white/20 text-white scale-[1.05] backdrop-blur-xl shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/12 hover:scale-[1.02]'
                }`}
              >
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={toggleViewMode}
                aria-label={`Switch to ${viewMode === 'grid' ? 'grid' : 'carousel'} view`}
                aria-pressed={viewMode === 'grid'}
                className={`p-2 rounded-full transition-all duration-400 ease-out transform ${
                  viewMode === 'grid'
                    ? 'bg-white/20 text-white scale-[1.05] backdrop-blur-xl shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/12 hover:scale-[1.02]'
                }`}
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
            
            <button 
              onClick={() => {
                audioContext?.playCartSound();
                setIsCartOpen(true);
              }}
              aria-label={`Open shopping cart with ${getTotalItems()} items`}
              className="relative bg-white/10 backdrop-blur-2xl rounded-full px-3 sm:px-6 py-2 sm:py-3 border border-white/15 text-white font-medium hover:bg-white/15 transition-all duration-400 ease-out flex items-center space-x-1 sm:space-x-2 shadow-2xl transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-sm sm:text-base">Cart</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500/90 backdrop-blur-sm text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8" role="main">
          <h2 className="sr-only">{selectedCategory} Products Catalog</h2>
          {viewMode === 'carousel' ? (
            /* Carousel View */
            <section className="flex items-center justify-center space-x-2 sm:space-x-8 max-w-7xl w-full" aria-label="Product carousel">
              
              {/* Left Navigation */}
              <button
                onClick={prevProduct}
                disabled={isTransitioning}
                aria-label="View previous product"
                className="hidden sm:flex p-2 sm:p-4 bg-white/10 backdrop-blur-2xl rounded-full border border-white/15 text-white hover:bg-white/15 transition-all duration-300 ease-out z-20 shadow-2xl transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>

              {/* Mobile: Single Product View */}
              <div className="block sm:hidden flex-1 relative">
                <div
                  ref={cardRef}
                  className={`transition-all ease-out ${isSwipeActive ? 'duration-0' : 'duration-300'}`}
                  style={{
                    transform: `translateX(${swipeOffset}px)`,
                    opacity: isSwipeActive ? Math.max(0.5, 1 - Math.abs(swipeOffset) / 150) : 1
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <ProductCard product={currentProduct} isMain={true} />
                </div>
                
                {/* Swipe Indicators */}
                {isSwipeActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-8">
                    <div className={`transition-all duration-200 ${swipeOffset > 30 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className={`transition-all duration-200 ${swipeOffset < -30 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                        <ChevronRight className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Mobile Navigation Arrows */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <button
                    onClick={prevProduct}
                    disabled={isTransitioning}
                    aria-label="View previous product"
                    className="p-3 bg-white/10 backdrop-blur-2xl rounded-full border border-white/15 text-white hover:bg-white/15 transition-all duration-300 ease-out shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    onClick={nextProduct}
                    disabled={isTransitioning}
                    aria-label="View next product"
                    className="p-3 bg-white/10 backdrop-blur-2xl rounded-full border border-white/15 text-white hover:bg-white/15 transition-all duration-300 ease-out shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Desktop: Three Product View */}
              <div className="hidden sm:flex items-center justify-center space-x-6 lg:space-x-8 w-full">
                {/* Left Side Product */}
                <ProductCard 
                  product={sideProducts[0]} 
                  onClick={() => goToProduct((currentIndex - 1 + products.length) % products.length)}
                />

                {/* Center Main Product */}
                <ProductCard product={currentProduct} isMain={true} />

                {/* Right Side Product */}
                <ProductCard 
                  product={sideProducts[1]} 
                  onClick={() => goToProduct((currentIndex + 1) % products.length)}
                />
              </div>

              {/* Right Navigation */}
              <button
                onClick={nextProduct}
                disabled={isTransitioning}
                aria-label="View next product"
                className="hidden sm:flex p-2 sm:p-4 bg-white/10 backdrop-blur-2xl rounded-full border border-white/15 text-white hover:bg-white/15 transition-all duration-300 ease-out z-20 shadow-2xl transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </section>
          ) : (
            /* Grid View */
            <section className="w-full max-w-6xl mx-auto" aria-label="Product grid">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="transform transition-all duration-500 ease-out hover:scale-[1.02]"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: viewMode === 'grid' ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                    }}
                  >
                    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-4 sm:p-6 shadow-2xl transform transition-all duration-400 ease-out hover:bg-white/12 hover:shadow-3xl">
                      <div className="aspect-square bg-white/8 rounded-2xl mb-4 overflow-hidden relative group">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out"></div>
                      </div>
                      
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-white mb-2 transition-all duration-300 ease-out">
                          {product.name}
                        </h3>
                        <p className="text-xl font-bold text-white mb-4 transition-all duration-300 ease-out">${product.price}</p>
                        
                        <div className="flex justify-center space-x-2 text-xs mb-4">
                          <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20 transform hover:scale-105 transition-all duration-300 ease-out">
                            <span className="text-white/80">Size: </span>
                            <span className="text-white font-medium">{product.size}</span>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20 transform hover:scale-105 transition-all duration-300 ease-out">
                            <span className="text-white/80">Color: </span>
                            <span className="text-white font-medium">{product.color}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => addToCart(product)}
                            aria-label={`Add ${product.name} to cart`}
                            className="flex-1 bg-white/12 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20 text-white font-medium hover:bg-white/18 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
                          >
                            Add to Cart
                          </button>
                          <button 
                            onClick={() => sendToWhatsApp(product)}
                            aria-label={`Send ${product.name} via WhatsApp`}
                            className="bg-green-500/20 backdrop-blur-xl rounded-full px-3 py-2 border border-green-400/30 text-white font-medium hover:bg-green-500/30 transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Bottom Navigation Dots - Only show in carousel mode */}
        {viewMode === 'carousel' && (
          <nav className="flex justify-center space-x-2 pb-6 sm:pb-8 px-4" aria-label="Product navigation" role="tablist">
            <h3 className="sr-only">Product Navigation Dots</h3>
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => goToProduct(index)}
                disabled={isTransitioning}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to product ${index + 1} of ${products.length}`}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ease-out transform hover:scale-125 ${
                  index === currentIndex
                    ? 'bg-white/90 scale-125 shadow-lg'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </nav>
        )}
      </div>

      {/* Background Customizer Modal */}
      {isCustomizerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="customizer-title">
          <div className="bg-white/12 backdrop-blur-2xl rounded-3xl border border-white/25 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl transform transition-all duration-500 ease-out scale-100 animate-slideUp" role="document">
            <div className="flex justify-between items-center mb-6">
              <h2 id="customizer-title" className="text-2xl font-bold text-white flex items-center space-x-2">
                <Palette className="w-6 h-6" />
                <span>Customize Background</span>
              </h2>
              <button
                onClick={() => {
                  audioContext?.playClickSound();
                  setIsCustomizerOpen(false);
                  setBackgroundInput("");
                }}
                aria-label="Close background customizer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Custom URL Input */}
            <div className="mb-6">
              <label htmlFor="background-input" className="block text-white font-medium mb-3">
                Custom Background URL or CSS Gradient
              </label>
              <div className="flex space-x-2">
                <input
                  id="background-input"
                  type="text"
                  value={backgroundInput}
                  onChange={(e) => setBackgroundInput(e.target.value)}
                  placeholder="Enter image URL or CSS gradient..."
                  className="flex-1 bg-white/10 backdrop-blur-xl rounded-full px-4 py-3 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 ease-out"
                />
                <button
                  onClick={applyBackground}
                  disabled={!backgroundInput.trim()}
                  aria-label="Apply custom background"
                  className="bg-white/15 backdrop-blur-xl rounded-full px-4 py-3 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/60 text-sm mt-2">
                Examples: Image URL, linear-gradient(135deg, #667eea 0%, #764ba2 100%), radial-gradient(circle, #ff6b6b, #4ecdc4)
              </p>
            </div>

            {/* Preset Backgrounds */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Preset Backgrounds</h3>
              <div className="grid grid-cols-2 gap-3">
                {presetBackgrounds.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      audioContext?.playClickSound();
                      setCurrentBackground(preset.url);
                    }}
                    className={`relative h-20 rounded-xl border-2 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 overflow-hidden ${
                      currentBackground === preset.url
                        ? 'border-white/60 ring-2 ring-white/30'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    style={{
                      backgroundImage: preset.url.includes('gradient') ? preset.url : `url('${preset.url}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-medium text-sm bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                        {preset.name}
                      </span>
                    </div>
                    {currentBackground === preset.url && (
                      <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetBackground}
              className="w-full bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 text-white font-medium hover:bg-white/15 transition-all duration-400 ease-out transform hover:scale-[1.01] active:scale-[0.99] shadow-lg"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Shopping Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <div className="bg-white/12 backdrop-blur-2xl rounded-3xl border border-white/25 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl transform transition-all duration-500 ease-out scale-100 animate-slideUp" role="document">
            <div className="flex justify-between items-center mb-6">
              <h2 id="cart-title" className="text-2xl font-bold text-white">Shopping Cart ({getTotalItems()} items)</h2>
              <button
                onClick={() => {
                  audioContext?.playClickSound();
                  setIsCartOpen(false);
                }}
                aria-label="Close shopping cart"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/70">Your cart is empty</p>
              </div>
            ) : (
              <>
                <h3 className="sr-only">Cart Items List</h3>
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                   
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{item.name}</h4>
                          <p className="text-white/70 text-sm">{item.color} • {item.size}</p>
                          <p className="text-white font-bold">${item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="p-1 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 ease-out transform hover:scale-110 active:scale-95"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                         
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="p-1 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 ease-out transform hover:scale-110 active:scale-95"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="p-1 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 ml-2"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    
                  ))}
                </div>

                <div className="border-t border-white/25 pt-4 mb-6">
                  <h3 className="sr-only">Order Total Summary</h3>
                  <div className="flex justify-between items-center text-xl font-bold text-white">
                    <span>Total:</span>
<span aria-label={`Total price: ${getTotalPrice()} dollars`}>${getTotalPrice()}</span>                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => sendToWhatsApp()}
                    aria-label="Send order via WhatsApp"
                    className="flex-1 bg-green-500/20 backdrop-blur-xl rounded-full px-6 py-3 border border-green-400/30 text-white font-medium hover:bg-green-500/30 transition-all duration-400 ease-out transform hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;