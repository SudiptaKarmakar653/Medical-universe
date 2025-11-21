
import { useState, useEffect } from 'react';
import { Cart, CartItem } from '@/types/medical-store';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCart(userId: string | null) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch or create a cart for the user
  const fetchCart = async () => {
    if (!userId) {
      setLoading(false);
      setCartItems([]);
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching cart for clerk user:', userId);

      // Check if user has existing carts using clerk_user_id
      const { data: existingCarts, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('clerk_user_id', userId)
        .order('created_at', { ascending: false });

      if (cartError) {
        console.error('Error fetching cart:', cartError);
        throw cartError;
      }

      let currentCart = existingCarts?.[0] || null;

      // If multiple carts exist, clean up duplicates
      if (existingCarts && existingCarts.length > 1) {
        console.log('Found multiple carts, cleaning up duplicates');
        const cartsToDelete = existingCarts.slice(1);
        for (const cart of cartsToDelete) {
          // Delete cart items first
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);
          
          // Delete the cart
          await supabase
            .from('carts')
            .delete()
            .eq('id', cart.id);
        }
      }

      // If no cart exists, create one
      if (!currentCart) {
        console.log('Creating new cart for clerk user:', userId);
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ 
            clerk_user_id: userId,
            user_id: crypto.randomUUID() // Generate a UUID for user_id field
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating cart:', createError);
          throw createError;
        }
        currentCart = newCart;
      }

      // Fetch cart items with medicine details
      if (currentCart) {
        const { data: items, error: itemsError } = await supabase
          .from('cart_items')
          .select(`
            *,
            medicine:medicine_id(*)
          `)
          .eq('cart_id', currentCart.id);
        
        if (itemsError) {
          console.error('Error fetching cart items:', itemsError);
          throw itemsError;
        }

        console.log('Fetched cart items:', items);

        setCart({
          id: currentCart.id,
          user_id: currentCart.user_id,
          created_at: currentCart.created_at,
          updated_at: currentCart.updated_at,
          items: items || []
        });

        setCartItems(items as CartItem[] || []);
      }
    } catch (error) {
      console.error('Error in fetchCart:', error);
      setCart(null);
      setCartItems([]);
      toast({
        title: "Error",
        description: "Failed to load your cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add an item to the cart
  const addToCart = async (medicineId: string, quantity: number = 1) => {
    if (!userId || !cart) {
      console.log('Cannot add to cart - user not logged in or cart not available');
      toast({
        title: "Error",
        description: "Please log in to add items to your cart",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Adding to cart:', { medicineId, quantity, cartId: cart.id });
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.medicine_id === medicineId);
      
      if (existingItem) {
        // Update quantity if item already in cart
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Add new item to cart
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            medicine_id: medicineId,
            quantity,
            clerk_user_id: userId // Add clerk_user_id for easier querying
          });
        
        if (error) throw error;
      }
      
      // Refresh cart
      await fetchCart();
      
      toast({
        title: "Item added",
        description: "Item has been added to your cart",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Could not add item to cart",
        variant: "destructive"
      });
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!userId || !cart || quantity < 1) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Refresh cart
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Could not update item quantity",
        variant: "destructive"
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    if (!userId || !cart) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Refresh cart
      await fetchCart();
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Could not remove item from cart",
        variant: "destructive"
      });
    }
  };

  // Clear all items from cart
  const clearCart = async () => {
    if (!userId || !cart) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);
      
      if (error) throw error;
      
      // Refresh cart
      await fetchCart();
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Could not clear your cart",
        variant: "destructive"
      });
    }
  };

  // Calculate total price for items in cart
  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => {
      const price = item.medicine?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  useEffect(() => {
    console.log('useCart useEffect triggered with userId:', userId);
    fetchCart();
  }, [userId]);

  return {
    cart,
    cartItems,
    loading,
    addToCart: async (medicineId: string, quantity: number = 1) => {
      if (!userId || !cart) {
        console.log('Cannot add to cart - user not logged in or cart not available');
        toast({
          title: "Error",
          description: "Please log in to add items to your cart",
          variant: "destructive"
        });
        return;
      }
      
      try {
        console.log('Adding to cart:', { medicineId, quantity, cartId: cart.id });
        
        // Check if item already exists in cart
        const existingItem = cartItems.find(item => item.medicine_id === medicineId);
        
        if (existingItem) {
          // Update quantity if item already in cart
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id);
          
          if (error) throw error;
        } else {
          // Add new item to cart
          const { error } = await supabase
            .from('cart_items')
            .insert({
              cart_id: cart.id,
              medicine_id: medicineId,
              quantity,
              clerk_user_id: userId // Add clerk_user_id for easier querying
            });
          
          if (error) throw error;
        }
        
        // Refresh cart
        await fetchCart();
        
        toast({
          title: "Item added",
          description: "Item has been added to your cart",
        });
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast({
          title: "Error",
          description: "Could not add item to cart",
          variant: "destructive"
        });
      }
    },
    updateQuantity: async (itemId: string, quantity: number) => {
      if (!userId || !cart || quantity < 1) return;
      
      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
        
        if (error) throw error;
        
        // Refresh cart
        await fetchCart();
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast({
          title: "Error",
          description: "Could not update item quantity",
          variant: "destructive"
        });
      }
    },
    removeFromCart: async (itemId: string) => {
      if (!userId || !cart) return;
      
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);
        
        if (error) throw error;
        
        // Refresh cart
        await fetchCart();
        
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart",
        });
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast({
          title: "Error",
          description: "Could not remove item from cart",
          variant: "destructive"
        });
      }
    },
    clearCart: async () => {
      if (!userId || !cart) return;
      
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id);
        
        if (error) throw error;
        
        // Refresh cart
        await fetchCart();
        
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart",
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast({
          title: "Error",
          description: "Could not clear your cart",
          variant: "destructive"
        });
      }
    },
    calculateTotal: () => {
      return cartItems.reduce((total, item) => {
        const price = item.medicine?.price || 0;
        return total + (price * item.quantity);
      }, 0);
    },
    fetchCart,
    refreshOrders: fetchCart
  };
}
