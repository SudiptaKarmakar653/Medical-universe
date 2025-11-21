
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
    const { query, type, userLevel, userProgress } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    
    if (type === 'pose_instructions') {
      systemPrompt = `You are a friendly and knowledgeable yoga expert. When asked about a yoga pose, provide clear, simple, step-by-step instructions suitable for ${userLevel} level practitioners. Use encouraging and easy-to-understand language. Include:
      1. Starting position
      2. Step-by-step movements
      3. Key alignment points
      4. Breathing instructions
      5. Common mistakes to avoid
      6. Modifications for different levels
      7. Benefits of the pose`;
    } else if (type === 'posture_correction') {
      systemPrompt = `You are a yoga posture correction expert. Analyze the posture feedback and provide specific corrections and improvements. Focus on:
      1. Alignment corrections
      2. Safety considerations
      3. Gradual improvement suggestions
      4. Breathing reminders`;
    } else {
      systemPrompt = `You are a friendly yoga expert and developer assistant. Help with yoga guidance, pose instructions, and technical implementation of AI-powered posture detection using TensorFlow.js and MoveNet. Adapt your response based on the user's ${userLevel} level and current progress.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in yoga-ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
