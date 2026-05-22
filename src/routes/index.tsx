import React, { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Sparkles, Image as ImageIcon, FileText, Loader2, Copy, ArrowDownRight, Link, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: VibeShotDashboard,
});

interface Shot {
  id: string;
  angle: string;
  location: string;
  action: string;
  audio: string;
  image?: string;
  imagePrompt?: string;
}

function SafeAIImage({ src, alt, className, globalIndex, activeGlobalIndex, onNextQueue }: { src: string; alt: string; className: string; globalIndex: number; activeGlobalIndex: number; onNextQueue: () => void; }) {
  const [currentSrc, setCurrentSrc] = useState("");
  const [hasTriggeredNext, setHasTriggeredNext] = useState(false);

  useEffect(() => {
    if (globalIndex === activeGlobalIndex && !currentSrc) {
      setCurrentSrc(src);
    }
  }, [globalIndex, activeGlobalIndex, src, currentSrc]);

  const handleFinish = () => {
    if (!hasTriggeredNext) {
      setHasTriggeredNext(true);
      onNextQueue();
    }
  };

  if (globalIndex > activeGlobalIndex || !currentSrc) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-[10px] text-slate-400 font-medium`}>
        <span>Antrean #{globalIndex + 1}</span>
      </div>
    );
  }

  return <img src={currentSrc} alt={alt} className={className} onLoad={handleFinish} onError={handleFinish} loading="lazy" />;
}

function VibeShotDashboard() {
  const workerUrl = "https://vibeshot-backend-ai.zakyjundana.workers.dev/";
  
  const [productName, setProductName] = useState("");
  const [usp, setUsp] = useState("");
  const [trend, setTrend] = useState("");
  const [tone, setTone] = useState("Comedic");
  const [platform, setPlatform] = useState("TikTok");
  const [pillar, setPillar] = useState("Hiburan / Entertainment");
  const [talent, setTalent] = useState("Creator-Led");
  const [shotCount, setShotCount] = useState(6);

  // NEW MULTIMODAL STATE FOR MVP
  const [refType, setRefType] = useState<"none" | "image" | "url">("none");
  const [refUrl, setRefUrl] = useState("");
  const [refImageBase64, setRefImageBase64] = useState("");
  
  const [shots, setShots] = useState<Shot[]>([]);
  const [moodboard, setMoodboard] = useState<string[]>([]);
  const [premiseOverride, setPremiseOverride] = useState<string | null>(null);
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [activeGlobalIndex, setActiveGlobalIndex] = useState(-1);

  useEffect(() => {
    const savedShots = localStorage.getItem("vibeshot_shots");
    const savedMoodboard = localStorage.getItem("vibeshot_moodboard");
    const savedPremise = localStorage.getItem("vibeshot_premise");
    const savedTitle = localStorage.getItem("vibeshot_title");

    if (savedShots && savedMoodboard) {
      setShots(JSON.parse(savedShots));
      setMoodboard(JSON.parse(savedMoodboard));
      setPremiseOverride(savedPremise);
      setTitleOverride(savedTitle);
      setHasResult(true);
      setActiveGlobalIndex(0);
    }
  }, []);

  const saveToLocalStorage = (newShots: Shot[], newMood: string[], newPremise: string | null, newTitle: string | null) => {
    localStorage.setItem("vibeshot_shots", JSON.stringify(newShots));
    localStorage.setItem("vibeshot_moodboard", JSON.stringify(newMood));
    if (newPremise) localStorage.setItem("vibeshot_premise", newPremise);
    if (newTitle) localStorage.setItem("vibeshot_title", newTitle);
  };

  const handleClearAll = () => {
    localStorage.clear();
    setShots([]);
    setMoodboard([]);
    setPremiseOverride(null);
    setTitleOverride(null);
    setHasResult(false);
    setRefType("none");
    setRefUrl("");
    setRefImageBase64("");
    setActiveGlobalIndex(-1);
    toast.success("Data demo di-reset bersih!");
  };

  // FUNGSI SULAP MERUBAH GAMBAR JADI TEKS BASE64 NUMPANG LEWAT
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("File terlalu besar! Maksimal gambar 4MB biar kencang.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRefImageBase64(reader.result as string);
      toast.success("Gambar referensi terkunci di memori browser!");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setHasResult(false);
    setActiveGlobalIndex(-1);

    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          product: productName, usp, trend, tone, shotCount, platform, pillar, talent,
          refType, refUrl, refImageBase64 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal meracik strategi.");

      const normalized = (data.shotlist || []).map((r: any) => ({
        id: crypto.randomUUID(),
        angle: String(r?.angle || ""),
        location: String(r?.location || ""),
        action: String(r?.action || ""),
        audio: String(r?.audio || ""),
        image: String(r?.image || ""),
        imagePrompt: String(r?.imagePrompt || ""),
      }));

      setShots(normalized);
      setMoodboard(data.moodboard || []);
      setPremiseOverride(data.premise);
      setTitleOverride(data.title);
      setHasResult(true);
      setActiveGlobalIndex(0);
      
      saveToLocalStorage(normalized, data.moodboard || [], data.premise, data.title);
      toast.success("Brief Multimodal Berhasil Diproses!");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLanjutkanCerita = async () => {
    setIsContinuing(true);
    setErrorMsg(null);
    const currentImagesCount = moodboard.length + shots.length;

    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: productName, usp, trend, tone, shotCount: 6, platform, pillar, talent,
          isContinuation: true,
          existingShots: shots,
          refType, refUrl, refImageBase64
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal menyambung");

      const normalizedNewShots = (data.shotlist || []).map((r: any) => ({
        id: crypto.randomUUID(),
        angle: String(r?.angle || ""),
        location: String(r?.location || ""),
        action: String(r?.action || ""),
        audio: String(r?.audio || ""),
        image: String(r?.image || ""),
        imagePrompt: String(r?.imagePrompt || ""),
      }));

      const finalShots = [...shots, ...normalizedNewShots];
      const finalMood = [...moodboard, ...(data.moodboard || [])];
      const finalPremise = `${premiseOverride}\n\n[Kelanjutan Part 2]:\n${data.premise}`;

      setShots(finalShots);
      setMoodboard(finalMood);
      setPremiseOverride(finalPremise);
      
      saveToLocalStorage(finalShots, finalMood, finalPremise, titleOverride);
      setActiveGlobalIndex(currentImagesCount);
      toast.success("Cerita Berhasil Disambung!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsContinuing(false);
    }
  };

  const handleCopyTable = async () => {
    if (shots.length === 0) return;
    let htmlString = `<table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; width: 100%;">`;
    htmlString += `<tr style="background-color: #0f172a; color: #ffffff; font-weight: bold;"><th>#</th><th>Camera Angle</th><th>Location</th><th>Action / Visual</th><th>Audio / VO</th></tr>`;
    shots.forEach((s, idx) => {
      htmlString += `<tr><td style="text-align: center; padding: 8px;">${idx + 1}</td><td>${s.angle}</td><td>${s.location}</td><td>${s.action}</td><td>${s.audio}</td></tr>`;
    });
    htmlString += `</table>`;
    try {
      const blob = new Blob([htmlString], { type: "text/html" });
      await navigator.clipboard.write([new ClipboardItem({ "text/html": blob })]);
      toast.success("Tabel Berhasil Disalin!");
    } catch { toast.error("Gagal menyalin."); }
  };

  const updateShot = (id: string, key: keyof Omit<Shot, "id">, value: string) => {
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };
  const removeShot = (id: string) => setShots((prev) => prev.filter((s) => s.id !== id));

  const moodboardTiles = useMemo(() => {
    if (moodboard.length > 0) return moodboard;
    return Array.from({ length: shotCount }).map(() => null);
  }, [moodboard, shotCount]);

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      <header className="flex items-center justify-between border-b border-hairline bg-white/80 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white"><Sparkles className="h-4 w-4" /></div>
          <span className="text-sm font-semibold tracking-tight">VibeShot AI — Studio Multimodal</span>
        </div>
        {hasResult && <button onClick={handleClearAll} className="text-xs font-medium text-red-500 hover:underline">Reset Demo Board</button>}
      </header>

      <div className="grid min-h-[calc(100vh-49px)] grid-cols-1 lg:grid-cols-[440px_1fr]">
        <aside className="border-r border-hairline bg-white p-6 lg:sticky lg:top-[49px] lg:h-[calc(100vh-49px)] lg:overflow-y-auto">
          <h1 className="text-base font-semibold tracking-tight">Brief Inputs & Strategy</h1>
          <p className="mt-1 text-xs text-muted-foreground">Kombinasikan teks dan referensi gambar/link.</p>

          <div className="mt-6 space-y-5">
            <Field label="Nama Produk / Brand"><input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Contoh: Suzuki Carry" className="input" /></Field>
            <Field label="Ide Kasar / USP Konten"><textarea value={usp} onChange={(e) => setUsp(e.target.value)} rows={4} placeholder="Tulis ide ceritanya di sini..." className="input resize-none" /></Field>
            
            {/* MENU BARU: DROPDOWN SELEKSI REFERENSI VISUAL MULTIMODAL */}
            <Field label="Tambahkan Referensi Kreatif (Pilihan Anak Agensi)">
              <select value={refType} onChange={(e) => setRefType(e.target.value as any)} className="input bg-white mb-2">
                <option value="none">Tanpa Referensi (Teks Saja)</option>
                <option value="image">Upload Foto Referensi / Moodboard</option>
                <option value="url">Paste Link URL (TikTok / YouTube / Pinterest)</option>
              </select>

              {refType === "image" && (
                <div className="mt-2 rounded-lg border border-dashed border-slate-300 p-3 bg-slate-50 text-center">
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-500">
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-medium">Klik untuk Pilih Gambar</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {refImageBase64 && <p className="mt-1.5 text-[10px] text-accent-green font-semibold">✓ Gambar Siap Dikirim (Numpang Lewat)</p>}
                </div>
              )}

              {refType === "url" && (
                <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
                  <Link className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <input type="text" value={refUrl} onChange={(e) => setRefUrl(e.target.value)} placeholder="Paste link video/foto di sini..." className="w-full text-xs outline-none bg-transparent" />
                </div>
              )}
            </Field>

            <Field label="Target Platform">
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input bg-white">
                <option value="TikTok">TikTok (Organic)</option><option value="Instagram Reels">Instagram Reels</option>
              </select>
            </Field>
            <Field label="Content Tone"><input value={tone} onChange={(e) => setTone(e.target.value)} className="input" /></Field>

            <button onClick={handleGenerate} disabled={isGenerating || isContinuing} className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-accent-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-green-hover disabled:opacity-70">
              {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Menganalisis Aset & Teks...</> : <><Sparkles className="h-4 w-4" /> Generate 6 Shot Awal</>}
            </button>
            {errorMsg && <p className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">{errorMsg}</p>}
          </div>
        </aside>

        <main className="bg-canvas p-6 lg:p-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{titleOverride || "Untitled Content Plan"}</h2>

            <section className="mt-6 rounded-xl border border-hairline bg-white p-5 shadow-card">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content Premise</h3>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{premiseOverride || "Hasil ramuan AI komparasi teks & aset gambar akan mendarat di sini."}</p>
            </section>

            <section className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visual Moodboard ({moodboard.length} References)</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {moodboardTiles.map((src, i) => (
                  <div key={i} className="group relative aspect-[9/16] overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
                    {src ? <SafeAIImage src={src} alt="Mood" className="absolute inset-0 h-full w-full object-cover" globalIndex={i} activeGlobalIndex={activeGlobalIndex} onNextQueue={() => setActiveGlobalIndex(p => p + 1)} /> : <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">Ref {i + 1}</div>}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interactive Shotlist ({shots.length} Shots)</h3>
                {hasResult && <button onClick={handleCopyTable} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm"><Copy className="h-3.5 w-3.5" /> Copy for Excel</button>}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="w-14 px-4 py-2.5">#</th><th className="w-28 px-3 py-2.5">Visual</th><th className="w-40 px-3 py-2.5">Camera Angle</th><th className="w-40 px-3 py-2.5">Location</th><th className="px-3 py-2.5">Action / Visual</th><th className="px-3 py-2.5">Script / Audio (VO)</th><th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {shots.map((s, idx) => (
                      <tr key={s.id} className="group border-b border-hairline last:border-0 hover:bg-slate-50/60">
                        <td className="px-4 py-2 align-top text-xs font-mono font-medium text-slate-400">{String(idx + 1).padStart(2, "0")}</td>
                        <td className="px-3 py-2 align-top">
                          {s.image ? <SafeAIImage src={s.image} alt="Visual" className="h-14 w-24 rounded object-cover border" globalIndex={idx + moodboard.length} activeGlobalIndex={activeGlobalIndex} onNextQueue={() => setActiveGlobalIndex(p => p + 1)} /> : <div className="h-14 w-24 rounded border border-dashed flex items-center justify-center text-[10px] text-slate-400">Loading</div>}
                        </td>
                        <Cell value={s.angle} placeholder="Angle" onChange={(v) => updateShot(s.id, "angle", v)} />
                        <Cell value={s.location} placeholder="Location" onChange={(v) => updateShot(s.id, "location", v)} />
                        <Cell value={s.action} placeholder="Visual" onChange={(v) => updateShot(s.id, "action", v)} />
                        <Cell value={s.audio} placeholder="Audio" onChange={(v) => updateShot(s.id, "audio", v)} />
                        <td className="px-2 py-2"><button onClick={() => removeShot(s.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hasResult && shots.length < 12 && (
                <div className="bg-slate-50 p-4 border-t border-hairline text-center">
                  <button onClick={handleLanjutkanCerita} disabled={isContinuing} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-50">
                    {isContinuing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Menganalisis Aset & Menyambung Cerita...</> : <><ArrowDownRight className="h-3.5 w-3.5" /> ➕ Lanjutkan Cerita (Bikin Shot 7-12)</>}
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>{children}</label>;
}

function Cell({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <td className="px-3 py-1 align-top">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-700 focus:border-slate-300 focus:bg-white focus:outline-none" />
    </td>
  );
}
