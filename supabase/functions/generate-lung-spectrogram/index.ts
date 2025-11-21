
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
    const { soundType = 'normal', duration = 5 } = await req.json();
    
    // Canvas dimensions for high-resolution medical image
    const width = 1024;
    const height = 768;
    const padding = 80;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;
    
    // Create SVG for the spectrogram
    let svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="spectrogramGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ff4444;stop-opacity:1" />
            <stop offset="25%" style="stop-color:#ffaa00;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#ffff00;stop-opacity:1" />
            <stop offset="75%" style="stop-color:#00ff00;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0044ff;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="#1a1a2e"/>
        
        <!-- Title -->
        <text x="${width/2}" y="30" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">
          Lung Sound Spectrogram
        </text>
        
        <!-- Y-axis label -->
        <text x="20" y="${height/2}" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle" transform="rotate(-90 20 ${height/2})">
          Frequency (Hz)
        </text>
        
        <!-- X-axis label -->
        <text x="${width/2}" y="${height - 20}" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle">
          Time (seconds)
        </text>
        
        <!-- Plot area background -->
        <rect x="${padding}" y="${padding}" width="${plotWidth}" height="${plotHeight}" fill="#0f0f1a" stroke="#333" stroke-width="2"/>
    `;
    
    // Generate frequency data based on sound type
    const generateSpectrogramData = (type: string) => {
      const timeSteps = 100;
      const freqBins = 80;
      const data = [];
      
      for (let t = 0; t < timeSteps; t++) {
        for (let f = 0; f < freqBins; f++) {
          const freq = (f / freqBins) * 2000; // 0-2000 Hz range
          const time = (t / timeSteps) * duration;
          
          let intensity = 0;
          
          if (type === 'wheezes') {
            // High-frequency components for wheezing
            if (freq > 400 && freq < 1000) {
              intensity = 0.7 + 0.3 * Math.sin(time * 8 + freq * 0.01);
            } else if (freq > 100 && freq < 400) {
              intensity = 0.3 + 0.2 * Math.sin(time * 4);
            }
          } else if (type === 'crackles') {
            // Sharp, transient high-frequency events
            if (Math.random() < 0.1 && freq > 500) {
              intensity = 0.8 + 0.2 * Math.random();
            } else if (freq < 300) {
              intensity = 0.4 + 0.3 * Math.sin(time * 6);
            }
          } else {
            // Normal breathing - lower frequencies
            if (freq < 200) {
              intensity = 0.5 + 0.3 * Math.sin(time * 2 + freq * 0.02);
            } else if (freq < 500) {
              intensity = 0.2 + 0.1 * Math.sin(time * 3);
            }
          }
          
          // Add some noise
          intensity += 0.1 * Math.random();
          intensity = Math.max(0, Math.min(1, intensity));
          
          if (intensity > 0.1) {
            data.push({
              x: padding + (t / timeSteps) * plotWidth,
              y: padding + plotHeight - (f / freqBins) * plotHeight,
              intensity
            });
          }
        }
      }
      
      return data;
    };
    
    const spectrogramData = generateSpectrogramData(soundType);
    
    // Draw spectrogram points
    spectrogramData.forEach(point => {
      const opacity = point.intensity;
      const color = `rgba(${Math.floor(255 * point.intensity)}, ${Math.floor(255 * (1 - point.intensity * 0.5))}, ${Math.floor(255 * (1 - point.intensity))}, ${opacity})`;
      
      svg += `<rect x="${point.x}" y="${point.y}" width="3" height="3" fill="${color}"/>`;
    });
    
    // Add frequency scale
    for (let i = 0; i <= 10; i++) {
      const freq = (i / 10) * 2000;
      const y = padding + plotHeight - (i / 10) * plotHeight;
      svg += `<line x1="${padding - 5}" y1="${y}" x2="${padding}" y2="${y}" stroke="#666" stroke-width="1"/>`;
      svg += `<text x="${padding - 10}" y="${y + 5}" font-family="Arial, sans-serif" font-size="12" fill="#ccc" text-anchor="end">${freq.toFixed(0)}</text>`;
    }
    
    // Add time scale
    for (let i = 0; i <= 10; i++) {
      const time = (i / 10) * duration;
      const x = padding + (i / 10) * plotWidth;
      svg += `<line x1="${x}" y1="${padding + plotHeight}" x2="${x}" y2="${padding + plotHeight + 5}" stroke="#666" stroke-width="1"/>`;
      svg += `<text x="${x}" y="${padding + plotHeight + 20}" font-family="Arial, sans-serif" font-size="12" fill="#ccc" text-anchor="middle">${time.toFixed(1)}</text>`;
    }
    
    svg += '</svg>';
    
    // Convert SVG to base64
    const svgBase64 = btoa(svg);
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    
    return new Response(
      JSON.stringify({
        success: true,
        spectrogramImage: dataUrl,
        soundType,
        duration
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating spectrogram:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate spectrogram',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
