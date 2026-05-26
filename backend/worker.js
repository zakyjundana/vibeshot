async function getYouTubeTranscript(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const videoIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(videoIdRegex);
    if (!match) {
      clearTimeout(timeoutId);
      return null;
    }
    const videoId = match[1];
    
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      signal: controller.signal
    });
    const html = await res.text();
    clearTimeout(timeoutId);
    
    const regex = /ytInitialPlayerResponse\s*=\s*({.+?});/;
    const jsonMatch = html.match(regex);
    if (!jsonMatch) return null;
    
    const playerResponse = JSON.parse(jsonMatch[1]);
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || captionTracks.length === 0) return null;
    
    const trackUrl = captionTracks[0].baseUrl;
    const trackRes = await fetch(trackUrl);
    const xmlText = await trackRes.text();
    
    const textRegex = /<text[^>]*>([\s\S]*?)<\/text>/g;
    let transcript = "";
    let m;
    while ((m = textRegex.exec(xmlText)) !== null) {
      transcript += m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') + " ";
    }
    return transcript.trim();
  } catch (e) {
    console.log("Skip auto-extract transkrip YouTube.");
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateSingleFluxImage(prompt, style, seedBase, falKey, targetModel) {
  const currentModel = targetModel || "fal-ai/flux/schnell";
  const currentMantra = style === "animation" 
    ? "premium 3D animation style, cinematic render, pixar disney style character design, smooth clay texture, gorgeous volumetric lighting, expressive facial features"
    : "award-winning cinematic commercial photography, highly detailed, photorealistic, flawless anatomy, shot on 35mm anamorphic lens, professional studio lighting, depth of field, 8k";
  
  const optimizedPrompt = `${prompt.trim()}, ${currentMantra}`;
  const encodedPrompt = encodeURIComponent(optimizedPrompt);
  const fallbackUrl = `https://image.pollinations.ai/p/${encodedPrompt}?width=540&height=960&seed=${seedBase}&model=flux`;
  
  if (!falKey) return fallbackUrl;

  let payload = { prompt: optimizedPrompt };
  if (currentModel.includes("flux")) {
    payload.image_size = "portrait_16_9";
    payload.seed = seedBase;
    payload.num_inference_steps = (currentModel.includes("schnell") || currentModel.includes("flash") || currentModel.includes("turbo")) ? 8 : 28;
    payload.guidance_scale = 3.5;
  } else {
    payload.style = style === "animation" ? "digital_illustration" : "realistic_image";
    payload.aspect_ratio = "9:16";
  }

  try {
    const response = await fetch(`https://fal.run/${currentModel}`, {
      method: "POST",
      headers: { "Authorization": `Key ${falKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Fal Busy");
    const falData = await response.json();
    return falData.images?.[0]?.url || falData.output?.images?.[0]?.url || falData.image?.url || fallbackUrl;
  } catch (error) {
    return fallbackUrl;
  }
}

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

    if (request.method === "GET") {
      const url = new URL(request.url);
      const briefId = url.searchParams.get("id");
      if (briefId) {
        if (!env.VIBESHOT_KV) return new Response(JSON.stringify({ error: "KV missing" }), { status: 500, headers: corsHeaders });
        const savedData = await env.VIBESHOT_KV.get(briefId);
        if (savedData) return new Response(savedData, { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });
      }
      return new Response(JSON.stringify({ status: "Online" }), { status: 200, headers: corsHeaders });
    }

    try {
      const bodyData = await request.json();
      const { 
        product, usp, trend, tone, shotCount, platform, pillar, talent, 
        isContinuation, existingShots, masterIdentity, title, visual_style,
        refType, refUrl, refTextDescription, refImageBase64, action, engineMode,
        singleShotId, shotToGenerate, imageModel, briefId 
      } = bodyData;
      
      const geminiKey = env.GEMINI_API_KEY;
      const falKey = env.FAL_API_KEY;
      if (!geminiKey) return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500, headers: corsHeaders });

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const currentSecondsBase = Math.floor(Date.now() / 1000);
      const activeBriefId = briefId || bodyData.briefId;

      // ========================================================
      // FASE 2: RENDER SINGLE IMAGE (🔥 FIX SAKTI DETEKSI ADAPTIF)
      // ========================================================
      if (action === "render_single_image" && shotToGenerate && activeBriefId && env.VIBESHOT_KV) {
        const existingBriefDataRaw = await env.VIBESHOT_KV.get(activeBriefId);
        if (!existingBriefDataRaw) return new Response(JSON.stringify({ error: "Data missing" }), { status: 404, headers: corsHeaders });
        let briefData = JSON.parse(existingBriefDataRaw);
        
        // Jalur 1: Coba cari berdasarkan ID bawaan frontend
        let shotIndex = briefData.shotlist.findIndex(s => s.id === singleShotId);
        
        // Jalur 2 Fallback: Jika ID ga cocok akibat dioverwrite frontend, cari berdasarkan kesamaan teks naskah audio/visual!
        if (shotIndex === -1) {
          shotIndex = briefData.shotlist.findIndex(s => 
            (s.audio && s.audio === shotToGenerate.audio) || 
            (s.action && s.action === shotToGenerate.action) ||
            (s.imagePrompt && s.imagePrompt === shotToGenerate.imagePrompt)
          );
        }
        
        // Jalur 3 Jaga-jaga: Kalau bener-bener mentok, pasang di slot pertama biar gak crash 404
        if (shotIndex === -1) shotIndex = 0;
        
        const currentStyle = visual_style || briefData.visual_style || "real-life";
        const targetPrompt = shotToGenerate.imagePrompt || shotToGenerate.action || "cinematic commercial scenario";
        const shotSeed = currentSecondsBase + shotIndex;

        const newImageUrl = await generateSingleFluxImage(targetPrompt, currentStyle, shotSeed, falKey, imageModel);
        
        briefData.shotlist[shotIndex].image = newImageUrl;
        briefData.shotlist[shotIndex].id = singleShotId; // Sinkronisasikan ID sekalian biar match buat request kedepan
        
        await env.VIBESHOT_KV.put(activeBriefId, JSON.stringify(briefData));
        return new Response(JSON.stringify({ imageUrl: newImageUrl }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ========================================================
      // FASE 2: BULK MASSAL IMAGE RENDER
      // ========================================================
      if (action === "render_images") {
        const incomingList = bodyData.shotlist || [];
        const processedList = await Promise.all(incomingList.map(async (shot, idx) => {
          const imageUrlMassal = await generateSingleFluxImage(shot.imagePrompt || shot.action, visual_style || "real-life", currentSecondsBase + idx, falKey, imageModel);
          return { ...shot, image: imageUrlMassal };
        }));
        let responsePayloadMassal = { title, premise: bodyData.premise, visual_style, master_identity: masterIdentity, shotlist: processedList, moodboard: processedList.map(shot => shot.image) };
        if (env.VIBESHOT_KV && activeBriefId) {
          responsePayloadMassal.briefId = activeBriefId;
          await env.VIBESHOT_KV.put(activeBriefId, JSON.stringify(responsePayloadMassal));
        }
        return new Response(JSON.stringify(responsePayloadMassal), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const strictProductionInstructions = `
        ATURAN PRODUCTION SHEET (WAJIB COGNISIVE & HIGH-DENSITY SHORT-HAND - TO THE POINT):
        - Tulis naskah secara padat, efisien, hilangkan kalimat pembuka basa-basi.
        - 'angle': Sebutkan tipe shot & camera movement teknis lapangan.
        - 'location': Deskripsi lokasi fisik & tata cahaya ringkas.
        - 'tech_budget_hack': 1 kalimat trik budget murah taktis lapangan (Bahasa Indonesia).
        - 'action': Gerakan visual talent/produk secara spesifik.
        - 'audio': Tulis copywriting naskah VO/Dialog kata-demi-kata siap ucap + efek SFX/Backsound (Bahasa Indonesia).
      `;

      // ========================================================
      // BABAK 1: KILAT IMAGE TO TEXT DESCRIPTION
      // ========================================================
      let imageToTextDescription = "";
      if (refType === "photo" && refImageBase64) {
        const cleanBase64Match = refImageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (cleanBase64Match) {
          try {
            const descResponse = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: "Bedah ringkas gambar moodboard referensi ini. Tulis dalam 2 kalimat bahasa inggris tentang: core framing layout, visual composition, and pacing rhythm." },
                    { inlineData: { mimeType: cleanBase64Match[1], data: cleanBase64Match[2] } }
                  ]
                }]
              })
            });
            if (descResponse.ok) {
              const descData = await descResponse.json();
              imageToTextDescription = descData.candidates[0].content.parts[0].text;
            }
          } catch (e) {}
        }
      }

      // ========================================================
      // BABAK 2: MAIN BRIEF GENERATION
      // ========================================================
      let promptText = "";

      if (isContinuation && existingShots && existingShots.length > 0) {
        const currentLength = existingShots.length;
        const historyText = existingShots.map((s, i) => `Shot ${i+1}: Angle ${s.angle}, Action ${s.action}, Audio ${s.audio}`).join("\n");
        promptText = `Lanjutkan naskah iklan ${product} (USP: ${usp}) sebanyak TEPAT ${shotCount || 3} adegan baru (mulai Shot ${currentLength + 1}). Harus inline bersambung rapi. Riwayat sebelumnya:\n${historyText}\n${strictProductionInstructions}\nTranslate rough inputs, fix human typos (Como/coto->cowo, pewe->cewe, ngelu->ngelus) dynamically into brilliant context.`;
      } else {
        const isCloneModeMassal = engineMode === "clone";
        let referenceContext = "";

        if (isCloneModeMassal) {
          if (refType === "link" && refUrl) {
            const ytTranscript = await getYouTubeTranscript(refUrl);
            referenceContext = ytTranscript ? `Transcript reference: "${ytTranscript}"` : `Link reference: ${refUrl}`;
          } else if (refType === "photo" && imageToTextDescription) {
            referenceContext = `Incorporate this scanned layout context: "${imageToTextDescription}"`;
          } else if (refType === "text" && refTextDescription) {
            referenceContext = `Manual instruction: "${refTextDescription}"`;
          }

          promptText = `Curi ritme & kerangka dari referensi ini:\n${referenceContext}\n\nUbah total menjadi produk target baru: ${product} dengan USP/Hooks: ${usp}. Buat TEPAT ${shotCount || 6} shot list adegan berkontinuitas visual sempurna. Ciptakan 'master_identity' visual fisik talent & objek dalam bahasa inggris, lalu kunci di setiap adegan 'imagePrompt'. Fix human typos (Como/coto->cowo, pewe->cewe, ngelu->ngelus) naturally.\n${strictProductionInstructions}`;
        } else {
          let hybridContext = "";
          if (refType === "photo" && imageToTextDescription) hybridContext = `Incorporate visual style analysis: "${imageToTextDescription}"`;
          else if (refType === "text" && refTextDescription) hybridContext = `Manual rules: "${refTextDescription}"`;

          promptText = `Kamu adalah Creative Director. Pecah ide kasar brand berikut menjadi TEPAT ${shotCount || 6} shot list adegan berkesinambungan rapi.
            Target Produk: ${product}
            Fokus USP Klien: ${usp}
            Tone & Platform: ${tone} via ${platform} (${pillar}, ${talent})
            ${hybridContext}
            Aturan: Ciptakan 1 'master_identity' look karakter/produk (Bahasa Inggris) dan sebutkan secara SAMA PERSIS di setiap 'imagePrompt' adegan agar gambar konsisten. Fix human typos seamlessly (Como/coto->cowo, pewe->cewe, ngelu->ngelus).
            ${strictProductionInstructions}`;
        }
      }

      const strictJsonSchema = {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          premise: { type: "STRING" },
          visual_style: { type: "STRING" },
          master_identity: {
            type: "OBJECT",
            properties: {
              talent: { type: "STRING" },
              product: { type: "STRING" }
            },
            required: ["talent", "product"]
          },
          shotlist: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                angle: { type: "STRING" },
                location: { type: "STRING" },
                tech_budget_hack: { type: "STRING" },
                action: { type: "STRING" },
                audio: { type: "STRING" },
                imagePrompt: { type: "STRING" }
              },
              required: ["angle", "location", "tech_budget_hack", "action", "audio", "imagePrompt"]
            }
          }
        },
        required: ["title", "premise", "visual_style", "master_identity", "shotlist"]
      };

      const geminiResponseTextOnly = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: promptText }] }], 
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: strictJsonSchema
          } 
        })
      });

      const responseTextGeminiTextOnly = await geminiResponseTextOnly.text();
      if (!geminiResponseTextOnly.ok) throw new Error(`Gemini Error: ${responseTextGeminiTextOnly}`);

      const geminiRawPayload = JSON.parse(responseTextGeminiTextOnly);
      let textContent = geminiRawPayload.candidates[0].content.parts[0].text;
      
      if (typeof textContent === "string") {
        const startIdx = textContent.indexOf("{");
        const endIdx = textContent.lastIndexOf("}");
        if (startIdx !== -1 && endIdx !== -1) {
          textContent = textContent.substring(startIdx, endIdx + 1);
        }
      }
      
      const aiJsonTextOnly = typeof textContent === "object" ? textContent : JSON.parse(textContent);
      
      aiJsonTextOnly.shotlist = aiJsonTextOnly.shotlist.map(shot => ({ ...shot, image: "" }));
      aiJsonTextOnly.moodboard = [];

      if (env.VIBESHOT_KV) {
        const generatedIdMassal = crypto.randomUUID();
        let cloudDataPayloadMassal = { ...aiJsonTextOnly };
        if (isContinuation && existingShots && existingShots.length > 0) {
          cloudDataPayloadMassal.shotlist = [...existingShots, ...aiJsonTextOnly.shotlist];
        }
        cloudDataPayloadMassal.briefId = generatedIdMassal;
        aiJsonTextOnly.briefId = generatedIdMassal; 
        await env.VIBESHOT_KV.put(generatedIdMassal, JSON.stringify(cloudDataPayloadMassal));
      }

      return new Response(JSON.stringify(aiJsonTextOnly), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};
