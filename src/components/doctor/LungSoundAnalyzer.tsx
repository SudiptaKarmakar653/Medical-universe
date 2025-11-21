import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileAudio, AlertCircle, Activity, Brain, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface AnalysisResult {
  diagnosis: string;
  confidence: number;
  soundType: string;
  recommendations: string;
  spectrogramImage: string;
}
const LungSoundAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const {
    toast
  } = useToast();
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.includes('audio/') && !selectedFile.name.toLowerCase().endsWith('.mp3') && !selectedFile.name.toLowerCase().endsWith('.wav')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an MP3 or WAV audio file",
          variant: "destructive"
        });
        return;
      }

      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
      setAnalysisResult(null);
    }
  };
  const analyzeSound = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', file);

      // Call the Supabase Edge Function
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-lung-sound', {
        body: formData
      });
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze audio');
      }
      if (data?.analysis) {
        setAnalysisResult(data.analysis);
        toast({
          title: "Analysis Complete",
          description: "Lung sound analysis has been completed successfully"
        });
      } else {
        throw new Error('No analysis data returned');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to analyze the lung sound. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };
  const getSoundTypeColor = (soundType: string) => {
    switch (soundType.toLowerCase()) {
      case 'normal':
        return "bg-green-100 text-green-800";
      case 'crackles':
        return "bg-red-100 text-red-800";
      case 'wheezes':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return <Card className="w-full">
      <CardHeader className="rounded-3xl bg-cyan-200">
        <CardTitle className="flex items-center gap-2">
          🩹 Lung Sound Analyzer 
          <Badge variant="secondary" className="ml-2">Beta</Badge>
        </CardTitle>
        <CardDescription className="text-slate-950 font-medium">
          Upload lung or breathing sound recordings for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Beta Warning */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Beta Version</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Results are for assistance only, not final diagnosis. Always combine with clinical assessment.
          </AlertDescription>
        </Alert>

        {/* Upload Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Mic className="h-4 w-4" />
            🎙️ Recording Instructions
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Record using phone voice recorder or digital stethoscope</li>
            <li>• Ensure quiet room with minimal background noise</li>
            <li>• Ask patient to breathe slowly during recording</li>
            <li>• Upload MP3 or WAV format files</li>
          </ul>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="audio-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> lung sound recording
                </p>
                <p className="text-xs text-gray-500">MP3 or WAV files (Max 10MB)</p>
              </div>
              <Input id="audio-upload" type="file" accept="audio/*,.mp3,.wav" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {file && <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <FileAudio className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">{file.name}</span>
              <span className="text-xs text-green-600">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>}

          {file && <Button onClick={analyzeSound} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Sound...
                </> : <>
                  <Brain className="mr-2 h-4 w-4" />
                  🔬 Analyze with AI
                </>}
            </Button>}
        </div>

        {/* Analysis Results */}
        {analysisResult && <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                🧠 AI Analysis Results
              </h3>
              
              <div className="space-y-4">
                {/* Diagnosis Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">AI Diagnosis Summary</h4>
                  <p className="text-blue-800">{analysisResult.diagnosis}</p>
                </div>

                {/* Sound Type and Confidence */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Sound Type</h4>
                    <Badge className={getSoundTypeColor(analysisResult.soundType)}>
                      {analysisResult.soundType}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Confidence Score</h4>
                    <span className={`text-lg font-bold ${getConfidenceColor(analysisResult.confidence)}`}>
                      {(analysisResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">👨‍⚕️ Clinical Recommendations</h4>
                  <p className="text-green-800">{analysisResult.recommendations}</p>
                </div>

                {/* Spectrogram */}
                <div className="p-4 rounded-lg bg-slate-50">
                  <h4 className="font-medium text-gray-900 mb-2">📊 Sound Spectrogram Analysis</h4>
                  <div className="rounded overflow-hidden">
                    <img src={analysisResult.spectrogramImage} alt="Real-time generated spectrogram from uploaded audio" className="w-full h-auto max-h-96 object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>}
      </CardContent>
    </Card>;
};
export default LungSoundAnalyzer;