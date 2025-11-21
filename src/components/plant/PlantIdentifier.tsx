import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Leaf, Info, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PlantResults from './PlantResults';
export interface PlantIdentificationResult {
  plant_name: string;
  scientific_name: string;
  probability: number;
  plant_details: {
    common_names: string[];
    edible_parts: string[];
    watering: string;
    propagation_methods: string[];
    care_level: string;
    growth_rate: string;
    sun_requirements: string;
    flowering_season: string;
    harvest_season: string;
    leaf_color: string[];
    flower_color: string[];
    fruit_color: string[];
    medicinal_uses: string[];
    chemical_constituents: string[];
    part_used_medicinally: string[];
    ayurvedic_properties: {
      rasa: string[];
      virya: string;
      vipaka: string;
      dosha_effects: string[];
      therapeutic_uses: string[];
    };
  };
  health_assessment: {
    diseases: string[];
    is_healthy: boolean;
    disease_details: {
      description: string;
      treatment: string;
    }[];
  };
  similar_images: {
    id: string;
    url: string;
    similarity: number;
  }[];
}
const PlantIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PlantIdentificationResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("Image size should be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const imageData = e.target?.result as string;
        setSelectedImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("Image size should be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const imageData = e.target?.result as string;
        setSelectedImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleUploadAreaClick = () => {
    // Only open file dialog if no image is selected
    if (!selectedImage) {
      fileInputRef.current?.click();
    }
  };
  const identifyPlant = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }
    setIsLoading(true);
    console.log('Starting plant identification...');
    try {
      // Use the full Supabase function URL
      const response = await fetch('https://iuzsycwcjwsuwygsibnr.supabase.co/functions/v1/identify-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1enN5Y3djandzdXd5Z3NpYm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MzI1OTUsImV4cCI6MjA2MzIwODU5NX0.Z0_XaJIiR4BwzDdpgdtdc0i7_UiMCiQclLq48UkCcBE'}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1enN5Y3djandzdXd5Z3NpYm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MzI1OTUsImV4cCI6MjA2MzIwODU5NX0.Z0_XaJIiR4BwzDdpgdtdc0i7_UiMCiQclLq48UkCcBE'
        },
        body: JSON.stringify({
          image: selectedImage
        })
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log('API Response:', data);
      setResults(data.results || []);
      if (data.results && data.results.length > 0) {
        toast.success("Plant identified successfully!");
      } else {
        toast.error("Could not identify the plant. Please try with a clearer image.");
      }
    } catch (error) {
      console.error('Error identifying plant:', error);
      toast.error(`Failed to identify plant: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const resetIdentification = () => {
    setSelectedImage(null);
    setResults([]);
  };
  return <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card className="border-2 border-dashed border-medical-aqua/30 hover:border-medical-aqua/50 transition-colors">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Leaf className="h-6 w-6 text-medical-aqua" />
            Upload Plant Image
          </CardTitle>
          <CardDescription>
            Drag and drop an image or click to select. Supported formats: JPG, PNG, WebP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-medical-aqua transition-colors ${!selectedImage ? 'cursor-pointer' : ''}`} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleUploadAreaClick}>
            {selectedImage ? <div className="space-y-4">
                <img src={selectedImage} alt="Selected plant" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                <div className="flex gap-4 justify-center">
                  <Button onClick={e => {
                e.stopPropagation();
                identifyPlant();
              }} disabled={isLoading} className="bg-gradient-med hover:shadow-lg">
                    {isLoading ? <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Identifying...
                      </> : <>
                        <Camera className="h-4 w-4 mr-2" />
                        Identify Plant
                      </>}
                  </Button>
                  <Button variant="outline" onClick={e => {
                e.stopPropagation();
                resetIdentification();
              }} disabled={isLoading}>
                    Choose Another
                  </Button>
                </div>
              </div> : <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                </div>
              </div>}
          </div>
          
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-medical-aqua/5 to-medical-cyan/5 border-medical-aqua/20">
        <CardContent className="p-6 bg-gray-100">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-medical-aqua mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload a clear image of any plant part (leaf, flower, bark, etc.)</li>
                <li>• Our AI will identify the plant and provide detailed information</li>
                <li>• Learn about Ayurvedic properties, medicinal uses, and traditional applications</li>
                <li>• Discover which health conditions the plant traditionally helps with</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && <PlantResults results={results} />}

      {/* Warning Card */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6 bg-green-100">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Important Disclaimer:</h3>
              <p className="text-sm text-yellow-700">
                This tool is for educational purposes only. Always consult with qualified healthcare professionals 
                and certified Ayurvedic practitioners before using any plant for medicinal purposes. 
                Never consume unknown plants without proper identification and expert guidance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default PlantIdentifier;