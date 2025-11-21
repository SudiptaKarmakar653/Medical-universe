
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlantIdRequest {
  images: string[];
  similar_images?: boolean;
  health?: string;
  classification_level?: string;
}

interface PlantIdResponse {
  id: string;
  custom_id?: string;
  meta_data?: {
    latitude?: number;
    longitude?: number;
    date?: string;
    datetime?: string;
  };
  uploaded_datetime?: string;
  finished_datetime?: string;
  result: {
    classification: {
      suggestions: Array<{
        id: string;
        name: string;
        probability: number;
        similar_images?: Array<{
          id: string;
          url: string;
          similarity: number;
        }>;
        details?: {
          language: string;
          entity_id: string;
        };
      }>;
    };
    is_healthy?: {
      binary: boolean;
      probability: number;
    };
    disease?: {
      suggestions: Array<{
        id: string;
        name: string;
        probability: number;
      }>;
    };
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const PLANT_ID_API_KEY = "NFbv1NxYwmpA3cS8TqdrlBwKQLPaIpH4MHW6kbcoSMwqitLDgz";
const GEMINI_API_KEY = "AIzaSyCE9xXjPnFIgfaH0tLtRwuKW6fDMm0o6ow";
const GEMINI_MODEL = "models/gemini-1.5-flash-latest";

async function getGeminiInfo(plantName: string): Promise<{ medicinalUses: string[], plantCare: any }> {
  const prompt = `You are an expert in both Ayurvedic medicine and botany.

The plant name is: "${plantName}"

Step 1: Give the **medicinal uses** of this plant from an Ayurvedic perspective. Mention the parts used and the diseases or conditions it helps with. Use simple bullet points.

Step 2: Then give **plant care instructions** — including watering, sun requirements, growth rate, and flowering season. If any info is unknown, mention "Unknown".

Avoid any scientific classification, taxonomy, or general botanical descriptions. Focus only on health uses and how to care for the plant.

Please format your response as JSON with the following structure:
{
  "medicinalUses": ["bullet point 1", "bullet point 2", ...],
  "plantCare": {
    "watering": "description",
    "sunRequirements": "description", 
    "growthRate": "description",
    "floweringSeason": "description"
  }
}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return {
        medicinalUses: [],
        plantCare: {
          watering: "Unknown",
          sunRequirements: "Unknown",
          growthRate: "Unknown",
          floweringSeason: "Unknown"
        }
      };
    }

    const geminiData: GeminiResponse = await response.json();
    const responseText = geminiData.candidates[0]?.content?.parts[0]?.text || "";
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData;
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError);
    }

    // Fallback: parse manually from text
    const medicinalUses = responseText
      .split('medicinal uses')[1]
      ?.split('plant care')[0]
      ?.split('•')
      .filter(item => item.trim().length > 0)
      .map(item => item.trim()) || [];

    return {
      medicinalUses,
      plantCare: {
        watering: "Unknown",
        sunRequirements: "Unknown", 
        growthRate: "Unknown",
        floweringSeason: "Unknown"
      }
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      medicinalUses: [],
      plantCare: {
        watering: "Unknown",
        sunRequirements: "Unknown",
        growthRate: "Unknown", 
        floweringSeason: "Unknown"
      }
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    console.log('Received image data, length:', image ? image.length : 0);

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Convert base64 to binary data
    const base64Data = image.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    console.log('Base64 data length:', base64Data ? base64Data.length : 0);
    
    const requestBody: PlantIdRequest = {
      images: [base64Data],
      similar_images: true,
      health: "all",
      classification_level: "all"
    };

    console.log('Sending request to Plant.id API...');
    
    const response = await fetch('https://plant.id/api/v3/identification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PLANT_ID_API_KEY,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Plant.id API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Plant.id API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to identify plant', details: errorText }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const plantData: PlantIdResponse = await response.json();
    console.log('Plant.id API response data:', JSON.stringify(plantData, null, 2));
    
    // Check if we have valid classification results
    if (!plantData.result || !plantData.result.classification || !plantData.result.classification.suggestions) {
      console.error('Invalid response structure:', plantData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from plant identification service' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get detailed info from Gemini for the top result
    const topPlant = plantData.result.classification.suggestions[0];
    const geminiInfo = await getGeminiInfo(topPlant.name);

    // Transform the response to match our expected format
    const transformedResults = plantData.result.classification.suggestions.map(suggestion => ({
      plant_name: suggestion.name,
      scientific_name: suggestion.name, // Plant.id returns scientific name as name
      probability: suggestion.probability,
      plant_details: {
        common_names: [],
        edible_parts: [],
        watering: geminiInfo.plantCare.watering || "Unknown",
        propagation_methods: [],
        care_level: "Unknown",
        growth_rate: geminiInfo.plantCare.growthRate || "Unknown",
        sun_requirements: geminiInfo.plantCare.sunRequirements || "Unknown",
        flowering_season: geminiInfo.plantCare.floweringSeason || "Unknown",
        harvest_season: "Unknown",
        leaf_color: [],
        flower_color: [],
        fruit_color: [],
        medicinal_uses: geminiInfo.medicinalUses || [],
        chemical_constituents: [],
        part_used_medicinally: [],
        ayurvedic_properties: {
          rasa: ["Sweet", "Bitter"],
          virya: "Cooling",
          vipaka: "Sweet",
          dosha_effects: ["Balances Pitta", "Reduces Vata"],
          therapeutic_uses: geminiInfo.medicinalUses || [
            "Digestive disorders",
            "Respiratory issues",
            "Skin conditions",
            "Inflammatory conditions"
          ]
        }
      },
      health_assessment: {
        diseases: plantData.result.disease?.suggestions?.map(d => d.name) || [],
        is_healthy: plantData.result.is_healthy?.binary || true,
        disease_details: []
      },
      similar_images: suggestion.similar_images || []
    }));

    const result = {
      results: transformedResults,
      success: true
    };

    console.log('Sending transformed results:', JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in plant identification:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
