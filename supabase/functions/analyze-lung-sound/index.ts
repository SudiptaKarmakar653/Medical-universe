
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  diagnosis: string;
  confidence: number;
  soundType: string;
  recommendations: string;
  spectrogramImage: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing audio file:', audioFile.name, 'Size:', audioFile.size);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock analysis results with different variations
    const mockResults: AnalysisResult[] = [
      {
        diagnosis: "Detected crackles in upper left lung zone. Possible Pneumonia or Bronchitis.",
        confidence: 0.85,
        soundType: "crackles",
        recommendations: "Recommend chest X-ray and sputum culture. Consider antibiotic therapy.",
        spectrogramImage: ""
      },
      {
        diagnosis: "Wheezing sounds detected. Possible Asthma or COPD exacerbation.",
        confidence: 0.78,
        soundType: "wheezes",
        recommendations: "Consider bronchodilator therapy and pulmonary function tests.",
        spectrogramImage: ""
      },
      {
        diagnosis: "Normal breath sounds with no significant abnormalities detected.",
        confidence: 0.92,
        soundType: "normal",
        recommendations: "Continue routine monitoring. No immediate intervention required.",
        spectrogramImage: ""
      }
    ];

    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];

    // Generate spectrogram based on detected sound type
    const spectrogramResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-lung-spectrogram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        soundType: randomResult.soundType,
        duration: 5
      })
    });

    if (spectrogramResponse.ok) {
      const spectrogramData = await spectrogramResponse.json();
      randomResult.spectrogramImage = spectrogramData.spectrogramImage;
    } else {
      // Fallback to existing static image
      randomResult.spectrogramImage = "/lovable-uploads/df998334-2c96-457c-861b-56a3b5f3d2cc.png";
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: randomResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in analyze-lung-sound function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze audio',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
