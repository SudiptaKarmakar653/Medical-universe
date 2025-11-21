
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = 'AIzaSyB4frRuhdWmCrUfyUojOTYcFJ9HQFqbhTY'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, surgeryType, currentDay, messageType, userId } = await req.json()

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get user's recovery progress for personalized advice
    const { data: recoveryProgress } = await supabase
      .from('patient_recovery_progress')
      .select('*')
      .eq('patient_id', userId)
      .single()

    let systemPrompt = ''
    let userPrompt = message

    if (messageType === 'daily_motivation') {
      systemPrompt = `You are a compassionate recovery assistant helping patients after surgery. 

Patient Context:
- Surgery Type: ${surgeryType}
- Current Recovery Day: ${currentDay}
- Surgery Date: ${recoveryProgress?.surgery_date || 'Not specified'}

Generate a warm, encouraging daily motivation message that:
1. Acknowledges their progress on day ${currentDay}
2. Provides specific encouragement for their surgery type
3. Includes practical recovery tips
4. Uses a supportive, medical professional tone
5. Keeps the message concise (2-3 sentences)

Focus on healing, patience, and celebrating small victories.`

      userPrompt = `Generate daily motivation for day ${currentDay} of ${surgeryType} surgery recovery.`
    } else if (messageType === 'task_guidance') {
      systemPrompt = `You are a medical recovery specialist providing task-specific guidance.

Patient Context:
- Surgery Type: ${surgeryType}
- Current Recovery Day: ${currentDay}

Provide detailed, safe guidance for recovery tasks. Include:
1. Step-by-step instructions
2. Safety precautions
3. What to expect during the task
4. When to stop or seek help
5. Encouragement

Be specific to the surgery type and recovery stage.`

      userPrompt = message
    } else if (messageType === 'symptom_analysis') {
      systemPrompt = `You are a medical triage assistant analyzing post-surgery symptoms.

CRITICAL: If symptoms suggest emergency (severe pain, difficulty breathing, chest pain, signs of infection), 
start response with "🚨 EMERGENCY: Contact your doctor immediately or call emergency services."

For non-emergency symptoms:
- Provide reassurance if normal
- Suggest comfort measures
- Recommend when to contact healthcare provider
- Be supportive but medically accurate

Surgery Context: ${surgeryType}, Day ${currentDay}`

      userPrompt = message
    } else {
      systemPrompt = `You are a helpful recovery assistant specializing in post-surgery care.

Patient Context:
- Surgery Type: ${surgeryType}
- Recovery Day: ${currentDay}

Provide supportive, accurate information about:
- Recovery expectations
- Pain management
- Activity guidelines
- When to seek medical help
- Emotional support

Always encourage patients to consult their healthcare team for specific medical concerns.`

      userPrompt = message
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser Input: ${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Gemini API Error:', data)
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`)
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to support your recovery journey!"

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get AI response',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
