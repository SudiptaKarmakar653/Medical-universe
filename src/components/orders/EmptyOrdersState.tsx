
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package, Sparkles } from 'lucide-react';

interface EmptyOrdersStateProps {
  hasPhoneNumber: boolean;
  onUpdateProfile: () => void;
}

const EmptyOrdersState = ({ hasPhoneNumber, onUpdateProfile }: EmptyOrdersStateProps) => {
  if (!hasPhoneNumber) {
    return (
      <Card className="max-w-md mx-auto border-2 border-dashed border-orange-200 bg-orange-50">
        <CardContent className="text-center py-12">
          <div className="mx-auto mb-6 bg-orange-100 h-20 w-20 rounded-full flex items-center justify-center">
            <Package className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-orange-900">Phone Number Required</h3>
          <p className="text-orange-700 mb-6 leading-relaxed">
            Please add a phone number to your profile to view your orders. 
            Orders are tracked by phone number for delivery coordination.
          </p>
          <Button 
            onClick={onUpdateProfile}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Update Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardContent className="text-center py-12">
        <div className="mx-auto mb-6 bg-blue-100 h-20 w-20 rounded-full flex items-center justify-center relative">
          <ShoppingBag className="h-10 w-10 text-blue-600" />
          <Sparkles className="h-4 w-4 text-blue-400 absolute -top-1 -right-1" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-blue-900">No Orders Yet</h3>
        <p className="text-blue-700 mb-6 leading-relaxed">
          Start your health journey with us! Browse our wide selection of 
          medicines and healthcare products.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link to="/store" className="inline-flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Start Shopping
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyOrdersState;
