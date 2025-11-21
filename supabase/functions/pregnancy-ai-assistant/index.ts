
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, week, language, messageType, userId } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get patient profile and pregnancy details for personalized analysis
    const { data: pregnancyProfile } = await supabase
      .from('pregnancy_profiles')
      .select('*')
      .eq('patient_id', userId)
      .single()

    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    let systemPrompt = ''
    let userPrompt = message

    if (messageType === 'weekly_guide') {
      systemPrompt = `You are an expert pregnancy counselor and medical advisor. Analyze the patient's pregnancy profile and provide comprehensive week ${week} guidance.

Patient Details:
- Current Week: ${week}
- Due Date: ${pregnancyProfile?.due_date || 'Not specified'}
- Language: ${language}
- Medical History: ${patientProfile?.medical_history || 'None specified'}
- Allergies: ${patientProfile?.allergies || 'None specified'}
- Blood Group: ${patientProfile?.blood_group || 'Not specified'}

Provide detailed, personalized guidance covering:
1. Baby's development this week
2. Physical changes the mother might experience
3. Personalized health tips based on medical history
4. Important milestones and checkups
5. Warning signs to watch for
6. Emotional support and encouragement

Respond in ${language === 'bengali' ? 'Bengali' : 'English'} language. Be warm, supportive, and medically accurate.`

      userPrompt = `Generate comprehensive week ${week} pregnancy guidance considering the patient's profile.`
    } else if (messageType === 'food_guide') {
      systemPrompt = `You are a certified nutritionist specializing in pregnancy nutrition. Analyze the patient's profile and provide personalized dietary recommendations for week ${week}.

Patient Details:
- Current Week: ${week}
- Medical History: ${patientProfile?.medical_history || 'None specified'}
- Allergies: ${patientProfile?.allergies || 'None specified'}
- Blood Group: ${patientProfile?.blood_group || 'Not specified'}

Provide specific recommendations:
1. Essential nutrients needed this week
2. Recommended foods (considering allergies and medical conditions)
3. Foods to avoid
4. Meal timing and portion sizes
5. Hydration guidelines
6. Supplement recommendations
7. Traditional/cultural foods if beneficial

Format the response clearly with "RECOMMENDED FOODS:" and "FOODS TO AVOID:" sections.
Respond in ${language === 'bengali' ? 'Bengali' : 'English'} language.`

      userPrompt = `Generate personalized nutrition plan for week ${week} considering allergies: ${patientProfile?.allergies || 'none'} and medical history: ${patientProfile?.medical_history || 'none'}.`
    } else if (messageType === 'chat') {
      systemPrompt = `You are an AI pregnancy health assistant with expertise in obstetrics and maternal care. You have access to the patient's profile and can provide personalized advice.

Patient Context:
- Current Week: ${week}
- Medical History: ${patientProfile?.medical_history || 'None specified'}
- Allergies: ${patientProfile?.allergies || 'None specified'}
- Blood Group: ${patientProfile?.blood_group || 'Not specified'}

Guidelines:
1. Provide accurate, evidence-based medical information
2. Be empathetic and supportive
3. For serious symptoms, ALWAYS recommend consulting a healthcare provider
4. Personalize advice based on the patient's medical history
5. If it's an emergency (severe pain, bleeding, difficulty breathing), immediately advise calling emergency services
6. Use the patient's medical context to provide relevant advice

Respond in ${language === 'bengali' ? 'Bengali' : 'English'} language.

EMERGENCY KEYWORDS: If the user mentions severe bleeding, severe abdominal pain, difficulty breathing, severe headaches, vision problems, or signs of labor before 37 weeks, start your response with "🚨 EMERGENCY: Contact your doctor immediately or call emergency services."`

      userPrompt = message
    } else if (messageType === 'yoga_search') {
      systemPrompt = `You are a pregnancy yoga specialist. Generate YouTube search queries for safe, appropriate yoga content for pregnant women.

Patient Details:
- Current Week: ${week}
- Medical History: ${patientProfile?.medical_history || 'None specified'}

Consider:
1. Trimester-appropriate poses
2. Safety modifications
3. Specific benefits for current week
4. Any medical contraindications

Generate 3-5 specific YouTube search terms that would find appropriate pregnancy yoga videos.`

      userPrompt = `Generate YouTube search terms for safe pregnancy yoga videos for week ${week}.`
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
          maxOutputTokens: 2048,
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

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help with your pregnancy journey!"

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
