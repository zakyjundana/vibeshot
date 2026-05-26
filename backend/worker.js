// ========================================================
// VIBESHOT BACKEND — CLOUDFLARE WORKER (SUPABASE & CORS SECURED)
// ========================================================

// Base64url decoder helper
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const raw = atob(str);
  const buffer = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    buffer[i] = raw.charCodeAt(i);
  }
  return buffer;
}

// HS256 JWT Signature Verification Helper using Web Crypto (Zero Dependencies)
// IMPORTANT: Supabase JWT secret is base64-encoded. We must decode it to raw bytes first.
async function verifyJWT(token, secret) {
  if (!token || !secret) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    
    // Supabase JWT secrets are base64-encoded — decode to raw bytes for HMAC key
    // This is the critical fix: using UTF-8 bytes of base64 string was wrong
    let keyData;
    try {
      keyData = Uint8Array.from(atob(secret), c => c.charCodeAt(0));
    } catch {
      // Fallback: if base64 decode fails, use raw UTF-8 bytes
      keyData = encoder.encode(secret);
    }
    
    // Import the secret as an HMAC key
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["verify"]
    );
    
    // Decode the signature and verify it
    const signature = base64UrlDecode(signatureB64);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      data
    );
    
    if (!isValid) return null;
    
    // Decode and parse the JSON payload
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    
    // Check if the token has expired
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    
    return payload; // Returns payload containing .sub as user_id
  } catch (e) {
    return null;
  }
}

// Dynamic CORS Header Builder
function getCorsHeaders(request) {
  const origin = request.headers.get("Origin");
  
  // List of approved development and production origins
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://vibeshot.studio",
    "https://vibeshot-creative-hub.pages.dev",
    "https://vibeshot-creative-hub.zakyjundana.workers.dev"
  ];
  
  let allowedOrigin = "*";
  if (origin) {
    const isAllowed = allowedOrigins.some(ao => origin === ao || origin.endsWith(ao.replace("https://", ".")));
    if (isAllowed) {
      allowedOrigin = origin;
    }
  }
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

async function getYouTubeTranscript(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

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
  let currentModel = targetModel || "fal-ai/flux/schnell";
  if (currentModel.includes("gemini")) {
    currentModel = "fal-ai/flux/schnell"; // Fallback for invalid image model option
  }
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
  } else if (currentModel.includes("recraft") || currentModel.includes("ideogram")) {
    payload.aspect_ratio = "9:16";
    if (currentModel.includes("recraft")) {
      payload.style = style === "animation" ? "digital_illustration" : "realistic_image";
    }
  } else if (currentModel.includes("openai")) {
    payload.size = "1024x1792";
  } else {
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
    const corsHeaders = getCorsHeaders(request);

    // OPTIONS preflight response for CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    const supabaseSecret = env.SUPABASE_JWT_SECRET;
    const geminiKey = env.GEMINI_API_KEY;
    const falKey = env.FAL_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Backend Environment Error: SUPABASE_URL or SUPABASE_ANON_KEY bindings missing" }), { status: 500, headers: corsHeaders });
    }

    // ========================================================
    // RUTE GET: Mengambil Brief berdasarkan UUID (Public read allowed)
    // ========================================================
    if (request.method === "GET") {
      try {
        const url = new URL(request.url);
        const briefId = url.searchParams.get("id");
        if (briefId) {
          // Hubungi Supabase REST API untuk mencocokkan UUID
          const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/briefs?id=eq.${briefId}`, {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}` // Lakukan query sebagai key anon (read policy akan melewatinya)
            }
          });
          if (!supabaseRes.ok) {
            const errText = await supabaseRes.text();
            throw new Error(`Supabase Retrieve Error: ${errText}`);
          }
          const briefs = await supabaseRes.json();
          if (briefs.length > 0) {
            return new Response(JSON.stringify(briefs[0]), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ error: "Brief not found" }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ status: "Online" }), { status: 200, headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // ========================================================
    // RUTE POST: Wajib Verifikasi JWT Supabase (Write operations)
    // ========================================================
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized: Missing Authorization Bearer token. Silakan login terlebih dahulu." }), { status: 401, headers: corsHeaders });
      }
      
      const token = authHeader.split(" ")[1];
      if (!supabaseSecret) {
        return new Response(JSON.stringify({ error: "Backend Binding Error: SUPABASE_JWT_SECRET is not configured on Cloudflare Workers" }), { status: 500, headers: corsHeaders });
      }
      
      const jwtPayload = await verifyJWT(token, supabaseSecret);
      if (!jwtPayload) {
        return new Response(JSON.stringify({ error: "Unauthorized: Sesi token Anda kedaluwarsa atau tidak valid. Silakan login ulang." }), { status: 401, headers: corsHeaders });
      }
      
      const userId = jwtPayload.sub; // Ambil UID pengguna Supabase yang terverifikasi secara aman

      const bodyData = await request.json();
      const { 
        product, usp, trend, tone, shotCount, platform, pillar, talent, 
        isContinuation, existingShots, masterIdentity, title, visual_style,
        refType, refUrl, refTextDescription, refImageBase64, action, engineMode,
        singleShotId, shotToGenerate, imageModel, briefId 
      } = bodyData;
      
      if (!geminiKey) return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500, headers: corsHeaders });

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const currentSecondsBase = Math.floor(Date.now() / 1000);
      const activeBriefId = briefId || bodyData.briefId;

      // ========================================================
      // FASE 2: RENDER SINGLE IMAGE (SUPABASE DATABASE INTERACTION)
      // ========================================================
      if (action === "render_single_image") {
        if (!shotToGenerate || !activeBriefId) {
          return new Response(JSON.stringify({ error: "Missing parameters: shotToGenerate or briefId" }), { status: 400, headers: corsHeaders });
        }
        
        // Ambil data brief dari Supabase
        const fetchRes = await fetch(`${supabaseUrl}/rest/v1/briefs?id=eq.${activeBriefId}`, {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${token}` // RLS akan membatasi agar hanya pemilik yang bisa melihat
          }
        });
        if (!fetchRes.ok) {
          const errText = await fetchRes.text();
          return new Response(JSON.stringify({ error: `Supabase retrieve failed: ${errText}` }), { status: fetchRes.status, headers: corsHeaders });
        }
        
        const briefs = await fetchRes.json();
        if (briefs.length === 0) return new Response(JSON.stringify({ error: "Brief data not found or unauthorized access" }), { status: 404, headers: corsHeaders });
        
        let briefData = briefs[0];
        
        let shotIndex = briefData.shotlist.findIndex(s => s.id === singleShotId);
        if (shotIndex === -1) {
          shotIndex = briefData.shotlist.findIndex(s => 
            (s.audio && s.audio === shotToGenerate.audio) || 
            (s.action && s.action === shotToGenerate.action) ||
            (s.imagePrompt && s.imagePrompt === shotToGenerate.imagePrompt)
          );
        }
        if (shotIndex === -1) shotIndex = 0;
        
        const currentStyle = visual_style || briefData.visual_style || "real-life";
        const targetPrompt = shotToGenerate.imagePrompt || shotToGenerate.action || "cinematic commercial scenario";
        const shotSeed = currentSecondsBase + shotIndex;

        const newImageUrl = await generateSingleFluxImage(targetPrompt, currentStyle, shotSeed, falKey, imageModel);
        
        briefData.shotlist[shotIndex].image = newImageUrl;
        briefData.shotlist[shotIndex].id = singleShotId;
        
        // Update data ke Supabase (PATCH)
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/briefs?id=eq.${activeBriefId}`, {
          method: "PATCH",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ shotlist: briefData.shotlist })
        });
        if (!updateRes.ok) {
          const errText = await updateRes.text();
          return new Response(JSON.stringify({ error: `Supabase update failed: ${errText}` }), { status: updateRes.status, headers: corsHeaders });
        }
        
        return new Response(JSON.stringify({ imageUrl: newImageUrl }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ========================================================
      // FASE 2: BULK MASSAL IMAGE RENDER (SUPABASE DATABASE INTERACTION)
      // ========================================================
      if (action === "render_images") {
        if (!activeBriefId) return new Response(JSON.stringify({ error: "Missing briefId" }), { status: 400, headers: corsHeaders });
        const incomingList = bodyData.shotlist || [];
        const processedList = await Promise.all(incomingList.map(async (shot, idx) => {
          const imageUrlMassal = await generateSingleFluxImage(shot.imagePrompt || shot.action, visual_style || "real-life", currentSecondsBase + idx, falKey, imageModel);
          return { ...shot, image: imageUrlMassal };
        }));
        
        let responsePayloadMassal = { 
          id: activeBriefId,
          user_id: userId,
          title: title || "Untitled Strategy Board", 
          premise: bodyData.premise || "", 
          visual_style: visualStyle || "real-life", 
          master_identity: masterIdentity || {}, 
          shotlist: processedList, 
          moodboard: processedList.map(shot => shot.image) 
        };
        
        // Simpan perbaruan ke Supabase (PATCH)
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/briefs?id=eq.${activeBriefId}`, {
          method: "PATCH",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            shotlist: responsePayloadMassal.shotlist, 
            moodboard: responsePayloadMassal.moodboard 
          })
        });
        if (!updateRes.ok) {
          const errText = await updateRes.text();
          return new Response(JSON.stringify({ error: `Supabase mass update failed: ${errText}` }), { status: updateRes.status, headers: corsHeaders });
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
      // BABAK 1: KILAT IMAGE TO TEXT DESCRIPTION (ReDoS-safe split parser)
      // ========================================================
      let imageToTextDescription = "";
      if (refType === "photo" && refImageBase64 && refImageBase64.startsWith("data:image/")) {
        const parts = refImageBase64.split(";base64,");
        if (parts.length === 2) {
          const mimeType = parts[0].replace("data:", "");
          const base64Data = parts[1];
          try {
            const descResponse = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: "Bedah ringkas gambar moodboard referensi ini. Tulis dalam 2 kalimat bahasa inggris tentang: core framing layout, visual composition, and pacing rhythm." },
                    { inlineData: { mimeType: mimeType, data: base64Data } }
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
      if (!geminiRawPayload.candidates || geminiRawPayload.candidates.length === 0) {
        throw new Error("Gemini did not return any candidates. The prompt may have triggered safety filters.");
      }
      let textContent = geminiRawPayload.candidates[0].content?.parts?.[0]?.text;
      if (!textContent) {
        throw new Error("Gemini returned an empty completion. Please check prompt content safety.");
      }
      
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

      // Simpan brief baru ke database Supabase
      const generatedIdMassal = crypto.randomUUID();
      let cloudDataPayloadMassal = { 
        id: generatedIdMassal,
        user_id: userId,
        title: aiJsonTextOnly.title || title || "Untitled Strategy Board",
        premise: aiJsonTextOnly.premise || "",
        visual_style: aiJsonTextOnly.visual_style || visual_style || "real-life",
        master_identity: aiJsonTextOnly.master_identity || {},
        shotlist: aiJsonTextOnly.shotlist,
        moodboard: aiJsonTextOnly.moodboard
      };
      
      if (isContinuation && existingShots && existingShots.length > 0) {
        cloudDataPayloadMassal.shotlist = [...existingShots, ...aiJsonTextOnly.shotlist];
        cloudDataPayloadMassal.id = activeBriefId; // Gunakan briefId yang sudah ada untuk kelanjutan
      }

      // Hubungi Supabase REST API (UPSERT)
      const saveRes = await fetch(`${supabaseUrl}/rest/v1/briefs`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge" // Lakukan UPSERT jika ID sudah ada
        },
        body: JSON.stringify(cloudDataPayloadMassal)
      });
      if (!saveRes.ok) {
        const errText = await saveRes.text();
        throw new Error(`Supabase save failed: ${errText}`);
      }

      aiJsonTextOnly.briefId = cloudDataPayloadMassal.id;
      return new Response(JSON.stringify(aiJsonTextOnly), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};
