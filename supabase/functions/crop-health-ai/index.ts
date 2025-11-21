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
    const { image, cropType } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    if (!image) {
      throw new Error('No image provided');
    }

    const prompt = `You are an agricultural AI expert specializing in crop disease detection. Analyze this ${cropType} plant/leaf photo.

Provide a comprehensive analysis including:

1. **Disease Identification**
   - Name of the disease/pest/deficiency
   - Severity level (mild/moderate/severe)
   - Confidence level of diagnosis

2. **Symptoms Observed**
   - Visual symptoms visible in the image
   - Stage of infection

3. **Treatment Plan**
   - Immediate actions required
   - Recommended pesticides/fungicides (with proper names and dilution ratios)
   - Organic treatment alternatives
   - Application frequency and timing

4. **Fertilizer Recommendations**
   - NPK requirements
   - Micronutrient needs
   - Application schedule

5. **Preventive Measures**
   - Cultural practices to prevent recurrence
   - Crop rotation suggestions
   - Irrigation management
   - Companion planting ideas

6. **Expected Recovery Time**
   - Timeline for visible improvement
   - Monitoring checkpoints

7. **Economic Impact**
   - Potential yield loss if untreated
   - Treatment cost estimate

Provide detailed, practical, and farmer-friendly recommendations.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
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
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error('Failed to analyze crop health');
    }

    const data = await response.json();
    const fullAnalysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate analysis';

    // Split the analysis into diagnosis and recommendations for better UI display
    const sections = fullAnalysis.split(/\n(?=\d+\.|#{1,3})/);
    const diagnosisSection = sections.slice(0, 3).join('\n\n');
    const recommendationsSection = sections.slice(3).join('\n\n');

    return new Response(
      JSON.stringify({ 
        diagnosis: diagnosisSection || fullAnalysis,
        recommendations: recommendationsSection || 'See diagnosis for complete recommendations'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in crop-health-ai:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
