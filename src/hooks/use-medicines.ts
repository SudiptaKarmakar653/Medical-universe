
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMedicines = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: medicines = [], isLoading, error, refetch } = useQuery({
    queryKey: ['medicines', searchQuery, selectedCategory],
    queryFn: async () => {
      console.log('Fetching medicines with:', { searchQuery, selectedCategory });
      
      let query = supabase
        .from('medicines')
        .select('*')
        .order('name');

      // Apply search filter
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching medicines:', error);
        throw error;
      }

      console.log('Fetched medicines:', data);
      return data || [];
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['medicine-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('category')
        .order('category');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // Properly type and filter the categories
      const uniqueCategories = Array.from(
        new Set(
          (data || [])
            .map(item => item.category)
            .filter((category): category is string => typeof category === 'string')
        )
      );
      return uniqueCategories;
    },
  });

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  const refreshMedicines = () => {
    refetch();
    toast({
      title: 'Medicines refreshed',
      description: 'Medicine list has been updated.',
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    if (error) {
      console.error('Medicine query error:', error);
      toast({
        title: 'Error loading medicines',
        description: 'Failed to fetch medicines. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return {
    medicines,
    isLoading,
    loading: isLoading,
    error,
    searchQuery,
    selectedCategory,
    categories,
    refreshMedicines,
    handleSearch,
    handleCategorySelect,
  };
};
