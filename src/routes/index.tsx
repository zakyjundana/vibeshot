import React, { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Sparkles, Image as ImageIcon, FileText, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: VibeShotDashboard,
  head: () => ({
    meta: [
      { title: "VibeShot AI — Creative Strategist Dashboard" },
      {
        name: "description",
        content:
          "Generate TikTok production briefs in seconds. Content plans, moodboards, and editable shotlists for creative strategists.",
      },
    ],
  }),
});

type Tone = "Comedic" | "Emotional" | "Educational" | "Dramatic";

interface Shot {
  id: string;
  angle: string;
  location: string;
  action: string;
  audio: string;
  image?: string;
  imagePrompt?: string;
}

const PRESET_TONES = ["Comedic", "Emotional", "Educational", "Dramatic", "Gen-Z Sarcastic", "Luxury & Elegant"];

// KOMPONEN ESKALATOR ANTREAN VISUAL AI
function SafeAIImage({ src, alt, className, index = 0 }: { src: string; alt: string; className: string; index?: number }) {
  const [currentSrc, setCurrentSrc] = useState("");
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    setCurrentSrc("");
    setRetries(0);
    const timer = setTimeout(() => {
      setCurrentSrc(src);
    }, index * 1200); 
    return () => clearTimeout(timer);
  }, [src, index]);

  const handleError = () => {
    if (retries < 10) {
      setTimeout(() => {
        const separator = src.includes("?") ? "&" : "?";
        setCurrentSrc(`${src}${separator}retry=${retries}-${Date.now()}`);
        setRetries((prev) => prev + 1);
      }, 3000 + Math.random() * 2000);
    }
  };

  if (!currentSrc) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-[10px] text-slate-400 animate-pulse font-medium`}>
        <span>Queued...</span>
      </div>
    );
  }

  return <img src={currentSrc} alt={alt} className={className} onError={handleError} loading="lazy" />;
}

const seedShots = (n: number): Shot[] =>
  Array.from({ length: n }, (_, i) => ({
    id: crypto.randomUUID(),
    angle: i === 0 ? "Close-up" : i === 1 ? "Medium Shot" : "Wide Shot",
    location: i === 0 ? "Bedroom" : "Living Room",
    action: "",
    audio: "",
    image: "",
    imagePrompt: "",
  }));

function normalizeShots(raw: unknown): Shot[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((r: any) => ({
    id: crypto.randomUUID(),
    angle: String(r?.angle ?? r?.cameraAngle ?? r?.camera_angle ?? r?.["Camera Angle"] ?? ""),
    location: String(r?.location ?? r?.Location ?? ""),
    action: String(r?.action ?? r?.visual ?? r?.actionVisual ?? r?.["Action/Visual"] ?? r?.["Action / Visual"] ?? ""),
    audio: String(r?.audio ?? r?.vo ?? r?.audioVO ?? r?.["Audio/VO"] ?? r?.["Audio / VO"] ?? ""),
    image: String(r?.image ?? ""),
    imagePrompt: String(r?.imagePrompt ?? ""),
  }));
}

function normalizeMoodboard(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((r: any) => (typeof r === "string" ? r : r?.url ?? r?.image ?? r?.src ?? "")).filter(Boolean);
}

function VibeShotDashboard() {
  const workerUrl = DEFAULT_WORKER_URL;
  const [productName, setProductName] = useState("");
  const [usp, setUsp] = useState("");
  const [trend, setTrend] = useState("");
  const [tone, setTone] = useState("Comedic");
  const [platform, setPlatform] = useState("TikTok");
  const [pillar, setPillar] = useState("Hiburan / Entertainment");
  const [talent, setTalent] = useState("Creator-Led");
  const [shotCount, setShotCount] = useState(4);
  
  const [shots, setShots] = useState<Shot[]>(() => seedShots(4));
  const [moodboard, setMoodboard] = useState<string[]>([]);
  const [premiseOverride, setPremiseOverride] = useState<string | null>(null);
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);

  const title = useMemo(() => {
    if (titleOverride) return titleOverride;
    return productName.trim() ? `${productName.trim()} — ${trend || "Brief Video"}` : "Untitled Content Plan";
  }, [titleOverride, productName, trend]);

  const premise = useMemo(() => {
    if (premiseOverride) return premiseOverride;
    return "Premis kreatif buatan AI akan muncul di sini. Isi nama produk dan ide kasar kamu di panel kiri, lalu klik Generate untuk meracik ide menjadi cerita matang.";
  }, [premiseOverride]);

  const handleGenerate = async () => {
    if (!workerUrl.trim()) {
      setErrorMsg("Worker URL is required.");
      return;
    }
    setIsGenerating(true);
    setErrorMsg(null);

    const payload = {
      product: productName,
      usp,
      trend,
      tone,
      shotCount,
      platform,
      pillar,
      talent,
    };

    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const rawBody = await res.text();
      let parsedBody: any = null;
      try { parsedBody = rawBody ? JSON.parse(rawBody) : null; } catch {}

      if (!res.ok) {
        throw new Error(parsedBody?.error || rawBody || `${res.status} ${res.statusText}`);
      }

      const data: any = parsedBody ?? {};
      setShots(normalizeShots(data?.shotlist ?? data?.shots) ?? seedShots(shotCount));
      setMoodboard(normalizeMoodboard(data?.moodboard) ?? []);
      setPremiseOverride(data?.premise ?? null);
      setTitleOverride(data?.title ?? null);
      setHasResult(true);
      toast.success("Production brief generated!");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to generate brief.");
      toast.error(err?.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // PENGAMAN FINAL COPY TABEL UNTUK EXCEL / SLIDES
  const handleCopyTable = async () => {
    if (shots.length === 0) return;
    let htmlString = `<table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; width: 100%;">`;
    htmlString += `<tr style="background-color: #0f172a; color: #ffffff; font-weight: bold;">
                    <th style="padding: 8px;">#</th><th>Camera Angle</th><th>Location</th><th>Action / Visual</th><th>Audio / VO</th><th>AI Image Prompt</th>
                  </tr>`;
    shots.forEach((s, idx) => {
      htmlString += `<tr>
                      <td style="text-align: center; padding: 8px;">${idx + 1}</td>
                      <td>${s.angle}</td><td>${s.location}</td><td>${s.action}</td><td>${s.audio}</td>
                      <td style="font-style: italic; color: #64748b;">${s.imagePrompt || ""}</td>
                    </tr>`;
    });
    htmlString += `</table>`;

    try {
      const ClipboardItemObj = (window as any).ClipboardItem;
      if (ClipboardItemObj) {
        const blob = new Blob([htmlString], { type: "text/html" });
        await navigator.clipboard.write([new ClipboardItemObj({ "text/html": blob })]);
        toast.success("Tabel disalin! Buka Excel/Slides lalu tekan Ctrl+V.");
      } else {
        const textFallback = shots.map((s, i) => `${i+1}\t${s.angle}\t${s.location}\t${s.action}\t${s.audio}`).join("\n");
        await navigator.clipboard.writeText(textFallback);
        toast.success("Tabel disalin sebagai kolom teks! Buka Excel lalu tekan Ctrl+V.");
      }
    } catch { 
      toast.error("Gagal menyalin tabel."); 
    }
  };

  const updateShot = (id: string, key: keyof Omit<Shot, "id">, value: string) => {
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };
  const addShot = () => setShots((prev) => [...prev, { id: crypto.randomUUID(), angle: "", location: "", action: "", audio: "", image: "", imagePrompt: "" }]);
  const removeShot = (id: string) => setShots((prev) => prev.filter((s) => s.id !== id));
  const moodboardTiles = moodboard.length > 0 ? moodboard : [null, null, null, null];

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      <header className="flex items-center justify-between border-b border-hairline bg-white/80 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white"><Sparkles className="h-4 w-4" /></div>
          <span className="text-sm font-semibold tracking-tight">VibeShot AI</span>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-49px)] grid-cols-1 lg:grid-cols-[440px_1fr]">
        <aside className="border-r border-hairline bg-white p-6 lg:sticky lg:top-[49px] lg:h-[calc(100vh-49px)] lg:overflow-y-auto">
          <h1 className="text-base font-semibold tracking-tight">Brief Inputs & Strategy</h1>
          <p className="mt-1 text-xs text-muted-foreground">Tulis ide kasarmu, biarkan AI meracik seluruh strateginya.</p>

          <div className="mt-6 space-y-5">
            <Field label="Nama Produk / Brand">
              <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Contoh: Kopi Tuku, Lumio Glow Serum" className="input" />
            </Field>

            <Field label="Ide Kasar / USP Konten (User Bebas Curhat)">
              <textarea value={usp} onChange={(e) => setUsp(e.target.value)} rows={4} placeholder="Contoh: Bikin video jualan kopi susu tetangga tapi plot twist komedi atau edukasi tipis-tipis..." className="input resize-none" />
            </Field>

            <Field label="Target Platform">
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input bg-white">
                <option value="TikTok">TikTok (Organic & Raw)</option>
                <option value="Instagram Reels">Instagram Reels (Aesthetic & Curated)</option>
                <option value="YouTube Shorts">YouTube Shorts (Fast-paced & Punchy)</option>
              </select>
            </Field>

            <Field label="Content Pillar / Kategori">
              <select value={pillar} onChange={(e) => setPillar(e.target.value)} className="input bg-white">
                <option value="Edukasi / Tips & Tricks">Edukasi / Tips & Tricks</option>
                <option value="Hiburan / Entertainment">Hiburan / Entertainment</option>
                <option value="Hard Sell / Promosi Langsung">Hard Sell / Promosi Langsung</option>
                <option value="Behind the Scenes / Storytelling">Behind the Scenes / Storytelling</option>
              </select>
            </Field>

            <Field label="Talent Approach">
              <select value={talent} onChange={(e) => setTalent(e.target.value)} className="input bg-white">
                <option value="Creator-Led (Ada talent berbicara ke kamera)">Creator-Led (Ada talent berbicara)</option>
                <option value="Product-Only (Fokus b-roll produk estetik)">Product-Only (Aesthetic B-Roll Produk)</option>
                <option value="Voice Over Only (Kombinasi cuplikan + VO)">Voice Over Only (Kombinasi cuplikan + VO)</option>
              </select>
            </Field>

            <Field label="Gaya Tren Video (Opsional)">
              <input value={trend} onChange={(e) => setTrend(e.target.value)} placeholder="Contoh: POV Storytime, Day in the Life, Unboxing ASMR" className="input" />
            </Field>

            <Field label="Content Tone (Bisa Ketik / Pilih Preset)">
              <input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Ketik tone kustom brand di sini..." className="input mb-2" />
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TONES.map((t) => (
                  <button key={t} type="button" onClick={() => setTone(t)} className={`rounded bg-slate-100 px-2 py-1 text-[10px] font-medium transition hover:bg-slate-200 ${tone === t ? "bg-slate-800 text-white hover:bg-slate-800" : "text-slate-600"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Number of Shots">
              <input type="number" min={1} max={20} value={shotCount} onChange={(e) => setShotCount(parseInt(e.target.value || "1", 10))} className="input w-28" />
            </Field>

            <button onClick={handleGenerate} disabled={isGenerating} className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-accent-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-green-hover disabled:opacity-70">
              {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Meracik Strategi AI...</> : <><Sparkles className="h-4 w-4" /> Generate Production Brief</>}
            </button>

            {errorMsg && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{errorMsg}</p>}
          </div>
        </aside>

        <main className="bg-canvas p-6 lg:p-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground"><FileText className="h-3.5 w-3.5" /> Content Plan</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${hasResult ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${hasResult ? "bg-emerald-500" : "bg-amber-500"}`} /> {hasResult ? "Generated" : "Draft"}
              </span>
            </div>

            <section className="mt-6 rounded-xl border border-hairline bg-white p-5 shadow-card">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content Premise (AI Generation)</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{premise}</p>
            </section>

            <section className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visual Moodboard (Vertikal 9:16)</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {moodboardTiles.map((src, i) => (
                  <div key={i} className="group relative aspect-[9/16] overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
                    {src ? <SafeAIImage src={src} alt={`Moodboard ref ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" index={i} /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400"><ImageIcon className="h-5 w-5" /><span className="text-[10px] uppercase tracking-wider">Ref {i + 1}</span></div>}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interactive Shotlist</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleCopyTable} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 shadow-sm">
                    <Copy className="h-3.5 w-3.5" /> Copy for Excel/Slides
                  </button>
                  <button onClick={addShot} className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /> Add row</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="w-14 px-4 py-2.5 border-b border-hairline">#</th>
                      <th className="w-28 px-3 py-2.5 border-b border-hairline">Visual</th>
                      <th className="w-64 px-3 py-2.5 border-b border-hairline">AI Image Prompt Text</th>
                      <th className="w-40 px-3 py-2.5 border-b border-hairline">Camera Angle</th>
                      <th className="w-40 px-3 py-2.5 border-b border-hairline">Location</th>
                      <th className="px-3 py-2.5 border-b border-hairline">Action / Visual</th>
                      <th className="px-3 py-2.5 border-b border-hairline">Audio / VO</th>
                      <th className="w-10 px-2 py-2.5 border-b border-hairline" />
                    </tr>
                  </thead>
                  <tbody>
                    {shots.map((s, idx) => (
                      <tr key={s.id} className="group border-b border-hairline last:border-0 hover:bg-slate-50/60">
                        <td className="px-4 py-2 align-top text-xs font-mono font-medium text-slate-400">{String(idx + 1).padStart(2, "0")}</td>
                        <td className="px-3 py-2 align-top">
                          {s.image ? <SafeAIImage src={s.image} alt={`Shot ${idx + 1}`} className="h-14 w-24 rounded object-cover border border-hairline bg-slate-100 shadow-sm transition-transform duration-200 hover:scale-125 hover:z-10 cursor-zoom-in" index={idx + 4} /> : <div className="h-14 w-24 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">No Visual</div>}
                        </td>
                        <Cell value={s.imagePrompt || ""} placeholder="AI Image Prompt text..." onChange={(v) => updateShot(s.id, "imagePrompt", v)} />
                        <Cell value={s.angle} placeholder="Close-up" onChange={(v) => updateShot(s.id, "angle", v)} />
                        <Cell value={s.location} placeholder="Bedroom" onChange={(v) => updateShot(s.id, "location", v)} />
                        <Cell value={s.action} placeholder="Describe the visual…" onChange={(v) => updateShot(s.id, "action", v)} />
                        <Cell value={s.audio} placeholder="VO, SFX..." onChange={(v) => updateShot(s.id, "audio", v)} />
                        <td className="px-2 py-2 text-right align-top">
                          <button onClick={() => removeShot(s.id)} className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

// FIX: Menambahkan deklarasi tipe global React yang aman untuk kompilasi
function Cell({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <td className="px-3 py-1 align-top">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-slate-300 focus:bg-white focus:outline-none" />
    </td>
  );
}
