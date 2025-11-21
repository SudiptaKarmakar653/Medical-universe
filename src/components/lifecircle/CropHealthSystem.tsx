import React, { useState, useEffect } from 'react';
import CropHealthRecordCard from './CropHealthRecordCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Cloud, Sun, CloudRain, Leaf, Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CropHealthSystem = () => {
  const { toast } = useToast();
  const [cropType, setCropType] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [leafImage, setLeafImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Fetch weather data (simulated)
  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    // Simulated 7-day weather forecast
    const mockWeather = {
      current: { temp: 28, humidity: 65, condition: 'Partly Cloudy' },
      forecast: [
        { day: 'Mon', temp: 30, rain: 10, icon: 'sun' },
        { day: 'Tue', temp: 29, rain: 20, icon: 'cloud' },
        { day: 'Wed', temp: 27, rain: 60, icon: 'rain' },
        { day: 'Thu', temp: 26, rain: 70, icon: 'rain' },
        { day: 'Fri', temp: 28, rain: 30, icon: 'cloud' },
        { day: 'Sat', temp: 31, rain: 5, icon: 'sun' },
        { day: 'Sun', temp: 32, rain: 0, icon: 'sun' }
      ]
    };
    setWeatherData(mockWeather);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLeafImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeCrop = async () => {
    if (!leafImage) {
      toast({
        title: "No image selected",
        description: "Please upload a leaf/plant photo",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('crop-health-ai', {
          body: { 
            image: base64Image,
            cropType
          }
        });

        if (error) throw error;
        
        setDiagnosis(data.diagnosis);
        setRecommendations(data.recommendations);
        toast({
          title: "Analysis Complete",
          description: "Crop health report ready"
        });
      };
      reader.readAsDataURL(leafImage);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the crop",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getWeatherIcon = (icon: string) => {
    switch(icon) {
      case 'sun': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'rain': return <CloudRain className="h-6 w-6 text-blue-500" />;
      default: return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Digital Crop Health Record Card */}
      <CropHealthRecordCard />
      {/* Header Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl shadow-xl text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Leaf className="h-8 w-8" />
          Smart Crop Doctor
        </h1>
        <p className="mt-2 text-green-50">
          Advanced AI diagnostics for your crops. Detect diseases instantly, get treatment
          recommendations, and monitor weather conditions for optimal farming.
        </p>
      </div>

      {/* Crop Selection */}
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            Crop Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div>
            <label className="text-sm font-medium mb-3 block text-gray-700">Select Your Crop Type</label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500">
                <SelectValue placeholder="Choose your crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rice">🌾 Rice</SelectItem>
                <SelectItem value="wheat">🌾 Wheat</SelectItem>
                <SelectItem value="corn">🌽 Corn</SelectItem>
                <SelectItem value="tomato">🍅 Tomato</SelectItem>
                <SelectItem value="potato">🥔 Potato</SelectItem>
                <SelectItem value="cotton">🌿 Cotton</SelectItem>
                <SelectItem value="sugarcane">🎋 Sugarcane</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Weather Forecast */}
      {weatherData && (
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <Cloud className="h-6 w-6 text-blue-600" />
              Weather Monitoring System
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Current Weather */}
            <div className="mb-6 p-6 bg-white rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-900">{weatherData.current.temp}°C</p>
                  <p className="text-lg text-gray-600 mt-1">{weatherData.current.condition}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Cloud className="h-4 w-4" />
                      Humidity: {weatherData.current.humidity}%
                    </span>
                  </p>
                </div>
                <div className="text-6xl text-blue-500">
                  {getWeatherIcon(weatherData.forecast[0].icon)}
                </div>
              </div>
            </div>
            
            {/* 7-Day Forecast */}
            <div className="grid grid-cols-7 gap-4">
              {weatherData.forecast.map((day: any, index: number) => (
                <div 
                  key={index} 
                  className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <p className="text-sm font-semibold text-gray-700 mb-2">{day.day}</p>
                  <div className="flex justify-center mb-2 text-blue-500">
                    {getWeatherIcon(day.icon)}
                  </div>
                  <p className="text-lg font-bold text-gray-900">{day.temp}°</p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <CloudRain className="h-3 w-3 text-blue-500" />
                    <p className="text-xs text-blue-600">{day.rain}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disease Detection */}
      <Card className="mt-8 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <Bug className="h-6 w-6 text-red-600" />
            AI-Powered Disease Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors duration-200 rounded-xl p-8 text-center bg-gray-50">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Crop" 
                    className="max-h-64 mx-auto rounded-lg shadow-md" 
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto shadow-sm">
                      <Upload className="h-8 w-8 text-green-600 mx-auto" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">Upload Plant Photo</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Take a clear photo of the affected leaf or plant
                      </p>
                    </div>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-4 cursor-pointer"
                />
              </div>
              <Button 
                onClick={analyzeCrop} 
                disabled={!leafImage || isAnalyzing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Bug className="h-5 w-5" />
                    Detect Disease
                  </div>
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to get best results:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">1</span>
                  </div>
                  <p className="text-gray-600">Take a clear, well-lit photo of the affected area</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">2</span>
                  </div>
                  <p className="text-gray-600">Ensure the affected part is in focus</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">3</span>
                  </div>
                  <p className="text-gray-600">Include some healthy tissue around the affected area</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">4</span>
                  </div>
                  <p className="text-gray-600">Avoid shadows and harsh lighting conditions</p>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results Section */}
      {diagnosis && (
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Diagnosis Results */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader className="border-b border-red-100">
              <CardTitle className="text-xl flex items-center gap-2">
                <Bug className="h-6 w-6 text-red-600" />
                Disease Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap">
                {diagnosis}
              </div>
            </CardContent>
          </Card>

          {/* Treatment Recommendations */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="border-b border-green-100">
              <CardTitle className="text-xl flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                Treatment Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap">
                {recommendations}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Visualization Dashboard */}
      {diagnosis && (
        <Card className="mt-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="h-6 w-6 text-purple-600">📊</div>
              Crop Health Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Healthy Zone */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-100 to-green-50 p-6 shadow-sm">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Healthy Area</span>
                    <span className="text-3xl font-bold text-green-700">75%</span>
                  </div>
                  <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Leaf className="h-16 w-16 text-green-800" />
                </div>
              </div>

              {/* Caution Zone */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 p-6 shadow-sm">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-800">Watch Zone</span>
                    <span className="text-3xl font-bold text-yellow-700">20%</span>
                  </div>
                  <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Bug className="h-16 w-16 text-yellow-800" />
                </div>
              </div>

              {/* Critical Zone */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-100 to-red-50 p-6 shadow-sm">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-800">Critical Area</span>
                    <span className="text-3xl font-bold text-red-700">5%</span>
                  </div>
                  <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Bug className="h-16 w-16 text-red-800" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CropHealthSystem;
