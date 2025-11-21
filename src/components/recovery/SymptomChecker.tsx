
import React, { useState } from 'react';
import { useAuth } from '@/context/auth-provider';
import { useRecovery } from '@/hooks/use-recovery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Phone, Heart, Activity } from 'lucide-react';

export const SymptomChecker = () => {
  const { user } = useAuth();
  const { submitSymptomReport } = useRecovery(user?.id);
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({});
  const [severityLevel, setSeverityLevel] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const symptomCategories = [
    {
      title: 'Pain & Discomfort',
      symptoms: [
        { key: 'severe_pain', label: 'Severe or worsening pain at surgical site', emergency: true },
        { key: 'chest_pain', label: 'Chest pain or pressure', emergency: true },
        { key: 'headache', label: 'Persistent headache', emergency: false },
        { key: 'muscle_pain', label: 'General muscle aches', emergency: false }
      ]
    },
    {
      title: 'Breathing & Circulation',
      symptoms: [
        { key: 'difficulty_breathing', label: 'Difficulty breathing or shortness of breath', emergency: true },
        { key: 'irregular_heartbeat', label: 'Irregular or rapid heartbeat', emergency: true },
        { key: 'swelling', label: 'Swelling in legs, ankles, or feet', emergency: false },
        { key: 'dizziness', label: 'Dizziness or lightheadedness', emergency: false }
      ]
    },
    {
      title: 'Infection Signs',
      symptoms: [
        { key: 'fever', label: 'Fever (above 100.4°F/38°C)', emergency: true },
        { key: 'chills', label: 'Chills or shaking', emergency: false },
        { key: 'redness', label: 'Increasing redness around incision', emergency: false },
        { key: 'discharge', label: 'Unusual discharge from incision', emergency: false }
      ]
    },
    {
      title: 'Digestive & General',
      symptoms: [
        { key: 'nausea', label: 'Persistent nausea or vomiting', emergency: false },
        { key: 'fatigue', label: 'Extreme fatigue', emergency: false },
        { key: 'appetite_loss', label: 'Loss of appetite', emergency: false },
        { key: 'sleep_issues', label: 'Difficulty sleeping', emergency: false }
      ]
    }
  ];

  const handleSymptomChange = (symptomKey: string, checked: boolean) => {
    setSymptoms(prev => ({
      ...prev,
      [symptomKey]: checked
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitSymptomReport(symptoms, severityLevel);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const hasEmergencySymptoms = () => {
    const emergencySymptoms = [
      'severe_pain', 'chest_pain', 'difficulty_breathing', 
      'irregular_heartbeat', 'fever'
    ];
    return emergencySymptoms.some(symptom => symptoms[symptom]);
  };

  const getSelectedSymptomsCount = () => {
    return Object.values(symptoms).filter(Boolean).length;
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Symptom Report Submitted
          </h2>
          <p className="text-green-700 mb-4">
            Your symptoms have been recorded and will be reviewed by your healthcare team.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Submit Another Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🩺 Daily Symptom Checker
        </h1>
        <p className="text-gray-600">
          Monitor your recovery by tracking any symptoms you're experiencing.
        </p>
      </div>

      {hasEmergencySymptoms() && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            ⚠️ You've selected symptoms that may require immediate medical attention. 
            Please contact your doctor or emergency services if symptoms are severe.
          </AlertDescription>
        </Alert>
      )}

      {/* Emergency Contact Card */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 font-medium">If you have severe symptoms:</p>
              <p className="text-red-600 text-sm">Call your doctor immediately or emergency services</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Phone className="h-4 w-4 mr-2" />
              Call Doctor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Symptom Categories */}
      <div className="space-y-6">
        {symptomCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.symptoms.map((symptom) => (
                  <div key={symptom.key} className="flex items-start space-x-3">
                    <Checkbox
                      id={symptom.key}
                      checked={symptoms[symptom.key] || false}
                      onCheckedChange={(checked) => 
                        handleSymptomChange(symptom.key, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={symptom.key} 
                      className={`flex-1 cursor-pointer ${
                        symptom.emergency ? 'text-red-700 font-medium' : ''
                      }`}
                    >
                      {symptom.label}
                      {symptom.emergency && (
                        <span className="ml-2 text-red-500 text-xs">⚠️ URGENT</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Severity Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall Severity Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={severityLevel.toString()} 
            onValueChange={(value) => setSeverityLevel(parseInt(value))}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level} className="relative">
                  <RadioGroupItem
                    value={level.toString()}
                    id={`severity-${level}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`severity-${level}`}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
                      transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50
                      ${level <= 2 ? 'border-green-200 bg-green-50' : 
                        level <= 3 ? 'border-yellow-200 bg-yellow-50' :
                        'border-red-200 bg-red-50'}
                    `}
                  >
                    <span className="text-2xl mb-1">
                      {level <= 2 ? '😊' : level <= 3 ? '😐' : level <= 4 ? '😟' : '😰'}
                    </span>
                    <span className="font-medium">{level}</span>
                    <span className="text-xs text-center">
                      {level === 1 ? 'Minimal' :
                       level === 2 ? 'Mild' :
                       level === 3 ? 'Moderate' :
                       level === 4 ? 'Severe' :
                       'Critical'}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Summary and Submit */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-blue-800">
              Summary: {getSelectedSymptomsCount()} symptoms selected
            </h3>
            <p className="text-blue-700 text-sm">
              Severity Level: {severityLevel}/5 ({
                severityLevel <= 2 ? 'Mild' :
                severityLevel <= 3 ? 'Moderate' :
                severityLevel <= 4 ? 'Severe' : 'Critical'
              })
            </p>
            
            <Button 
              onClick={handleSubmit}
              disabled={loading || getSelectedSymptomsCount() === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting Report...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Submit Symptom Report
                </div>
              )}
            </Button>
            
            <p className="text-xs text-blue-600">
              Your symptom data helps your healthcare team monitor your recovery progress.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
