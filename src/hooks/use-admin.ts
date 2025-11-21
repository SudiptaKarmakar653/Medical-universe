import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  status: string;
  user_id?: string;
  total_price: number;
  created_at: string;
  address: string;
  phone: string;
  phone_number: string;
  tracking_number?: string;
  estimated_delivery?: string;
  items?: any[];
  profiles?: any;
  [key: string]: any;
}

interface Medicine {
  id?: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  stock_quantity: number;
  requires_prescription: boolean;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

// Helper function to generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useAdmin = () => {
  const [adminLoading, setAdminLoading] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { toast } = useToast();

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    setAdminLoading(true);
    
    try {
      // Fixed admin credentials - exact match
      if (username === 'SUBHODEEP PAL' && password === 'Pal@2005') {
        // Clean up any existing auth state first
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (err) {
          console.log('Cleanup signout:', err);
        }

        // Wait a moment for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create Supabase session for admin
        const adminEmail = 'admin@mediverse.com';
        const adminPassword = 'AdminPal@2005';
        
        try {
          // Try to sign in with admin credentials
          let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword,
          });

          if (signInError && signInError.message.includes('Invalid login credentials')) {
            // If sign in fails, create the admin account
            console.log('Creating admin account...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: adminEmail,
              password: adminPassword,
              options: {
                data: {
                  name: 'SUBHODEEP PAL',
                  role: 'admin'
                },
                emailRedirectTo: `${window.location.origin}/admin/medicines`
              }
            });

            if (signUpError) {
              console.error('Failed to create admin account:', signUpError);
              throw signUpError;
            }

            console.log('Admin account created, attempting sign in...');
            
            // Wait a moment for account creation to complete
            await new Promise(resolve => setTimeout(resolve, 2000));

            // After signup, try to sign in again
            const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
              email: adminEmail,
              password: adminPassword,
            });

            if (retryError) {
              console.error('Failed to sign in after signup:', retryError);
              // If still failing, try one more time after longer wait
              await new Promise(resolve => setTimeout(resolve, 3000));
              const { data: finalTry, error: finalError } = await supabase.auth.signInWithPassword({
                email: adminEmail,
                password: adminPassword,
              });
              
              if (finalError) {
                console.error('Final sign in attempt failed:', finalError);
                throw finalError;
              }
              signInData = finalTry;
            } else {
              signInData = retrySignIn;
            }
          } else if (signInError) {
            console.error('Sign in error:', signInError);
            throw signInError;
          }

          console.log('Admin signed in successfully:', signInData);

          // Verify we have a valid session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !session) {
            console.error('No valid session after login:', sessionError);
            throw new Error('Failed to establish valid session');
          }

          console.log('Valid session confirmed:', session.user.id);

          // Ensure admin profile exists
          if (signInData.user) {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', signInData.user.id)
              .maybeSingle();

            if (!existingProfile) {
              // Create admin profile
              console.log('Creating admin profile...');
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: signInData.user.id,
                  name: 'SUBHODEEP PAL',
                  email: adminEmail,
                  role: 'admin',
                  full_name: 'SUBHODEEP PAL',
                  is_approved: true
                });

              if (profileError) {
                console.error('Error creating admin profile:', profileError);
              } else {
                console.log('Admin profile created successfully');
              }
            } else if (existingProfile.role !== 'admin') {
              // Update existing profile to admin
              console.log('Updating profile to admin role...');
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  role: 'admin', 
                  is_approved: true,
                  name: 'SUBHODEEP PAL',
                  full_name: 'SUBHODEEP PAL'
                })
                .eq('id', signInData.user.id);

              if (updateError) {
                console.error('Error updating profile to admin:', updateError);
              } else {
                console.log('Profile updated to admin successfully');
              }
            }
          }

        } catch (supabaseError) {
          console.error('Supabase auth error:', supabaseError);
          throw supabaseError; // Don't continue if Supabase auth fails
        }

        toast({
          title: 'Login successful',
          description: 'Welcome to the admin panel, SUBHODEEP PAL',
        });
        
        // Store admin session
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUser', username);
        return true;
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid credentials. Please use: SUBHODEEP PAL / Pal@2005',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: 'Login failed',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setAdminLoading(false);
    }
  };

  const checkAdminSession = () => {
    // Check admin session from localStorage
    return localStorage.getItem('adminLoggedIn') === 'true';
  };

  const adminLogout = async () => {
    try {
      // Sign out from Supabase as well
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }
    
    // Clear admin session
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  const fetchAllOrders = async () => {
    setOrdersLoading(true);
    try {
      console.log('Fetching all orders...');
      
      // Fetch orders with order items and medicine details
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            medicine_id,
            quantity,
            price,
            medicines(
              id,
              name,
              category,
              price
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Raw orders data:', ordersData);

      // Transform the data to match the expected format
      const transformedOrders = (ordersData || []).map(order => ({
        ...order,
        items: order.order_items?.map(item => ({
          id: item.id,
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          price: item.price,
          medicine: item.medicines
        })) || []
      }));

      console.log('Transformed orders:', transformedOrders);
      setAllOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders. Please try again.',
        variant: 'destructive',
      });
      setAllOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log('Starting order status update:', { orderId, status });
      
      if (!orderId || !status) {
        throw new Error('Order ID and status are required');
      }

      // Validate orderId format (should be a UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(orderId)) {
        console.error('Invalid UUID format:', orderId);
        throw new Error('Invalid order ID format');
      }

      setAdminLoading(true);
      
      // First, check if the order exists
      console.log('Checking if order exists with ID:', orderId);
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('id, status, phone_number')
        .eq('id', orderId)
        .limit(1);

      if (checkError) {
        console.error('Error checking order existence:', checkError);
        throw checkError;
      }

      console.log('Order check result:', existingOrder);

      if (!existingOrder || existingOrder.length === 0) {
        console.error('No order found with ID:', orderId);
        console.log('All available orders:', allOrders.map(o => ({ id: o.id, status: o.status })));
        throw new Error('Order not found in database');
      }

      console.log('Order exists, proceeding with update');

      // Use the admin RPC function to update order status
      const { error: rpcError } = await supabase.rpc('admin_update_order_status' as any, {
        order_id: orderId,
        new_status: status
      });

      if (rpcError) {
        console.error('RPC update failed, trying direct update:', rpcError);
        
        // Fallback to direct update
        const { data: directUpdate, error: directError } = await supabase
          .from('orders')
          .update({ 
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .select('*');

        if (directError) {
          console.error('Direct update also failed:', directError);
          throw directError;
        }

        console.log('Direct update result:', directUpdate);

        if (!directUpdate || directUpdate.length === 0) {
          throw new Error('Update operation completed but no rows were affected - possible RLS restriction');
        }
      } else {
        console.log('RPC update successful');
      }

      // Update local state immediately
      setAllOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: status, updated_at: new Date().toISOString() } 
            : order
        )
      );

      // Create status history entry (don't fail the main operation if this fails)
      try {
        const { error: historyError } = await supabase
          .from('order_status_history')
          .insert([{
            order_id: orderId,
            status: status,
            status_message: `Order status changed to ${status}`
          }]);

        if (historyError) {
          console.warn('Could not create status history:', historyError);
        }
      } catch (historyErr) {
        console.warn('Status history creation failed:', historyErr);
      }

      toast({
        title: 'Success',
        description: `Order status updated to ${status}`,
      });

      // Force a fresh fetch to ensure data consistency
      setTimeout(() => {
        fetchAllOrders();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: 'Error',
        description: `Failed to update order status: ${errorMessage}`,
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setAdminLoading(false);
    }
  };

  const addMedicine = async (medicine: Medicine) => {
    try {
      // Verify we have a valid session before attempting to add medicine
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('No valid session when adding medicine:', sessionError);
        throw new Error('Authentication session expired. Please log in again.');
      }

      console.log('Valid session confirmed for adding medicine:', session.user.id);

      // Add medicine to Supabase
      const { error } = await supabase
        .from('medicines')
        .insert([{
          name: medicine.name,
          category: medicine.category,
          price: medicine.price,
          description: medicine.description,
          image_url: medicine.image_url,
          stock: medicine.stock_quantity
        }]);

      if (error) {
        console.error('Error adding medicine:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: `Medicine "${medicine.name}" added successfully`,
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add medicine',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateMedicine = async (medicine: Medicine) => {
    try {
      if (!medicine.id) {
        throw new Error('Medicine ID is required for update');
      }

      // Verify we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('No valid session when updating medicine:', sessionError);
        throw new Error('Authentication session expired. Please log in again.');
      }

      // Update medicine in Supabase
      const { error } = await supabase
        .from('medicines')
        .update({
          name: medicine.name,
          category: medicine.category,
          price: medicine.price,
          description: medicine.description,
          image_url: medicine.image_url,
          stock: medicine.stock_quantity
        })
        .eq('id', medicine.id);

      if (error) {
        console.error('Error updating medicine:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: `Medicine "${medicine.name}" updated successfully`,
      });
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update medicine',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteMedicine = async (medicineId: string) => {
    try {
      // Verify we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('No valid session when deleting medicine:', sessionError);
        throw new Error('Authentication session expired. Please log in again.');
      }

      // Delete medicine from Supabase
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', medicineId);

      if (error) {
        console.error('Error deleting medicine:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Medicine deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete medicine',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const approveDoctorProfile = async (doctor: any) => {
    try {
      console.log('Starting doctor approval process for:', doctor);
      setAdminLoading(true);
      
      const doctorEmail = doctor.email;
      const doctorFullName = doctor.display_name || doctor.full_name || doctor.name || 'Doctor';
      const doctorId = doctor.id || generateUUID();

      // Step 1: Use Supabase function to approve the doctor
      console.log('Calling approve_doctor_profile function...');
      const { error: approveError } = await supabase.rpc('approve_doctor_profile', {
        doctor_id: doctorId,
        doctor_name: doctorFullName,
        doctor_email: doctorEmail,
        doctor_specialization: doctor.specialization || 'General Medicine',
        doctor_hospital: doctor.hospital_name || doctor.hospital_affiliation || 'Medical Center',
        doctor_experience: doctor.years_experience || doctor.years_of_experience || 5,
        doctor_phone: doctor.phone || '+1234567890',
        doctor_fee: doctor.consultation_fee || 150
      });

      if (approveError) {
        console.error('Error calling approve_doctor_profile:', approveError);
        throw approveError;
      }

      console.log('Doctor profile approved successfully via function');

      // Step 2: If this is from a verification request, update the request status
      if (doctor.type === 'verification' || doctor.id) {
        try {
          const { error: updateRequestError } = await supabase
            .from('doctor_verification_requests')
            .update({
              status: 'approved',
              reviewed_at: new Date().toISOString(),
              reviewed_by: 'SUBHODEEP PAL'
            })
            .eq('id', doctor.id);
            
          if (updateRequestError) {
            console.warn('Could not update verification request status:', updateRequestError);
          } else {
            console.log('Updated verification request status to approved');
          }
        } catch (err) {
          console.warn('Failed to update verification request:', err);
        }
      }

      toast({
        title: 'Success',
        description: `${doctorFullName} has been approved as a doctor`,
      });

      console.log('Doctor approval process completed successfully');
      
    } catch (error) {
      console.error('Error approving doctor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve doctor';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setAdminLoading(false);
    }
  };

  const removeDoctorProfile = async (doctorId: string) => {
    try {
      console.log('Removing doctor profile:', doctorId);
      
      // Remove from doctor_profiles table
      const { error: doctorError } = await supabase
        .from('doctor_profiles')
        .delete()
        .eq('id', doctorId);

      if (doctorError) {
        console.error('Error removing doctor profile:', doctorError);
        throw doctorError;
      }

      // Update the corresponding profile to remove doctor role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'patient',
          is_approved: false 
        })
        .eq('id', doctorId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't throw here as the main deletion succeeded
      }

      toast({
        title: 'Success',
        description: 'Doctor has been removed successfully',
      });
      
    } catch (error) {
      console.error('Error removing doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove doctor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    adminLogin,
    adminLoading,
    checkAdminSession,
    adminLogout,
    allOrders,
    fetchAllOrders,
    ordersLoading,
    updateOrderStatus,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    approveDoctorProfile,
    removeDoctorProfile,
  };
};
