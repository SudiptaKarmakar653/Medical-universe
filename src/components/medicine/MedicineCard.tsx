
import React from 'react';
import { Medicine } from '@/types/medical-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, CheckCircle, LogIn, Star, Shield } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MedicineCardProps {
  medicine: Medicine;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine }) => {
  const { user } = useAuth();
  const { addToCart, cartItems, loading } = useCart(user?.id || null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isInCart = cartItems.some(item => item.medicine_id === medicine.id);
  
  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your cart",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    await addToCart(medicine.id);
  };
  
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300 rounded-2xl overflow-hidden bg-white">
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
          {medicine.image_url ? (
            <img
              src={medicine.image_url}
              alt={medicine.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-200 rounded-full p-6 mx-auto mb-3 w-20 h-20 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-gray-400" />
                </div>
                <span className="text-gray-500 text-sm">No image available</span>
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
              {medicine.category}
            </span>
          </div>
          
          {/* Discount Badge (if needed) */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              <Star className="h-3 w-3 mr-1" />
              <span>Genuine</span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {medicine.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{medicine.description}</p>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-blue-600">₹{medicine.price.toFixed(2)}</span>
            <span className="text-xs text-gray-500">MRP inclusive of all taxes</span>
          </div>
          
          <div className="text-right">
            <span className={`text-sm font-medium ${
              medicine.stock > 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {medicine.stock > 0 ? (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  In Stock
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Out of Stock
                </div>
              )}
            </span>
            {medicine.stock > 0 && medicine.stock <= 10 && (
              <p className="text-xs text-orange-600 mt-1">Only {medicine.stock} left</p>
            )}
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          {!user ? (
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <LogIn className="mr-2 h-4 w-4" /> 
              Login to Add
            </Button>
          ) : (
            <Button 
              onClick={handleAddToCart} 
              disabled={medicine.stock <= 0 || loading}
              className={`w-full py-3 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                isInCart 
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white" 
                  : medicine.stock <= 0 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Adding...
                </div>
              ) : isInCart ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> 
                  Added to Cart
                </>
              ) : medicine.stock <= 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> 
                  Add to Cart
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;
