import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, animalType, weight, temperature, humidity, analysisType } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let diagnosis = '';
    let feedRecommendation = '';

    // Disease Detection from Image
    if (image && analysisType !== 'feed') {
      const diseasePrompt = `You are a livestock veterinary AI expert. Analyze this ${animalType} photo.

Environmental conditions:
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Weight: ${weight}kg

Provide:
1. Health status assessment
2. Visible signs of disease or distress
3. Possible diagnoses
4. Treatment recommendations
5. Preventive measures
6. When to call a veterinarian

Give a detailed professional response.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: diseasePrompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: image
                  }
                }
              ]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze animal health');
      }

      const data = await response.json();
      diagnosis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate diagnosis';
    }

    // Feed Schedule Generation
    if (analysisType === 'feed' || image) {
      const feedPrompt = `You are a livestock nutrition expert. Generate a detailed feed schedule for:

Animal: ${animalType}
Weight: ${weight}kg
Temperature: ${temperature}°C
Humidity: ${humidity}%

Provide:
1. Daily feed amount (kg)
2. Feeding times and frequency
3. Feed composition (types of fodder, grains, supplements)
4. Water requirements
5. Seasonal adjustments
6. Nutritional supplements needed
7. Cost estimation

Give specific, actionable recommendations.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: feedPrompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate feed schedule');
      }

      const data = await response.json();
      feedRecommendation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate feed schedule';
    }

    return new Response(
      JSON.stringify({ diagnosis, feedRecommendation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in livestock-health-ai:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
