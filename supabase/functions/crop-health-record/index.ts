// Supabase Edge Function: crop-health-record/index.ts
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // Parse request
  const { action, payload } = await req.json();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);

  // Helper: get user id from JWT
  const getUserId = async () => {
    const { user } = await supabase.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', ''));
    return user?.id;
  };

  // CRUD actions
  if (action === 'create_record') {
    const user_id = await getUserId();
    const { plot_name, crop_type, soil_report_url } = payload;
    const { data, error } = await supabase.from('crop_health_records').insert({ user_id, plot_name, crop_type, soil_report_url }).select().single();
    if (error) return new Response(JSON.stringify({ error }), { status: 400 });
    return new Response(JSON.stringify({ data }), { status: 200 });
  }

  if (action === 'get_records') {
    const user_id = await getUserId();
    const { data, error } = await supabase.from('crop_health_records').select('*').eq('user_id', user_id);
    if (error) return new Response(JSON.stringify({ error }), { status: 400 });
    return new Response(JSON.stringify({ data }), { status: 200 });
  }

  // Soil report upload (expects base64 file and record_id)
  if (action === 'upload_soil_report') {
    const { record_id, file_base64, file_name } = payload;
    // Upload to storage bucket 'crop-reports'
    const { data: uploadData, error: uploadError } = await supabase.storage.from('crop-reports').upload(`${record_id}/${file_name}`, file_base64, { contentType: 'application/pdf' });
    if (uploadError) return new Response(JSON.stringify({ error: uploadError }), { status: 400 });
    const url = supabase.storage.from('crop-reports').getPublicUrl(`${record_id}/${file_name}`).publicUrl;
    // Update record
    await supabase.from('crop_health_records').update({ soil_report_url: url }).eq('id', record_id);
    return new Response(JSON.stringify({ url }), { status: 200 });
  }

  // Treatment CRUD
  if (action === 'add_treatment') {
    const { record_id, treatment_type, name, dose, date, notes } = payload;
    const { data, error } = await supabase.from('crop_treatments').insert({ record_id, treatment_type, name, dose, date, notes }).select().single();
    if (error) return new Response(JSON.stringify({ error }), { status: 400 });
    return new Response(JSON.stringify({ data }), { status: 200 });
  }
  if (action === 'get_treatments') {
    const { record_id } = payload;
    const { data, error } = await supabase.from('crop_treatments').select('*').eq('record_id', record_id).order('date', { ascending: false });
    if (error) return new Response(JSON.stringify({ error }), { status: 400 });
    return new Response(JSON.stringify({ data }), { status: 200 });
  }
  if (action === 'delete_treatment') {
    const { id } = payload;
    const { error } = await supabase.from('crop_treatments').delete().eq('id', id);
    if (error) return new Response(JSON.stringify({ error }), { status: 400 });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  // Symptom CRUD (with image)
  if (action === 'add_symptom') {
    const { record_id, symptom, image_base64, image_name, date, notes } = payload;
    let image_url = null;
    if (image_base64 && image_name) {
      const { data: imgData, error: imgError } = await supabase.storage.from('crop-symptoms').upload(`${record_id}/${image_name}`, image_base64, { contentType: 'image/jpeg' });
      if (imgError) return new Response(JSON.stringify({ error: imgError }), { status: 400 });
      image_url = supabase.storage.from('crop-symptoms').getPublicUrl(`${record_id}/${image_name}`).publicUrl;
    }
    const { data, error } = await supabase.from('crop_symptoms').insert({ record_id, symptom, image_url, date, notes }).select().single();
    if (error) return new Response(JSON.stringify({ error }), { status: 400 });
    return new Response(JSON.stringify({ data }), { status: 200 });
  }
  if (action === 'get_symptoms') {
    const { record_id } = payload;
    const { data, error } = await supabase.from('crop_symptoms').select('*').eq('record_id', record_id).order('date', { ascending: false });
    if (error) return new Response(JSON.stringify({ error }), { status: 400 });
    return new Response(JSON.stringify({ data }), { status: 200 });
  }

  // Timeline CRUD (with image)
  if (action === 'add_timeline') {
    const { record_id, stage, image_base64, image_name, date, notes } = payload;
    let image_url = null;
    if (image_base64 && image_name) {
      const { data: imgData, error: imgError } = await supabase.storage.from('crop-timelines').upload(`${record_id}/${image_name}`, image_base64, { contentType: 'image/jpeg' });
      if (imgError) return new Response(JSON.stringify({ error: imgError }), { status: 400 });
      image_url = supabase.storage.from('crop-timelines').getPublicUrl(`${record_id}/${image_name}`).publicUrl;
    }
    const { data, error } = await supabase.from('crop_timelines').insert({ record_id, stage, image_url, date, notes }).select().single();
    if (error) return new Response(JSON.stringify({ error }), { status: 400 });
    return new Response(JSON.stringify({ data }), { status: 200 });
  }
  if (action === 'get_timelines') {
    const { record_id } = payload;
    const { data, error } = await supabase.from('crop_timelines').select('*').eq('record_id', record_id).order('date', { ascending: true });
    if (error) return new Response(JSON.stringify({ error }), { status: 400 });
    return new Response(JSON.stringify({ data }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
});
