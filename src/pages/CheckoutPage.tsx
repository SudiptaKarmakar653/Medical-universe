import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTitle } from '@/hooks/use-title';
import PageLayout from '@/components/layout/PageLayout';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/context/auth-provider';
import { useOrders } from '@/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CheckoutPage = () => {
  useTitle('Checkout - Medical Universe');
  const { user } = useAuth();
  const { cartItems, loading: cartLoading, calculateTotal, clearCart } = useCart(user?.id || null);
  
  // Get user phone from Clerk - consistent with OrdersPage
  let userPhone = null;
  if (user?.primaryPhoneNumber?.phoneNumber) {
    userPhone = user.primaryPhoneNumber.phoneNumber;
  } else if (user?.phoneNumbers && user.phoneNumbers.length > 0) {
    userPhone = user.phoneNumbers[0].phoneNumber;
  }
  
  const { createOrder } = useOrders(userPhone);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(userPhone || ''); // Pre-fill with user's phone
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cartTotal = calculateTotal();
  const totalWithDelivery = cartTotal + 50;
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrescription(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to place an order",
        variant: "destructive"
      });
      return;
    }
    
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive"
      });
      return;
    }
    
    if (!address.trim() || !phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your delivery address and phone number",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      console.log('Starting order submission...');
      console.log('Cart items:', cartItems);
      console.log('User:', user);
      console.log('Phone being used for order:', phone.trim());
      
      // Upload prescription if provided (for now, we'll skip file upload and just store URL)
      let prescriptionUrl = null;
      if (prescription) {
        prescriptionUrl = "prescription_uploaded.pdf";
      }
      
      console.log('Calling createOrder with:', {
        address: address.trim(),
        phone: phone.trim(), // Use the phone from the form (which is pre-filled with user's phone)
        cartItems,
        totalWithDelivery,
        prescriptionUrl
      });
      
      // Create order using the phone number from the form
      const orderId = await createOrder(
        address.trim(), 
        phone.trim(), // This should match the phone used in OrdersPage
        cartItems, 
        totalWithDelivery,
        prescriptionUrl
      );
      
      console.log('CreateOrder returned:', orderId);
      
      if (orderId) {
        console.log('Order created successfully:', orderId);
        
        // Clear the cart
        try {
          await clearCart();
          console.log('Cart cleared successfully');
        } catch (clearError) {
          console.warn('Could not clear cart:', clearError);
          // Don't fail the order for this
        }
        
        // Show success message
        toast({
          title: "Order Placed Successfully!",
          description: "Your order has been placed and you will receive a confirmation shortly.",
        });
        
        // Redirect to order confirmation
        navigate('/order-confirmation');
      } else {
        console.error('No order ID returned from createOrder');
        toast({
          title: "Order Failed",
          description: "Failed to create your order. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in checkout submission:', error);
      
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <PageLayout className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You need to be logged in to checkout.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/auth')}>
              Log In / Sign Up
            </Button>
          </CardFooter>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout userRole="patient" className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/cart')}
          className="p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Cart</span>
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
      </div>
      
      {cartLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : cartItems.length === 0 ? (
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6 pb-4 text-center">
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-4">
              You need to add items to your cart before checkout.
            </p>
            <Button onClick={() => navigate('/store')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Enter your full address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      This phone number will be used to track your order and for delivery coordination.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.medicine?.name}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium">
                        ₹{((item.medicine?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Any specific instructions for delivery"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prescription">Upload Prescription (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Input 
                        id="prescription" 
                        type="file" 
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      <Label htmlFor="prescription" className="cursor-pointer block">
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <span className="block font-medium text-gray-600 mb-1">
                          {prescription ? prescription.name : "Click to upload prescription"}
                        </span>
                        <span className="text-sm text-gray-500">
                          Supported formats: JPG, PNG, PDF
                        </span>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>₹50.00</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{totalWithDelivery.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Payment method: Cash on Delivery
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    type="submit"
                    disabled={submitting || cartItems.length === 0}
                  >
                    {submitting ? "Processing..." : "Place Order"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      )}
    </PageLayout>
  );
};

export default CheckoutPage;
