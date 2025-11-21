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
    const { image, symptoms, analysisType } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let prompt = '';
    let requestBody: any = {
      contents: [{
        parts: []
      }]
    };

    if (image) {
      prompt = `You are a veterinary AI assistant. Analyze this pet photo and provide:
1. Visible health concerns or abnormalities
2. Possible diagnoses based on visual symptoms
3. Recommended actions (vet visit urgency, home care tips)
4. Diet and nutrition suggestions
5. Preventive care advice

Additional context: ${symptoms || 'No additional symptoms provided'}

Provide a detailed, caring, and professional response.`;

      requestBody.contents[0].parts.push(
        { text: prompt },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: image
          }
        }
      );
    } else {
      prompt = `You are a veterinary AI assistant. Based on these symptoms: "${symptoms}"

Provide:
1. Possible diagnoses
2. Severity assessment (mild/moderate/severe)
3. Treatment suggestions
4. Diet recommendations
5. When to see a vet
6. Home care tips

Give a detailed, caring, and professional response.`;

      requestBody.contents[0].parts.push({ text: prompt });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error('Failed to analyze pet health');
    }

    const data = await response.json();
    const diagnosis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate diagnosis';

    return new Response(
      JSON.stringify({ diagnosis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in pet-health-ai:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
