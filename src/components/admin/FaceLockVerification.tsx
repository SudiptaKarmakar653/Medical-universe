
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FaceLockVerificationProps {
  storedDescriptors: number[][];
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
}

const FaceLockVerification = ({ 
  storedDescriptors, 
  onSuccess, 
  onFailure, 
  onCancel 
}: FaceLockVerificationProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [modelLoadingError, setModelLoadingError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const { toast } = useToast();

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
      // Try to load from CDN first, then fallback to local
      let MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
      
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      } catch (cdnError) {
        console.log('CDN loading failed, trying local models...');
        // Fallback to local models
        MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      }
      
      setIsModelLoaded(true);
      setModelLoadingError(null);
    } catch (error) {
      console.error('Error loading face-api models:', error);
      setModelLoadingError('Failed to load face recognition models.');
      toast({
        title: "Model Loading Error",
        description: "Failed to load face recognition models.",
        variant: "destructive",
      });
    }
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera for face verification...');
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
          console.log('Camera ready for verification');
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
        }, 2000);
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

  const verifyFace = async () => {
    if (!videoRef.current || !isModelLoaded || !cameraStarted) {
      toast({
        title: "Not Ready",
        description: "Camera or models not ready. Please wait.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifying(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Face verification timeout')), 10000);
      });

      const detectionPromise = faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      const detection = await Promise.race([detectionPromise, timeoutPromise]);

      if (detection && typeof detection === 'object' && 'descriptor' in detection) {
        const descriptorProperty = (detection as any).descriptor;
        
        if (descriptorProperty && typeof descriptorProperty === 'object' && 'length' in descriptorProperty) {
          const currentDescriptor = Array.from(descriptorProperty as ArrayLike<number>);
          
          // Compare with stored descriptors
          let bestMatch = 1; // Lower is better, 0.6 is typically a good threshold
          
          for (const storedDescriptor of storedDescriptors) {
            const distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);
            if (distance < bestMatch) {
              bestMatch = distance;
            }
          }

          console.log('Face verification distance:', bestMatch);
          
          if (bestMatch < 0.6) {
            toast({
              title: "Face Verified",
              description: "Access granted!",
            });
            onSuccess();
          } else {
            toast({
              title: "Face Not Recognized",
              description: "Access denied. Face does not match stored data.",
              variant: "destructive",
            });
            onFailure();
          }
        } else {
          toast({
            title: "Detection Error", 
            description: "Invalid face descriptor. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "No Face Detected",
          description: "Please ensure your face is clearly visible.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
        toast({
          title: "Verification Timeout",
          description: "Face verification took too long. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification Error",
          description: "Failed to verify face. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const retryModelLoading = () => {
    setModelLoadingError(null);
    setIsModelLoaded(false);
    setCameraStarted(false);
    loadModels();
  };

  if (modelLoadingError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              FaceLock Verification - Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-red-600 mb-4">{modelLoadingError}</p>
              <p className="text-sm text-gray-600 mb-4">
                Unable to load face recognition models. Please try again.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={retryModelLoading}>
                Retry Loading
              </Button>
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            FaceLock Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Please look at the camera for face verification
            </p>
          </div>

          <div className="relative mx-auto w-fit">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-80 h-60 rounded-lg border"
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
            ) : (
              <Button
                onClick={verifyFace}
                disabled={isVerifying}
                className="flex items-center gap-2"
              >
                {isVerifying ? (
                  "Verifying..."
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Verify Face
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceLockVerification;
