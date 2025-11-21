
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
    const { level, focus } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate 5 specific yoga tasks for a ${level} level practitioner focusing on ${focus}. Each task should be:
    - Specific and actionable
    - Include duration or repetitions
    - Be appropriate for ${level} level
    - Focus on ${focus}
    
    Return the response as a JSON array of objects with "task" and "duration" properties. Example:
    [
      {"task": "Hold Mountain Pose with deep breathing", "duration": "2 minutes"},
      {"task": "Perform 10 Sun Salutation A sequences", "duration": "15 minutes"}
    ]`;

    console.log('Making OpenAI API request for level:', level, 'focus:', focus);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a certified yoga instructor. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const tasksText = data.choices[0].message.content;
    console.log('Tasks text:', tasksText);
    
    // Parse the JSON response
    let tasks;
    try {
      tasks = JSON.parse(tasksText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback tasks if parsing fails
      tasks = [
        {"task": `Practice basic ${focus} poses for ${level} level`, "duration": "10 minutes"},
        {"task": `Hold Mountain Pose with focus on ${focus}`, "duration": "3 minutes"},
        {"task": `Perform gentle stretches targeting ${focus}`, "duration": "15 minutes"},
        {"task": `Practice breathing exercises`, "duration": "5 minutes"},
        {"task": `End with relaxation pose`, "duration": "5 minutes"}
      ];
    }

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-yoga-tasks function:', error);
    
    // Return fallback tasks on error
    const fallbackTasks = [
      {"task": "Practice Mountain Pose with deep breathing", "duration": "3 minutes"},
      {"task": "Perform gentle neck and shoulder rolls", "duration": "5 minutes"},
      {"task": "Hold Warrior I pose on both sides", "duration": "6 minutes"},
      {"task": "Practice Cat-Cow stretches", "duration": "5 minutes"},
      {"task": "End with Child's Pose relaxation", "duration": "5 minutes"}
    ];
    
    return new Response(JSON.stringify({ tasks: fallbackTasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
