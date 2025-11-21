import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Thermometer, Droplets, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LivestockHealthSystem = () => {
  const { toast } = useToast();
  const [animalType, setAnimalType] = useState('');
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('25');
  const [humidity, setHumidity] = useState('60');
  const [diagnosis, setDiagnosis] = useState('');
  const [feedRecommendation, setFeedRecommendation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [animalImage, setAnimalImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAnimalImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeAnimal = async () => {
    if (!animalImage) {
      toast({
        title: "No image selected",
        description: "Please upload an animal photo",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('livestock-health-ai', {
          body: { 
            image: base64Image,
            animalType,
            weight,
            temperature,
            humidity
          }
        });

        if (error) throw error;
        
        setDiagnosis(data.diagnosis);
        setFeedRecommendation(data.feedRecommendation);
        toast({
          title: "Analysis Complete",
          description: "Health report ready"
        });
      };
      reader.readAsDataURL(animalImage);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the animal",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFeedSchedule = async () => {
    if (!animalType || !weight) {
      toast({
        title: "Missing information",
        description: "Please select animal type and enter weight",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('livestock-health-ai', {
        body: { 
          animalType,
          weight,
          temperature,
          humidity,
          analysisType: 'feed'
        }
      });

      if (error) throw error;
      
      setFeedRecommendation(data.feedRecommendation);
      toast({
        title: "Schedule Generated",
        description: "Feed recommendations ready"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate feed schedule",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Animal Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Animal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Animal Type</label>
              <Select value={animalType} onValueChange={setAnimalType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select animal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cow">Cow</SelectItem>
                  <SelectItem value="goat">Goat</SelectItem>
                  <SelectItem value="sheep">Sheep</SelectItem>
                  <SelectItem value="chicken">Chicken</SelectItem>
                  <SelectItem value="buffalo">Buffalo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
              />
            </div>
          </div>

          {/* IoT Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-600" />
                Temperature (°C)
              </label>
              <Input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                Humidity (%)
              </label>
              <Input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Disease Detection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Animal" className="max-h-64 mx-auto rounded-lg mb-4" />
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-600">Upload animal photo</p>
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-4"
            />
          </div>
          <Button 
            onClick={analyzeAnimal} 
            disabled={!animalImage || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Health"}
          </Button>
        </CardContent>
      </Card>

      {/* Feed Schedule Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Smart Feed Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateFeedSchedule} 
            disabled={!animalType || !weight || isAnalyzing}
            className="w-full"
            variant="outline"
          >
            {isAnalyzing ? "Generating..." : "Generate Feed Schedule"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {diagnosis && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Health Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
              {diagnosis}
            </div>
          </CardContent>
        </Card>
      )}

      {feedRecommendation && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Feed Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
              {feedRecommendation}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold">Vaccination Schedule</h3>
              <p className="text-sm text-gray-600">Manage immunizations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold">Breeding Tracker</h3>
              <p className="text-sm text-gray-600">Monitor breeding cycles</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LivestockHealthSystem;
