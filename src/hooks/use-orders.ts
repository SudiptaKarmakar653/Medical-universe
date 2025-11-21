import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderMedicine {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: string;
  quantity: number;
  price: number;
  created_at: string;
  medicine?: OrderMedicine;
}

interface Order {
  id: string;
  phone_number: string;
  total_price: number;
  address: string;
  phone: string;
  prescription_url?: string;
  status: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  status_message: string | null;
  created_at: string;
}

// Helper function to normalize phone numbers
const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it starts with country code (91 for India), keep it as is
  // If it's a 10-digit number, assume it's Indian and add the country code
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  } else if (digitsOnly.length === 13 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly.substring(1)}`;
  }
  
  // Return as is if we can't normalize
  return phone;
};

export function useOrders(userPhone?: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [userPhone]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      if (!userPhone) {
        console.log('No user phone found, skipping orders fetch');
        setOrders([]);
        return;
      }

      const normalizedPhone = normalizePhoneNumber(userPhone);
      console.log('Fetching orders for phone:', userPhone, 'normalized:', normalizedPhone);
      
      // Query orders using the phone_number field - try both original and normalized
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`phone_number.eq.${userPhone},phone_number.eq.${normalizedPhone},phone.eq.${userPhone},phone.eq.${normalizedPhone}`)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Orders query error:', ordersError);
        throw ordersError;
      }

      console.log('Fetched orders:', ordersData);

      const ordersWithItems: Order[] = [];
      
      for (const orderData of (ordersData || [])) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            medicine:medicine_id(*)
          `)
          .eq('order_id', orderData.id);
        
        if (itemsError) {
          console.error('Items query error:', itemsError);
          // Don't throw here, just log and continue
        }
        
        const order: Order = {
          id: orderData.id,
          phone_number: orderData.phone_number,
          total_price: orderData.total_price,
          address: orderData.address,
          phone: orderData.phone,
          prescription_url: orderData.prescription_url,
          status: orderData.status,
          tracking_number: orderData.tracking_number,
          estimated_delivery: orderData.estimated_delivery,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          items: itemsData || []
        };
        
        ordersWithItems.push(order);
      }

      console.log('Orders with items:', ordersWithItems);
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    address: string,
    phone: string,
    cartItems: any[],
    totalPrice: number,
    prescriptionUrl?: string
  ): Promise<string | null> => {
    try {
      if (!phone) {
        throw new Error('Phone number is required for placing orders');
      }

      const normalizedPhone = normalizePhoneNumber(phone);
      console.log('Creating order for phone:', phone, 'normalized:', normalizedPhone);
      console.log('Cart items for order:', cartItems);

      // Validate cart items
      const validCartItems = cartItems.filter(item => {
        console.log('Processing cart item:', item);
        return item.medicine_id && item.medicine && item.quantity > 0;
      });

      if (validCartItems.length === 0) {
        throw new Error('No valid items in cart. Please add items to your cart before placing an order.');
      }

      // Generate tracking number
      const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Set estimated delivery (3 days from now)
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

      // Create order with normalized phone_number
      const orderData = {
        phone_number: normalizedPhone, // Use normalized phone for consistency
        total_price: totalPrice,
        address,
        phone: normalizedPhone, // Also normalize the phone field
        prescription_url: prescriptionUrl || null,
        status: 'pending',
        tracking_number: trackingNumber,
        estimated_delivery: estimatedDelivery.toISOString().split('T')[0]
      };

      console.log('Order data to insert:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Created order:', order);

      // Create order items
      const orderItems = validCartItems.map(item => {
        const medicinePrice = item.medicine?.price || 0;
        return {
          order_id: order.id,
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          price: medicinePrice
        };
      });

      console.log('Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      // Create initial order status history
      const { error: statusError } = await supabase
        .from('order_status_history')
        .insert([{
          order_id: order.id,
          status: 'pending',
          status_message: 'Order placed successfully'
        }]);
      
      if (statusError) {
        console.warn('Could not create order status history:', statusError);
      }

      // Refresh orders after successful creation
      await fetchOrders();
      
      toast({
        title: "Order placed successfully!",
        description: `Your order has been placed. Tracking number: ${trackingNumber}`,
      });

      return order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      
      let errorMessage = "Failed to place order";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  const getOrderStatusHistory = async (orderId: string): Promise<OrderStatusHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching order status history:', error);
        const order = orders.find(o => o.id === orderId);
        if (order) {
          return [{
            id: '1',
            order_id: orderId,
            status: order.status,
            status_message: `Order is currently ${order.status}`,
            created_at: order.created_at
          }];
        }
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching order status history:', error);
      return [];
    }
  };

  return {
    orders,
    loading,
    createOrder,
    refreshOrders: fetchOrders,
    getOrderStatusHistory
  };
}
