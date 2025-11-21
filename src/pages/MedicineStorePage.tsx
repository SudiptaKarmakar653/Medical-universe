import React, { useState } from 'react';
import { useTitle } from '@/hooks/use-title';
import { useMedicines } from '@/hooks/use-medicines';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/context/auth-provider';
import PageLayout from '@/components/layout/PageLayout';
import MedicineCard from '@/components/medicine/MedicineCard';
import ReviewsDashboard from '@/components/medicine/ReviewsDashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
const MedicineStorePage = () => {
  useTitle('Medicine Store - Medical Universe');
  const {
    user
  } = useAuth();
  const {
    medicines,
    loading: medicinesLoading,
    handleSearch,
    handleCategorySelect,
    categories
  } = useMedicines();
  const {
    cartItems
  } = useCart(user?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleSearch(value);
  };
  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(category);
    handleCategorySelect(category === 'all' ? null : category);
  };

  // Sort medicines
  const sortedMedicines = [...medicines].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return <PageLayout className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Store</h1>
            <p className="text-gray-600">Find and order medicines with ease</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>}
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="medicines" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-400">
            <TabsTrigger value="medicines" className="text-neutral-950">Medicines</TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center text-gray-950">
              <Star className="h-4 w-4 mr-2" />
              Reviews & Ratings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medicines">
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search medicines..." className="pl-10" value={searchTerm} onChange={e => handleSearchChange(e.target.value)} />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low">Price (Low to High)</SelectItem>
                    <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Medicines Grid */}
            {medicinesLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>)}
              </div> : sortedMedicines.length === 0 ? <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedMedicines.map(medicine => <MedicineCard key={medicine.id} medicine={medicine} />)}
              </div>}
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>;
};
export default MedicineStorePage;