
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTitle } from '@/hooks/use-title';
import PageLayout from '@/components/layout/PageLayout';
import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, User } from 'lucide-react';

const MedicineAdminLoginPage = () => {
  useTitle('Admin Login - Medical Store');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { adminLogin, adminLoading } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await adminLogin(username, password);
    if (success) {
      navigate('/admin/dashboard');
    }
  };
  
  return (
    <PageLayout className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Medical Store Admin</CardTitle>
          <p className="text-gray-500 text-sm">Login to manage your store</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="username"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={adminLoading}
            >
              {adminLoading ? "Logging in..." : "Login to Admin Panel"}
            </Button>
            
            <div className="text-center pt-4 text-sm text-gray-500">
              <p>Default admin credentials:</p>
              <p className="font-mono bg-gray-100 p-1 mt-1 rounded text-xs">Username: SUBHODEEP PAL</p>
              <p className="font-mono bg-gray-100 p-1 mt-1 rounded text-xs">Password: Pal@2005</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default MedicineAdminLoginPage;
