
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, Calendar, MapPin, ChevronRight, Star } from 'lucide-react';
import ReviewModal from './ReviewModal';
import { useAuth } from '@/context/auth-provider';

interface OrderCardProps {
  order: {
    id: string;
    total_price: number;
    status: string;
    created_at: string;
    tracking_number?: string;
    estimated_delivery?: string;
    phone_number: string;
    items: Array<{
      id: string;
      quantity: number;
      medicine_id: string;
      medicine?: {
        name: string;
      };
    }>;
  };
}

const OrderCard = ({ order }: OrderCardProps) => {
  const { user } = useAuth();
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    medicineId: string;
    medicineName: string;
  }>({
    isOpen: false,
    medicineId: '',
    medicineName: ''
  });

  // Get user phone from Clerk  
  let userPhone = null;
  if (user?.primaryPhoneNumber?.phoneNumber) {
    userPhone = user.primaryPhoneNumber.phoneNumber;
  } else if (user?.phoneNumbers && user.phoneNumbers.length > 0) {
    userPhone = user.phoneNumbers[0].phoneNumber;
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          color: 'bg-yellow-500', 
          bgColor: 'bg-yellow-50 border-yellow-200', 
          textColor: 'text-yellow-700',
          label: 'Order Placed'
        };
      case 'processing':
        return { 
          color: 'bg-blue-500', 
          bgColor: 'bg-blue-50 border-blue-200', 
          textColor: 'text-blue-700',
          label: 'Processing'
        };
      case 'shipped':
        return { 
          color: 'bg-purple-500', 
          bgColor: 'bg-purple-50 border-purple-200', 
          textColor: 'text-purple-700',
          label: 'Shipped'
        };
      case 'delivered':
        return { 
          color: 'bg-green-500', 
          bgColor: 'bg-green-50 border-green-200', 
          textColor: 'text-green-700',
          label: 'Delivered'
        };
      case 'cancelled':
        return { 
          color: 'bg-red-500', 
          bgColor: 'bg-red-50 border-red-200', 
          textColor: 'text-red-700',
          label: 'Cancelled'
        };
      default:
        return { 
          color: 'bg-gray-500', 
          bgColor: 'bg-gray-50 border-gray-200', 
          textColor: 'text-gray-700',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const orderDate = new Date(order.created_at);
  const deliveryDate = order.estimated_delivery ? new Date(order.estimated_delivery) : null;

  const handleReviewClick = (medicineId: string, medicineName: string) => {
    setReviewModal({
      isOpen: true,
      medicineId,
      medicineName
    });
  };

  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      medicineId: '',
      medicineName: ''
    });
  };

  return (
    <>
      <Card className="mb-4 hover:shadow-lg transition-all duration-300 border border-gray-100 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-gray-500" />
                <span className="font-semibold text-lg">Order #{order.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border font-medium px-3 py-1`}>
                <div className={`w-2 h-2 rounded-full ${statusConfig.color} mr-2`}></div>
                {statusConfig.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">₹{order.total_price.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Order Timeline */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Ordered on</div>
                  <div className="text-sm text-gray-600">
                    {orderDate.toLocaleDateString('en-IN', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
              
              {deliveryDate && (
                <div className="flex items-center space-x-3">
                  <Truck className="h-4 w-4 text-green-600" />
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Expected by</div>
                    <div className="text-sm text-green-600 font-medium">
                      {deliveryDate.toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Items Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Items ({order.items?.length || 0})</h4>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {order.items?.slice(0, 2).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.medicine?.name || 'Medicine'}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    {/* Show review button for delivered items */}
                    {order.status === 'delivered' && userPhone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:bg-gray-50 text-xs"
                        onClick={() => handleReviewClick(item.medicine_id, item.medicine?.name || 'Medicine')}
                      >
                        <Star className="mr-1 h-3 w-3" />
                        Rate
                      </Button>
                    )}
                  </div>
                ))}
                {(order.items?.length || 0) > 2 && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    +{(order.items?.length || 0) - 2} more items
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Info */}
            {order.tracking_number && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">Tracking Number</div>
                    <div className="text-sm text-blue-700 font-mono">{order.tracking_number}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-3">
                <Button asChild variant="outline" className="border-gray-300 hover:bg-gray-50">
                  <Link to={`/order-confirmation/${order.id}`}>
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                
                {order.status === 'delivered' && userPhone && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      // Show review modal for first item if available
                      const firstItem = order.items?.[0];
                      if (firstItem) {
                        handleReviewClick(firstItem.medicine_id, firstItem.medicine?.name || 'Medicine');
                      }
                    }}
                  >
                    <Star className="mr-1 h-4 w-4" />
                    Rate & Review
                  </Button>
                )}
              </div>
              
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/store">
                  Buy Again
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        orderId={order.id}
        medicineId={reviewModal.medicineId}
        medicineName={reviewModal.medicineName}
        userPhone={userPhone || ''}
      />
    </>
  );
};

export default OrderCard;
