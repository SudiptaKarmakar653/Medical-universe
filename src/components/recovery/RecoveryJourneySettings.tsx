
import React, { useState } from 'react';
import { useAuth } from '@/context/auth-provider';
import { useRecovery } from '@/hooks/use-recovery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Settings, Save, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecoveryJourneySettingsProps {
  onClose: () => void;
}

export const RecoveryJourneySettings: React.FC<RecoveryJourneySettingsProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { userProgress, programs, refreshData } = useRecovery(user?.id);
  const [selectedSurgery, setSelectedSurgery] = useState(userProgress?.program_id || '');
  const [surgeryDate, setSurgeryDate] = useState<Date>(
    userProgress ? new Date(userProgress.surgery_date) : new Date()
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const surgeryOptions = [
    {
      value: 'heart',
      label: 'Heart Surgery',
      description: 'Cardiac procedures, bypass, valve replacement',
      icon: '💗'
    },
    {
      value: 'knee',
      label: 'Knee Surgery',
      description: 'Knee replacement, arthroscopy, ligament repair',
      icon: '🦵'
    },
    {
      value: 'cesarean',
      label: 'Cesarean Section',
      description: 'C-section delivery and recovery',
      icon: '👶'
    },
    {
      value: 'others',
      label: 'Other Surgery',
      description: 'General surgical procedures',
      icon: '🏥'
    }
  ];

  const handleUpdateJourney = async () => {
    if (!selectedSurgery || !surgeryDate || !userProgress) {
      toast({
        title: "Missing information",
        description: "Please select surgery type and date",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update the recovery progress
      const { error } = await supabase
        .from('patient_recovery_progress')
        .update({
          program_id: selectedSurgery,
          surgery_date: surgeryDate.toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', userProgress.id);

      if (error) throw error;

      toast({
        title: "Journey updated successfully!",
        description: "Your recovery program has been updated with the new settings.",
      });

      // Refresh data and close modal
      await refreshData();
      onClose();
    } catch (error: any) {
      console.error('Error updating journey:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update your recovery journey",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            Manage Recovery Journey
          </CardTitle>
          <p className="text-gray-600">Update your surgery type and recovery details</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Important Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Changing your surgery type will reset your recovery program. Your progress will be preserved, but tasks may change.
                </p>
              </div>
            </div>
          </div>

          {/* Surgery Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Surgery Type</Label>
            <RadioGroup value={selectedSurgery} onValueChange={setSelectedSurgery}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surgeryOptions.map((option) => (
                  <div key={option.value} className="relative">
                    <RadioGroupItem
                      value={option.value}
                      id={`settings-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`settings-${option.value}`}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        "peer-checked:border-blue-500 peer-checked:bg-blue-50",
                        "hover:border-blue-300 hover:bg-blue-25"
                      )}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Surgery Date */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Surgery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !surgeryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {surgeryDate ? format(surgeryDate, "PPP") : "Select surgery date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={surgeryDate}
                  onSelect={(date) => date && setSurgeryDate(date)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdateJourney}
              disabled={loading || !selectedSurgery}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Update Journey
                </div>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
