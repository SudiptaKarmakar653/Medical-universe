import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, Save, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FaceLockSetup from "@/components/admin/FaceLockSetup";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    siteName: "Medical Universe",
    allowRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false,
    maxOrderItems: 10,
    lowStockThreshold: 10,
  });

  const [faceLockEnabled, setFaceLockEnabled] = useState(false);
  const [showFaceLockSetup, setShowFaceLockSetup] = useState(false);
  const [hasFaceLockData, setHasFaceLockData] = useState(false);
  const [loading, setLoading] = useState(false);

  const adminUsername = "SUBHODEEP PAL";

  useEffect(() => {
    checkFaceLockStatus();
  }, []);

  const checkFaceLockStatus = async () => {
    try {
      // Check if FaceLock is enabled
      const { data: settingsData } = await supabase
        .from('admin_security_settings')
        .select('face_detection_enabled')
        .eq('admin_username', adminUsername)
        .single();

      if (settingsData) {
        setFaceLockEnabled(settingsData.face_detection_enabled);
      }

      // Check if face data exists
      const { data: faceData } = await supabase
        .from('admin_face_descriptors')
        .select('id')
        .eq('admin_username', adminUsername)
        .eq('is_active', true)
        .limit(1);

      setHasFaceLockData(faceData && faceData.length > 0);
    } catch (error) {
      console.error('Error checking FaceLock status:', error);
    }
  };

  const handleFaceLockToggle = async (enabled: boolean) => {
    if (enabled && !hasFaceLockData) {
      setShowFaceLockSetup(true);
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('admin_security_settings')
        .upsert({
          admin_username: adminUsername,
          face_detection_enabled: enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'admin_username'
        });

      if (error) throw error;

      setFaceLockEnabled(enabled);
      toast({
        title: "FaceLock Updated",
        description: `FaceLock has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating FaceLock:', error);
      toast({
        title: "Error",
        description: "Failed to update FaceLock settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLockSetupComplete = async (descriptors: number[][]) => {
    try {
      setLoading(true);

      // Save face descriptors
      const { error: descriptorError } = await supabase
        .from('admin_face_descriptors')
        .insert({
          admin_username: adminUsername,
          face_descriptors: descriptors,
          is_active: true
        });

      if (descriptorError) throw descriptorError;

      // Enable FaceLock
      const { error: settingsError } = await supabase
        .from('admin_security_settings')
        .upsert({
          admin_username: adminUsername,
          face_detection_enabled: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'admin_username'
        });

      if (settingsError) throw settingsError;

      setFaceLockEnabled(true);
      setHasFaceLockData(true);
      setShowFaceLockSetup(false);
      
      toast({
        title: "FaceLock Setup Complete",
        description: "Face recognition has been successfully configured.",
      });
    } catch (error) {
      console.error('Error saving face data:', error);
      toast({
        title: "Setup Error",
        description: "Failed to save face recognition data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFaceLockData = async () => {
    try {
      setLoading(true);

      // Deactivate existing face data
      const { error: updateError } = await supabase
        .from('admin_face_descriptors')
        .update({ is_active: false })
        .eq('admin_username', adminUsername);

      if (updateError) throw updateError;

      // Disable FaceLock
      const { error: settingsError } = await supabase
        .from('admin_security_settings')
        .upsert({
          admin_username: adminUsername,
          face_detection_enabled: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'admin_username'
        });

      if (settingsError) throw settingsError;

      setFaceLockEnabled(false);
      setHasFaceLockData(false);
      
      toast({
        title: "FaceLock Reset",
        description: "Face recognition data has been cleared.",
      });
    } catch (error) {
      console.error('Error resetting face data:', error);
      toast({
        title: "Reset Error",
        description: "Failed to reset face recognition data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
              <p className="text-gray-600 mt-1">Configure system settings</p>
            </div>
            <Button onClick={() => navigate('/admin-dashboard')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* FaceLock Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                FaceLock Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="faceLockEnabled">Enable FaceLock</Label>
                  <p className="text-sm text-gray-600">Require face verification for admin login</p>
                  {hasFaceLockData && (
                    <p className="text-xs text-green-600 mt-1">✓ Face data configured</p>
                  )}
                </div>
                <Switch
                  id="faceLockEnabled"
                  checked={faceLockEnabled}
                  onCheckedChange={handleFaceLockToggle}
                  disabled={loading}
                />
              </div>

              {hasFaceLockData && (
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    onClick={resetFaceLockData}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset FaceLock Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowRegistration">Allow User Registration</Label>
                  <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                </div>
                <Switch
                  id="allowRegistration"
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-gray-600">Users must verify their email before accessing the system</p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Temporarily disable site access for maintenance</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxOrderItems">Maximum Items per Order</Label>
                <Input
                  id="maxOrderItems"
                  type="number"
                  value={settings.maxOrderItems}
                  onChange={(e) => setSettings({ ...settings, maxOrderItems: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      {/* FaceLock Setup Dialog */}
      <Dialog open={showFaceLockSetup} onOpenChange={setShowFaceLockSetup}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Setup FaceLock</DialogTitle>
            <DialogDescription>
              Configure face recognition for enhanced security
            </DialogDescription>
          </DialogHeader>
          <FaceLockSetup
            onComplete={handleFaceLockSetupComplete}
            onCancel={() => setShowFaceLockSetup(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
