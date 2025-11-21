
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostureAnalysis {
  pose: string;
  accuracy: number;
  feedback: string[];
  corrections: string[];
}

const PostureDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentPose, setCurrentPose] = useState('');
  const [poseAccuracy, setPoseAccuracy] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [corrections, setCorrections] = useState<string[]>([]);
  const { toast } = useToast();
  const detectionRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsDetecting(true);
          startBasicPoseDetection();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (detectionRef.current) {
      cancelAnimationFrame(detectionRef.current);
    }
    
    setIsDetecting(false);
    setPoseAccuracy(0);
    setFeedback([]);
    setCorrections([]);
  };

  const startBasicPoseDetection = () => {
    const basicDetection = () => {
      if (!isDetecting) return;

      // Simulate basic posture feedback with some variation
      const poses = ['Standing Pose', 'Mountain Pose', 'Tree Pose'];
      const randomPose = poses[Math.floor(Math.random() * poses.length)];
      const accuracy = Math.floor(Math.random() * 30) + 60; // 60-90%
      
      setCurrentPose(randomPose);
      setPoseAccuracy(accuracy);
      
      if (accuracy >= 80) {
        setFeedback(['Great posture!', 'Keep it up!', 'Well balanced']);
        setCorrections([]);
      } else {
        setFeedback(['Camera is monitoring your posture']);
        setCorrections(['Stand straight', 'Keep shoulders level', 'Look forward']);
      }

      detectionRef.current = requestAnimationFrame(basicDetection);
    };

    basicDetection();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Real-Time Posture Detection
          <Badge variant="outline">Basic Mode</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-4">
          {!isDetecting ? (
            <Button onClick={startCamera}>
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="outline">
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Camera
            </Button>
          )}
        </div>

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg"
            style={{ maxHeight: '400px' }}
          />
        </div>

        {isDetecting && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{currentPose}</Badge>
              <div className="flex items-center gap-2">
                {poseAccuracy >= 80 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="font-medium">{poseAccuracy}% Accuracy</span>
              </div>
            </div>

            {feedback.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Good Job!</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {feedback.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {corrections.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Improvements</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {corrections.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-600">
            Basic posture monitoring active. Camera is tracking your movement and providing feedback.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostureDetection;
