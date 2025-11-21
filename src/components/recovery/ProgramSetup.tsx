import React, { useState } from 'react';
import { useAuth } from '@/context/auth-provider';
import { useRecovery } from '@/hooks/use-recovery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Heart, ArrowRight, Sparkles, Shield, Activity, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const ProgramSetup = () => {
  const { user } = useAuth();
  const { programs, startRecoveryProgram } = useRecovery(user?.id);
  const [selectedSurgery, setSelectedSurgery] = useState('');
  const [surgeryDate, setSurgeryDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const handleStartProgram = async () => {
    if (!selectedSurgery || !surgeryDate) {
      console.log('Missing required fields:', { selectedSurgery, surgeryDate });
      return;
    }

    console.log('Starting program with:', {
      user: user?.id,
      selectedSurgery,
      surgeryDate: surgeryDate.toISOString().split('T')[0],
      programs: programs.length
    });

    setLoading(true);
    try {
      const result = await startRecoveryProgram(selectedSurgery, surgeryDate.toISOString().split('T')[0]);
      console.log('Program start result:', result);
    } finally {
      setLoading(false);
    }
  };

  const surgeryOptions = [
    {
      value: 'heart',
      label: 'Heart Surgery',
      description: 'Cardiac procedures, bypass, valve replacement',
      icon: '💗',
      color: 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50',
      details: 'Comprehensive cardiac recovery program with breathing exercises and gradual activity increase'
    },
    {
      value: 'knee',
      label: 'Knee Surgery',
      description: 'Knee replacement, arthroscopy, ligament repair',
      icon: '🦵',
      color: 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50',
      details: 'Physical therapy focused program to restore mobility and strength'
    },
    {
      value: 'cesarean',
      label: 'Cesarean Section',
      description: 'C-section delivery and recovery',
      icon: '👶',
      color: 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50',
      details: 'Gentle recovery program designed for new mothers with baby care considerations'
    },
    {
      value: 'others',
      label: 'Other Surgery',
      description: 'General surgical procedures',
      icon: '🏥',
      color: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50',
      details: 'Adaptable recovery program for various surgical procedures'
    }
  ];

  return (
    <div className="pt-20 pb-8 px-4 min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-100 p-4 rounded-lg text-sm">
            <strong>Debug Info:</strong>
            <br />User ID: {user?.id || 'Not logged in'}
            <br />Programs loaded: {programs.length}
            <br />Selected surgery: {selectedSurgery || 'None'}
            <br />Surgery date: {surgeryDate ? surgeryDate.toDateString() : 'None'}
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI-Powered Recovery Assistant
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🛏️ Start Your Recovery Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get personalized 30-day recovery program with AI guidance, voice assistance, 
            and progress tracking tailored to your surgery type.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Brain className="h-5 w-5" />, label: 'AI Guidance', color: 'bg-purple-100 text-purple-700' },
            { icon: <Activity className="h-5 w-5" />, label: 'Daily Tasks', color: 'bg-blue-100 text-blue-700' },
            { icon: <Shield className="h-5 w-5" />, label: 'Safety First', color: 'bg-green-100 text-green-700' },
            { icon: <Heart className="h-5 w-5" />, label: 'Personalized', color: 'bg-red-100 text-red-700' }
          ].map((feature, index) => (
            <div key={index} className={`flex items-center gap-2 p-3 rounded-lg ${feature.color}`}>
              {feature.icon}
              <span className="font-medium text-sm">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Surgery Selection */}
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Heart className="h-6 w-6 text-blue-600" />
              Select Your Surgery Type
            </CardTitle>
            <p className="text-gray-600">Choose the surgery that best matches your procedure</p>
          </CardHeader>
          <CardContent className="p-6">
            <RadioGroup value={selectedSurgery} onValueChange={setSelectedSurgery}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {surgeryOptions.map((option) => (
                  <div key={option.value} className="relative group">
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className={cn(
                        "flex flex-col space-y-3 rounded-xl border-2 p-6 cursor-pointer transition-all duration-300",
                        "hover:shadow-lg hover:scale-[1.02] peer-checked:border-blue-500 peer-checked:shadow-xl",
                        "peer-checked:bg-blue-50 group-hover:border-blue-300",
                        option.color
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl flex-shrink-0">{option.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-800 mb-1">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {option.description}
                          </div>
                          <div className="text-xs text-gray-500 leading-relaxed">
                            {option.details}
                          </div>
                        </div>
                      </div>
                      {selectedSurgery === option.value && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-blue-100 rounded-lg">
                          <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse"></div>
                          <span className="text-sm font-medium text-blue-700">Selected</span>
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Surgery Date Selection */}
        <Card className="border-2 border-purple-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
              Surgery Date
            </CardTitle>
            <p className="text-gray-600">When did you have your surgery? This helps us track your recovery progress.</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Label htmlFor="surgery-date" className="text-base font-medium">Select your surgery date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-14 justify-start text-left font-normal text-base border-2 transition-all",
                      !surgeryDate && "text-muted-foreground",
                      surgeryDate && "border-purple-300 bg-purple-50"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5" />
                    {surgeryDate ? format(surgeryDate, "PPPP") : "Click to select surgery date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={surgeryDate}
                    onSelect={setSurgeryDate}
                    initialFocus
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Program Benefits */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-blue-800 mb-6">
                Your Personalized Recovery Program Includes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: '🎯', title: 'Daily Tasks', desc: 'Personalized recovery activities' },
                  { icon: '🗣️', title: 'AI Voice Guide', desc: 'Motivational voice assistance' },
                  { icon: '📊', title: 'Progress Tracking', desc: 'Visual recovery monitoring' },
                  { icon: '🚨', title: 'Symptom Monitor', desc: 'Health safety alerts' }
                ].map((benefit, index) => (
                  <div key={index} className="text-center p-4 bg-white/70 rounded-xl">
                    <div className="text-3xl mb-2">{benefit.icon}</div>
                    <h4 className="font-semibold text-blue-800 mb-1">{benefit.title}</h4>
                    <p className="text-sm text-blue-600">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button 
            onClick={handleStartProgram}
            disabled={!selectedSurgery || !surgeryDate || loading}
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Setting up your personalized program...
              </div>
            ) : (
              <div className="flex items-center gap-3 text-lg">
                <Sparkles className="h-5 w-5" />
                Start My AI-Guided Recovery Journey
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </Button>
          
          {(!selectedSurgery || !surgeryDate) && (
            <p className="mt-3 text-sm text-gray-500">
              Please select your surgery type and date to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
