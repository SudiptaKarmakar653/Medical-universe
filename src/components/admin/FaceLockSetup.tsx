
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, CheckCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FaceLockSetupProps {
  onComplete: (descriptors: number[][]) => void;
  onCancel: () => void;
}

const FaceLockSetup = ({ onComplete, onCancel }: FaceLockSetupProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedDescriptors, setCapturedDescriptors] = useState<number[][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [modelLoadingError, setModelLoadingError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const { toast } = useToast();

  const steps = [
    "Look straight at the camera",
    "Turn your head slightly left",
    "Turn your head slightly right",
    "Look up slightly",
    "Look down slightly"
  ];

  useEffect(() => {
    loadModels();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera after models are loaded
  useEffect(() => {
    if (isModelLoaded && !cameraStarted && !modelLoadingError) {
      startCamera();
    }
  }, [isModelLoaded, cameraStarted, modelLoadingError]);

  const loadModels = async () => {
    try {
      console.log('Starting to load face-api models...');
      // Try to load from CDN first, then fallback to local
      let MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
      
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        console.log('Models loaded successfully from CDN');
      } catch (cdnError) {
        console.log('CDN loading failed, trying local models...');
        // Fallback to local models
        MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        console.log('Models loaded successfully from local');
      }
      
      setIsModelLoaded(true);
      setModelLoadingError(null);
    } catch (error) {
      console.error('Error loading face-api models:', error);
      setModelLoadingError('Failed to load face recognition models. This feature requires the face-api.js models to be available.');
      toast({
        title: "Model Loading Error",
        description: "Failed to load face recognition models. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for the video to be ready
        const handleLoadedData = () => {
          console.log('Video loaded and ready');
          setCameraStarted(true);
          videoRef.current?.removeEventListener('loadeddata', handleLoadedData);
        };
        
        videoRef.current.addEventListener('loadeddata', handleLoadedData);
        
        // Fallback timeout in case loadeddata doesn't fire
        setTimeout(() => {
          if (!cameraStarted) {
            console.log('Fallback: Setting camera as started');
            setCameraStarted(true);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please allow camera permissions.",
        variant: "destructive",
      });
    }
  };

  const captureDescriptor = async () => {
    if (!videoRef.current || !canvasRef.current || !isModelLoaded || !cameraStarted) {
      toast({
        title: "Not Ready",
        description: "Camera or models not ready. Please wait.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting face capture...');
    setIsCapturing(true);

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Face detection timeout')), 10000);
      });

      const detectionPromise = faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 416,
          scoreThreshold: 0.5 
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      const detection = await Promise.race([detectionPromise, timeoutPromise]);

      // Type guard to check if detection is valid and has descriptor
      if (detection && typeof detection === 'object' && 'descriptor' in detection) {
        const descriptorProperty = (detection as any).descriptor;
        
        // Check if descriptor exists and is array-like
        if (descriptorProperty && typeof descriptorProperty === 'object' && 'length' in descriptorProperty) {
          console.log('Face detected successfully');
          const descriptor = Array.from(descriptorProperty as ArrayLike<number>);
          const newDescriptors = [...capturedDescriptors, descriptor];
          setCapturedDescriptors(newDescriptors);
          setCurrentStep(prev => prev + 1);
          
          toast({
            title: "Face Captured",
            description: `Step ${currentStep + 1} completed successfully!`,
          });

          if (currentStep + 1 >= steps.length) {
            // Complete setup
            console.log('All steps completed, finishing setup...');
            setTimeout(() => {
              onComplete(newDescriptors);
            }, 1000);
          }
        } else {
          console.log('Invalid descriptor format');
          toast({
            title: "Detection Error",
            description: "Invalid face descriptor format. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.log('No face detected');
        toast({
          title: "No Face Detected",
          description: "Please ensure your face is clearly visible and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
        toast({
          title: "Detection Timeout",
          description: "Face detection took too long. Please ensure good lighting and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Capture Error",
          description: "Failed to capture face data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const resetCapture = () => {
    console.log('Resetting capture...');
    setCapturedDescriptors([]);
    setCurrentStep(0);
    setIsCapturing(false);
  };

  const retryModelLoading = () => {
    setModelLoadingError(null);
    setIsModelLoaded(false);
    loadModels();
  };

  const progress = (currentStep / steps.length) * 100;

  if (modelLoadingError) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            FaceLock Setup - Model Loading Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{modelLoadingError}</p>
            <p className="text-sm text-gray-600 mb-4">
              The face recognition models need to be loaded for this feature to work. 
              You can either:
            </p>
            <ul className="text-sm text-gray-600 text-left mb-4 space-y-1">
              <li>• Download the models and place them in the public/models directory</li>
              <li>• Wait for the CDN to load (may take a moment)</li>
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={retryModelLoading}>
              Retry Loading Models
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          FaceLock Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Step {currentStep + 1} of {steps.length}
          </p>
          <p className="font-medium">{steps[currentStep] || "Setup Complete!"}</p>
        </div>

        <div className="relative mx-auto w-fit">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-96 h-72 rounded-lg border bg-gray-100"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-96 h-72 rounded-lg pointer-events-none"
          />
          {!cameraStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-600">Starting camera...</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {!isModelLoaded ? (
            <Button disabled>Loading models...</Button>
          ) : !cameraStarted ? (
            <Button disabled>Starting camera...</Button>
          ) : currentStep < steps.length ? (
            <>
              <Button
                onClick={captureDescriptor}
                disabled={isCapturing}
                className="flex items-center gap-2"
              >
                {isCapturing ? (
                  "Capturing..."
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Capture Face
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetCapture} disabled={isCapturing}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Setup Complete!
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isCapturing}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceLockSetup;
