
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, week, language } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate tasks for the week
    const tasks = []
    
    // Yoga tasks
    for (let day = 1; day <= 7; day++) {
      tasks.push({
        patient_id: userId,
        task_type: 'yoga',
        task_title: `Day ${day} Pregnancy Yoga`,
        task_description: `Gentle yoga routine for week ${week}, day ${day}. Focus on breathing and stretching.`,
        week_number: week,
        day_number: day,
        is_completed: false
      })
    }

    // Food guide tasks
    for (let day = 1; day <= 7; day++) {
      tasks.push({
        patient_id: userId,
        task_type: 'food',
        task_title: `Day ${day} Nutrition Guide`,
        task_description: `Daily nutrition recommendations for week ${week}`,
        week_number: week,
        day_number: day,
        is_completed: false
      })
    }

    // Insert tasks into database
    const { error } = await supabaseClient
      .from('pregnancy_tasks')
      .insert(tasks)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, tasksGenerated: tasks.length }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
