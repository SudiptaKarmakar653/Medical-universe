
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hooks/use-title";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Lightbulb, Video, Image as ImageIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';

interface SkinAnalysisResult {
  skinPixels: number;
  totalPixels: number;
  skinPercentage: number;
  detectedIssues: string[];
  recommendations: string[];
  analysisComplete: boolean;
}

const PatientSkinAnalyzer = () => {
  useTitle("AI Skin Analyzer - Medical Universe");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const [model, setModel] = useState<bodyPix.BodyPix | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [processedImageData, setProcessedImageData] = useState<string>("");

  // Load BodyPix model on component mount
  useEffect(() => {
    loadModel();
    return () => {
      // Cleanup webcam stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      console.log('Loading BodyPix model...');
      
      // Set TensorFlow backend
      await tf.ready();
      
      // Load BodyPix model with optimized settings
      const net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
      });
      
      setModel(net);
      console.log('BodyPix model loaded successfully');
      
      toast({
        title: "Model Ready!",
        description: "AI skin analysis model has been loaded successfully.",
      });
    } catch (error) {
      console.error('Error loading model:', error);
      setError('Failed to load AI model. Please refresh the page.');
      toast({
        title: "Model Loading Failed",
        description: "Failed to load the AI model. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file",
          variant: "destructive"
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
      setError("");
      setUseWebcam(false);
    }
  };

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setUseWebcam(true);
        setSelectedImage(null);
        setImagePreview("");
        setAnalysisResult(null);
        setError("");
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseWebcam(false);
  };

  const captureFromWebcam = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // Convert canvas to blob and analyze
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            setImagePreview(canvas.toDataURL());
            setUseWebcam(false);
            stopWebcam();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const analyzeSkin = async () => {
    if (!model) {
      toast({
        title: "Model not ready",
        description: "Please wait for the AI model to load",
        variant: "destructive"
      });
      return;
    }

    if (!selectedImage && !imagePreview) {
      toast({
        title: "No image selected",
        description: "Please upload an image or capture from webcam first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      console.log('Starting skin analysis...');
      
      // Create image element from preview
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imagePreview;
      });

      console.log('Image loaded, dimensions:', img.width, 'x', img.height);

      // Perform body segmentation
      console.log('Performing body segmentation...');
      const segmentation = await model.segmentPerson(img, {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: 0.7
      });

      console.log('Segmentation completed, data length:', segmentation.data.length);

      // Ensure canvas elements exist
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      
      console.log('Canvas availability check:', {
        canvas: !!canvas,
        overlayCanvas: !!overlayCanvas
      });

      if (!canvas || !overlayCanvas) {
        console.error('Canvas elements not available in DOM');
        throw new Error('Canvas elements not found - they may not be rendered yet');
      }

      const ctx = canvas.getContext('2d');
      const overlayCtx = overlayCanvas.getContext('2d');
      
      if (!ctx || !overlayCtx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      overlayCanvas.width = img.width;
      overlayCanvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Create mask overlay
      const imageData = overlayCtx.createImageData(img.width, img.height);
      const data = imageData.data;

      let skinPixels = 0;
      const totalPixels = segmentation.data.length;

      console.log('Processing segmentation data...');

      // Process segmentation data
      for (let i = 0; i < segmentation.data.length; i++) {
        const pixelIndex = i * 4;
        
        if (segmentation.data[i] === 1) { // Person pixel
          skinPixels++;
          // Green overlay for detected skin
          data[pixelIndex] = 0;     // R
          data[pixelIndex + 1] = 255; // G
          data[pixelIndex + 2] = 0;   // B
          data[pixelIndex + 3] = 80;  // A (transparency)
        } else {
          // Transparent for background
          data[pixelIndex + 3] = 0;
        }
      }

      overlayCtx.putImageData(imageData, 0, 0);

      // Create a combined image for display
      const combinedCanvas = document.createElement('canvas');
      const combinedCtx = combinedCanvas.getContext('2d');
      
      if (combinedCtx) {
        combinedCanvas.width = img.width;
        combinedCanvas.height = img.height;
        
        // Draw original image
        combinedCtx.drawImage(canvas, 0, 0);
        
        // Draw overlay on top
        combinedCtx.drawImage(overlayCanvas, 0, 0);
        
        // Convert to base64 for display
        setProcessedImageData(combinedCanvas.toDataURL());
      }

      // Calculate analysis results
      const skinPercentage = Math.round((skinPixels / totalPixels) * 100);
      
      console.log('Analysis completed:', {
        skinPixels,
        totalPixels,
        skinPercentage
      });

      // Generate recommendations based on analysis
      const detectedIssues = [];
      const recommendations = [];

      if (skinPercentage > 0) {
        if (skinPercentage < 10) {
          detectedIssues.push("Limited skin area detected - please try a clearer photo");
          recommendations.push("📸 Take a photo with better lighting and ensure your face is clearly visible");
          recommendations.push("🔍 Position yourself closer to the camera for better detection");
        } else if (skinPercentage < 25) {
          detectedIssues.push("Moderate skin area detected");
          recommendations.push("📸 For better analysis, try taking a front-facing photo");
          recommendations.push("💧 Maintain proper hydration for healthy skin");
          recommendations.push("🧴 Use gentle, pH-balanced skincare products");
        } else {
          detectedIssues.push("Good skin area detected - analysis complete");
          recommendations.push("💧 Drink 8+ glasses of water daily for optimal skin hydration");
          recommendations.push("🧴 Use gentle, non-comedogenic skincare products");
          recommendations.push("☀️ Apply broad-spectrum sunscreen daily (SPF 30+)");
          recommendations.push("🍎 Eat antioxidant-rich foods for skin health");
          recommendations.push("😴 Get 7-9 hours of quality sleep for skin regeneration");
        }
      } else {
        detectedIssues.push("No skin area detected");
        recommendations.push("📸 Please try uploading a clearer photo with your face visible");
        recommendations.push("💡 Ensure good lighting and face the camera directly");
      }

      const result: SkinAnalysisResult = {
        skinPixels,
        totalPixels,
        skinPercentage,
        detectedIssues,
        recommendations,
        analysisComplete: true
      };

      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete!",
        description: `Detected ${skinPercentage}% skin area in the image`,
      });

      console.log('Skin analysis completed successfully:', result);

    } catch (error) {
      console.error('Skin analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze skin');
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="patient" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="patient" className="hidden lg:block" />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6 mt-20">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Camera className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">AI Skin Analyzer</h1>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Upload a photo or use your webcam to analyze skin areas using advanced AI technology. 
                All processing happens locally in your browser for privacy.
              </p>
              {isModelLoading && (
                <div className="text-blue-600 font-medium">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Loading AI model...
                </div>
              )}
            </div>

            {/* Upload/Webcam Controls */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  {!imagePreview && !useWebcam ? (
                    <>
                      <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Upload Photo or Use Webcam
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Choose a clear, well-lit photo or use your webcam for real-time analysis
                        </p>
                        <div className="flex gap-3 justify-center flex-wrap">
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isModelLoading}
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Select Image
                          </Button>
                          <Button 
                            onClick={startWebcam}
                            variant="outline"
                            disabled={isModelLoading}
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Use Webcam
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : useWebcam ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <video 
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="max-w-md max-h-64 rounded-lg shadow-md border"
                        />
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          onClick={captureFromWebcam} 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isModelLoading}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Capture Photo
                        </Button>
                        <Button variant="outline" onClick={stopWebcam}>
                          Stop Camera
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-xs max-h-64 mx-auto rounded-lg shadow-md"
                        />
                      </div>
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Button 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Image
                        </Button>
                        <Button 
                          onClick={startWebcam}
                          variant="outline"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Use Webcam
                        </Button>
                        <Button 
                          onClick={analyzeSkin}
                          disabled={isAnalyzing || isModelLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Analyze Skin
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hidden canvases for analysis - always rendered but hidden */}
            <div className="hidden">
              <canvas 
                ref={canvasRef}
                className="border"
              />
              <canvas
                ref={overlayCanvasRef}
                className="border"
              />
            </div>

            {/* Analysis Results */}
            {analysisResult && processedImageData && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="relative">
                      <img 
                        src={processedImageData}
                        alt="Skin Analysis Result"
                        className="border border-gray-300 rounded-lg shadow-sm max-w-full max-h-96 object-contain"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        Green overlay shows detected skin areas
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {analysisResult && analysisResult.analysisComplete && (
              <div className="space-y-6">
                {/* Detection Results */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      Skin Detection Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {analysisResult.skinPercentage}%
                        </div>
                        <div className="text-lg font-semibold text-gray-700">
                          Skin Area Detected
                        </div>
                      </div>
                      
                      <Progress value={analysisResult.skinPercentage} className="h-3" />
                      
                      <div className="text-sm text-gray-600 text-center">
                        Detected {analysisResult.skinPixels.toLocaleString()} skin pixels out of {analysisResult.totalPixels.toLocaleString()} total pixels
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detected Issues */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.detectedIssues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-6 w-6 text-yellow-500" />
                      Personalized Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* General Health Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle>General Skin Health Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Daily Sun Protection</h4>
                          <p className="text-gray-600 text-sm">Use SPF 30+ sunscreen daily, even indoors</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Stay Hydrated</h4>
                          <p className="text-gray-600 text-sm">Drink 8+ glasses of water daily for healthy skin</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Gentle Cleansing</h4>
                          <p className="text-gray-600 text-sm">Use mild cleansers and avoid over-washing</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Quality Sleep</h4>
                          <p className="text-gray-600 text-sm">Get 7-9 hours of sleep for skin regeneration</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Notice */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Privacy Protected:</span>
                      <span>All analysis is performed locally in your browser. No images are uploaded to any server.</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientSkinAnalyzer;
