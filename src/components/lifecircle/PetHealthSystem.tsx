import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, Mic, Camera, Calendar, Heart, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-provider";

const PetHealthSystem = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [petImage, setPetImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPetImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!petImage) {
      toast({
        title: "No image selected",
        description: "Please upload a pet photo first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('pet-health-ai', {
          body: { 
            image: base64Image,
            symptoms: symptoms || "Analyze the pet's health condition from the image"
          }
        });

        if (error) throw error;
        
        setDiagnosis(data.diagnosis);
        toast({
          title: "Analysis Complete",
          description: "AI diagnosis ready"
        });
      };
      reader.readAsDataURL(petImage);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "No symptoms entered",
        description: "Please describe your pet's symptoms",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('pet-health-ai', {
        body: { 
          symptoms: symptoms,
          analysisType: 'text'
        }
      });

      if (error) throw error;
      
      setDiagnosis(data.diagnosis);
      toast({
        title: "Analysis Complete",
        description: "Treatment suggestions ready"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not process symptoms",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsRecording(true);
        toast({ title: "Listening...", description: "Speak your pet's symptoms" });
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms(transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
        toast({
          title: "Voice input failed",
          description: "Please try typing instead",
          variant: "destructive"
        });
      };
      
      recognition.start();
    } else {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Photo Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Pet" className="max-h-64 mx-auto rounded-lg mb-4" />
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-600">Upload your pet's photo</p>
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
            onClick={analyzeImage} 
            disabled={!petImage || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Photo"}
          </Button>
        </CardContent>
      </Card>

      {/* Symptoms Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Symptom Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe symptoms (text or voice)</label>
            <div className="flex gap-2">
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., My dog has red eyes and is scratching frequently..."
                rows={4}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={startVoiceInput}
                disabled={isRecording}
                className={isRecording ? "animate-pulse" : ""}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={analyzeSymptoms} 
            disabled={!symptoms.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : "Get Treatment Advice"}
          </Button>
        </CardContent>
      </Card>

      {/* Diagnosis Results */}
      {diagnosis && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Heart className="h-5 w-5" />
              AI Diagnosis & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
              {diagnosis}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold">Vaccination Tracker</h3>
              <p className="text-sm text-gray-600">Manage pet vaccinations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-semibold">Health History</h3>
              <p className="text-sm text-gray-600">View past records</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PetHealthSystem;
