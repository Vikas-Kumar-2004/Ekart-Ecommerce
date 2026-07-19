import React from 'react';
import { Button } from './ui/button';
import { FaWhatsapp } from 'react-icons/fa';
import { LogIn, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GuestActionModal = ({ isOpen, onClose, product, quantity = 1 }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleWhatsAppClick = () => {
    const phoneNumber = import.meta.env.VITE_PHONE_NUMBER;
    const currentUrl = window.location.origin + `/products/${product.id}`;
    const message = `Hi! I'm interested in *${product.productName}*. Price is ₹${product.productPrice}. Here is the link: ${currentUrl}. Can you share more details?`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCartIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Login Required</h2>
          <p className="text-sm text-gray-500 mt-2">
            Please login to add items to your cart, or inquire directly via WhatsApp.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={(e) => { 
              e.stopPropagation(); 
              localStorage.setItem('pendingCartItem', JSON.stringify({ productId: product.id, quantity }));
              navigate('/login'); 
            }} 
            className="w-full bg-pink-600 hover:bg-pink-700 py-6 text-base"
          >
            <LogIn className="w-5 h-5 mr-2" /> Login to Continue
          </Button>
          <Button 
            variant="outline"
            onClick={(e) => { e.stopPropagation(); handleWhatsAppClick(); }} 
            className="w-full border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 py-6 text-base"
          >
            <FaWhatsapp className="w-5 h-5 mr-2" /> Inquire on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

// Extracted simple cart icon so we don't have to import from lucide-react if not needed, but we can just import it.
import { ShoppingCart as ShoppingCartIcon } from 'lucide-react';

export default GuestActionModal;
