import React, { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Sparkles, Image as ImageIcon, FileText, Loader2, Copy, ArrowDownRight, Link, Upload, Eye, EyeOff, LayoutGrid, Layers, Film, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: VibeShotPlatform,
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
      <div className={`${className} flex flex-col items-center justify-center bg-zinc-50 border border-dashed border-zinc-200 text-[10px] text-zinc-400 font-mono`}>
        <span>antrean adegan #{globalIndex + 1}</span>
      </div>
    );
  }

  return <img src={currentSrc} alt={alt} className={className} onLoad={handleFinish} onError={handleFinish} loading="lazy" />;
}

function VibeShotPlatform() {
  const [view, setView] = useState<"landing" | "app">("landing");
  const workerUrl = "https://vibeshot-backend-ai.zakyjundana.workers.dev/";
  
  const [productName, setProductName] = useState("");
  const [usp, setUsp] = useState("");
  const [trend, setTrend] = useState("");
  const [tone, setTone] = useState("Comedic");
  const [platform, setPlatform] = useState("TikTok");
  const [pillar, setPillar] = useState("Hiburan / Entertainment");
  const [talent, setTalent] = useState("Creator-Led");
  const [shotCount, setShotCount] = useState(6);

  const [refType, setRefType] = useState<string>("none");
  const [refUrl, setRefUrl] = useState("");
  const [refImageBase64, setRefImageBase64] = useState("");
  const [openSection, setOpenSection] = useState<string>("core");

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
      setView("app");
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
    setView("landing");
    toast.success("Workspace berhasil dikosongkan.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setRefImageBase64(reader.result as string);
      toast.success("Gambar referensi terkunci di memori browser.");
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
        body: JSON.stringify({ product: productName, usp, trend, tone, shotCount, platform, pillar, talent, refType, refUrl, refImageBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal memproses brief.");

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
      toast.success("Brief cetak biru berhasil diracik!");
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
      if (!res.ok) throw new Error(data?.error || "Gagal menyambung alur.");

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
      const finalPremise = `${premiseOverride}\n\n[Kelanjutan Part 2 Continuous]:\n${data.premise}`;

      setShots(finalShots);
      setMoodboard(finalMood);
      setPremiseOverride(finalPremise);
      
      saveToLocalStorage(finalShots, finalMood, finalPremise, titleOverride);
      setActiveGlobalIndex(currentImagesCount);
      toast.success("Shot 7-12 berhasil disambung ke bawah.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsContinuing(false);
    }
  };

  const handleCopyTable = async () => {
    if (shots.length === 0) return;
    let htmlString = `<table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; width: 100%;">`;
    htmlString += `<tr style="background-color: #18181b; color: #ffffff; font-weight: bold;"><th>#</th><th>Camera Angle</th><th>Location</th><th>Action / Visual</th><th>Audio / VO</th></tr>`;
    shots.forEach((s, idx) => {
      htmlString += `<tr><td style="text-align: center; padding: 8px;">${idx + 1}</td><td>${s.angle}</td><td>${s.location}</td><td>${s.action}</td><td>${s.audio}</td></tr>`;
    });
    htmlString += `</table>`;
    try {
      const blob = new Blob([htmlString], { type: "text/html" });
      await navigator.clipboard.write([new ClipboardItem({ "text/html": blob })]);
      toast.success("Struktur tabel disalin! Siap dipaste ke Excel / Google Slides.");
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

  const inputStyle = "w-full rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none transition-colors";

  if (view === "landing") {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased selection:bg-zinc-100">
        <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-white font-mono text-[10px] font-bold">V</div>
            <span className="text-xs font-semibold tracking-tight text-zinc-800">vibeshot.studio</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView("app")} className="text-xs font-medium bg-zinc-950 text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors shadow-sm">Masuk Studio →</button>
          </div>
        </nav>

        <header className="mx-auto max-w-3xl text-center px-6 pt-20 pb-16 space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 border border-zinc-200/60 px-3 py-1 text-[11px] text-zinc-500 font-mono">
            <Sparkles className="h-3 w-3 text-zinc-400" /> Private Beta Engine v2.0 Aktif
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
            Ubah ide coretan kasar jadi brief produksi video sekelas agensi.
          </h1>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
            Workspace otomatis untuk Creative Strategist, Produser, dan Kreator Konten. Sulap input mentah dan link referensi menjadi skrip kata-demi-kata, moodboard, serta storyboard sinematik interaktif dalam 60 detik.
          </p>
          <div className="pt-2">
            <button onClick={() => setView("app")} className="inline-flex items-center gap-2 bg-zinc-900 text-white font-medium text-xs px-5 py-3 rounded-lg shadow hover:bg-zinc-800 transition-all transform hover:-translate-y-0.5">
              Mulai Meracik Gratis <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-6 pb-20">
          <div className="rounded-xl border border-zinc-200 bg-[#fafafa] p-4 shadow-xl relative overflow-hidden group">
            <div className="absolute top-2 left-4 flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 block" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] bg-white border border-zinc-200/80 rounded-lg overflow-hidden mt-4 min-h-[300px]">
              <div className="border-r border-zinc-100 p-3 bg-zinc-50/50 space-y-3 font-mono text-[9px] text-zinc-400">
                <div className="h-3 bg-zinc-200 rounded w-1/2" />
                <div className="h-14 bg-zinc-200/60 rounded border border-dashed border-zinc-300 flex items-center justify-center p-2 text-center text-zinc-400">"Suzuki Carry — Angkat keunggulan radius putar lincah di tikungan sempit..."</div>
                <div className="h-6 bg-zinc-950 rounded flex items-center justify-center text-white font-sans font-bold">Racik Brief Konten ✨</div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                  <div className="h-3 bg-zinc-300 rounded w-1/3" />
                  <div className="h-4 bg-zinc-100 rounded w-14" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-[9/16] rounded bg-zinc-50 border border-zinc-100 flex flex-col items-center justify-center p-2"><ImageIcon className="h-4 w-4 text-zinc-300 mb-1" /><span className="text-[7px] text-zinc-400 font-mono">storyboard 01</span></div>
                  <div className="aspect-[9/16] rounded bg-zinc-50 border border-zinc-100 flex flex-col items-center justify-center p-2"><ImageIcon className="h-4 w-4 text-zinc-300 mb-1" /><span className="text-[7px] text-zinc-400 font-mono">storyboard 02</span></div>
                  <div className="aspect-[9/16] rounded bg-zinc-50 border border-zinc-100 flex flex-col items-center justify-center p-2"><ImageIcon className="h-4 w-4 text-zinc-300 mb-1" /><span className="text-[7px] text-zinc-400 font-mono">storyboard 03</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 border-t border-b border-zinc-200/60 py-16 px-6">
          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="h-7 w-7 rounded bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-700 font-bold text-xs">01</div>
              <h3 className="text-xs font-semibold text-zinc-900 uppercase font-mono tracking-wider">Multimodal Sandbox</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">Masukkan link video TikTok/YouTube referensi kompetitor atau unggah screenshot moodboard mentah. AI membaca aset visual secara real-time.</p>
            </div>
            <div className="space-y-2">
              <div className="h-7 w-7 rounded bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-700 font-bold text-xs">02</div>
              <h3 className="text-xs font-semibold text-zinc-900 uppercase font-mono tracking-wider">Timeline Stacks Card</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">Lupakan baris tabel Excel horizontal yang memusingkan mata. Struktur adegan dibentuk vertikal berurutan layaknya layer timeline di CapCut.</p>
            </div>
            <div className="space-y-2">
              <div className="h-7 w-7 rounded bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-700 font-bold text-xs">03</div>
              <h3 className="text-xs font-semibold text-zinc-900 uppercase font-mono tracking-wider">Sequential Continuity</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">Takut batasan token macet tengah jalan? Struktur estafet pintar kami mengizinkan perluasan rantai adegan dari 6 shot awal menyambung ke shot 7-12 secara organik.</p>
            </div>
          </div>
        </section>

        <footer className="mx-auto max-w-5xl px-6 py-8 flex justify-between text-[11px] font-mono text-zinc-400">
          <span>© 2026 VibeShot AI. Hak Cipta Dilindungi.</span>
          <span>Zero Server Storage Architecture</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 antialiased selection:bg-zinc-200">
      <header className="flex items-center justify-between border-b border-zinc-200/80 bg-white px-6 py-2.5">
        <div className="flex items-center gap-2">
          <button onClick={() => setView("landing")} className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-white font-mono text-[10px] font-bold hover:bg-zinc-700 transition-colors">V</button>
          <span className="text-xs text-zinc-400 font-mono">/</span>
          <span className="text-xs font-medium tracking-tight text-zinc-800">vibeshot.studio/workspace</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setView("landing")} className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors">← Kembali ke Home</button>
          {hasResult && <span className="text-zinc-200 font-mono text-xs">|</span>}
          {hasResult && <button onClick={handleClearAll} className="text-[11px] font-medium text-zinc-400 hover:text-red-500 transition-colors">Reset Project</button>}
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-42px)] grid-cols-1 lg:grid-cols-[380px_1fr]">
        <aside className="border-r border-zinc-200/70 bg-white p-5 lg:sticky lg:top-[42px] lg:h-[calc(100vh-42px)] lg:overflow-y-auto space-y-4 shadow-sm">
          <div className="pb-2 border-b border-zinc-100">
            <h1 className="text-xs font-semibold tracking-tight uppercase text-zinc-400">Brief Composer (Peracik Konten)</h1>
          </div>

          <div className="rounded-lg border border-zinc-200/60 overflow-hidden bg-zinc-50/30">
            <button onClick={() => setOpenSection(openSection === "core" ? "none" : "core")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <span className="flex items-center gap-2"><Film className="h-3.5 w-3.5 text-zinc-500" /> 1. Parameter Utama Brief</span>
              {openSection === "core" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}
            </button>
            {openSection === "core" && (
              <div className="p-4 space-y-4 bg-white">
                <Field label="Nama Brand / Produk"><input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Contoh: Suzuki Carry, Wardah, Gojek" className={inputStyle} /></Field>
                <Field label="Ide Kasar / USP Utama Konten (Tumpahkan semua di sini)"><textarea value={usp} onChange={(e) => setUsp(e.target.value)} rows={4} placeholder="Tulis plot kasar, poin jualan, atau arahan revisi reviewer agensi di sini..." className={inputStyle + " resize-none"} /></Field>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-zinc-200/60 overflow-hidden bg-zinc-50/30">
            <button onClick={() => setOpenSection(openSection === "vibe" ? "none" : "vibe")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-zinc-500" /> 2. Arsitektur & Vibe Konten</span>
              {openSection === "vibe" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}
            </button>
            {openSection === "vibe" && (
              <div className="p-4 space-y-4 bg-white">
                <Field label="Target Platform Konten">
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputStyle + " bg-zinc-50/50"}>
                    <option value="TikTok">TikTok (Organic & Raw Concept)</option><option value="Instagram Reels">Instagram Reels (Aesthetic & Trendy)</option>
                  </select>
                </Field>
                <Field label="Pillar / Kategori Konten">
                  <select value={pillar} onChange={(e) => setPillar(e.target.value)} className={inputStyle + " bg-zinc-50/50"}>
                    <option value="Hiburan / Entertainment">Hiburan / Komedi Skit / Entertainment</option><option value="Hard Sell / Promosi Langsung">Hard Sell / Promosi Produk Langsung</option>
                  </select>
                </Field>
                <Field label="Pendekatan Talent (Approach)">
                  <select value={talent} onChange={(e) => setTalent(e.target.value)} className={inputStyle + " bg-zinc-50/50"}>
                    <option value="Creator-Led (Ada talent berbicara ke kamera)">Creator-Led (Talent bicara depan kamera)</option><option value="Voice Over Only (Kombinasi cuplikan + VO)">Voice Over Only (Potongan visual + VO narator)</option>
                  </select>
                </Field>
                <Field label="Mood & Tone Konten (Gaya Penyampaian)"><input value={tone} onChange={(e) => setTone(e.target.value)} className={inputStyle} /></Field>
                <Field label="Jumlah Shot Awal Yang Diminta"><input type="number" min={1} max={12} value={shotCount} onChange={(e) => setShotCount(parseInt(e.target.value || "6", 10))} className={inputStyle + " w-24"} /></Field>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-zinc-200/60 overflow-hidden bg-zinc-50/30">
            <button onClick={() => setOpenSection(openSection === "ref" ? "none" : "ref")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <span className="flex items-center gap-2"><LayoutGrid className="h-3.5 w-3.5 text-zinc-500" /> 3. Referensi Multimodal (Aset Tambahan)</span>
              {openSection === "ref" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}
            </button>
            {openSection === "ref" && (
              <div className="p-4 space-y-4 bg-white">
                <Field label="Tipe Aset Referensi">
                  <select value={refType} onChange={(e) => setRefType(e.target.value)} className={inputStyle + " bg-zinc-50/50"}>
                    <option value="none">Tanpa referensi (Andalkan Teks Murni)</option><option value="image">Upload Foto Moodboard / Screenshot</option><option value="url">Paste Link Video Referensi (TikTok/YouTube)</option>
                  </select>
                </Field>
                {refType === "image" && (
                  <div className="rounded-lg border border-dashed border-zinc-200 p-4 bg-zinc-50/50 text-center transition hover:bg-zinc-50">
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-zinc-500">
                      <Upload className="h-4 w-4 text-zinc-400" /><span className="text-xs">Klik untuk pilih gambar/screenshot</span><input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    {refImageBase64 && <p className="mt-2 text-[10px] text-emerald-600 font-mono">✓ payload aset visual terkunci</p>}
                  </div>
                )}
                {refType === "url" && (
                  <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50/30 px-3 py-2">
                    <Link className="h-3.5 w-3.5 text-zinc-400 shrink-0" /><input type="text" value={refUrl} onChange={(e) => setRefUrl(e.target.value)} placeholder="Paste link video TikTok atau YouTube..." className="w-full text-xs outline-none bg-transparent text-zinc-700" />
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={handleGenerate} disabled={isGenerating || isContinuing} className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50">
            {isGenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Meracik Kombinasi AI...</> : <><Sparkles className="h-3.5 w-3.5" /> Susun Cetak Biru Brief Produksi</>}
          </button>
          {errorMsg && <p className="text-[11px] text-red-600 bg-red-50/80 p-2.5 rounded border border-red-100">{errorMsg}</p>}
        </aside>

        <main className="p-6 lg:p-10 overflow-y-auto max-h-[calc(100vh-42px)]">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="pb-4 border-b border-zinc-200/60">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400"><FileText className="h-3.5 w-3.5" /> Lembar Spesifikasi Produksi</div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">{titleOverride || "Papan Strategi Konten"}</h2>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Premis Naratif Konsep (Alur Logika AI)</span>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700 font-sans">{premiseOverride || "Hasil racikan narasi konsep komparasi teks & aset gambar akan mendarat di sini secara terstruktur."}</p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Panel Kontinuitas Visual Storyboard (Master Frame 9:16)</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {moodboardTiles.map((src, i) => (
                  <div key={i} className="group relative aspect-[9/16] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                    {src ? (
                      <SafeAIImage src={src} alt={`Storyboard Shot ${i+1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" globalIndex={i} activeGlobalIndex={activeGlobalIndex} onNextQueue={() => setActiveGlobalIndex(p => p + 1)} />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-zinc-50 text-zinc-300"><ImageIcon className="h-4 w-4" /><span className="text-[9px] font-mono uppercase">Shot {i + 1}</span></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Garis Waktu Shotlist Stack ({shots.length} Sequence)</span>
                {hasResult && <button onClick={handleCopyTable} className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-50 shadow-sm"><Copy className="h-3 w-3" /> Salin Struktur Tabel (Buat Excel)</button>}
              </div>

              {shots.length === 0 ? (
                <div className="py-12 border border-dashed border-zinc-200 bg-white text-center rounded-xl text-xs text-zinc-400 font-mono">Belum ada runtutan adegan yang dieksekusi.</div>
              ) : (
                <div className="space-y-4">
                  {shots.map((s, idx) => (
                    <div key={s.id} className="group relative flex flex-col md:flex-row gap-5 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-zinc-300">
                      <div className="flex items-start gap-3 shrink-0">
                        <div className="text-xs font-mono font-semibold text-zinc-300 pt-1">{String(idx + 1).padStart(2, "0")}</div>
                        <div className="relative aspect-[16/9] w-full md:w-36 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 shrink-0 shadow-inner">
                          {s.image ? <SafeAIImage src={s.image} alt="Visual sequence" className="h-full w-full object-cover object-center cursor-zoom-in" globalIndex={idx + moodboard.length} activeGlobalIndex={activeGlobalIndex} onNextQueue={() => setActiveGlobalIndex(p => p + 1)} /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400 font-mono">loading block</div>}
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2.5 border-r border-zinc-100/80 pr-2">
                          <div>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block mb-0.5">Spesifikasi Kamera / Angle</span>
                            <input value={s.angle} onChange={(e) => updateShot(s.id, "angle", e.target.value)} className="w-full bg-zinc-50/50 rounded border border-transparent px-1.5 py-1 text-xs text-zinc-800 font-medium focus:border-zinc-200 focus:bg-white focus:outline-none" />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block mb-0.5">Lingkungan Adegan / Lokasi</span>
                            <input value={s.location} onChange={(e) => updateShot(s.id, "location", e.target.value)} className="w-full bg-zinc-50/50 rounded border border-transparent px-1.5 py-1 text-xs text-zinc-700 focus:border-zinc-200 focus:bg-white focus:outline-none" />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block mb-0.5">Deskripsi Aksi Visual Adegan</span>
                            <textarea rows={2} value={s.action} onChange={(e) => updateShot(s.id, "action", e.target.value)} className="w-full bg-transparent rounded border border-transparent px-1 py-0.5 text-xs text-zinc-700 leading-relaxed resize-none focus:border-zinc-200 focus:bg-white focus:outline-none" />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block mb-0.5">Naskah Copywriting Audio (VO / Dialog / SFX)</span>
                            <textarea rows={2} value={s.audio} onChange={(e) => updateShot(s.id, "audio", e.target.value)} className="w-full bg-transparent rounded border border-transparent px-1 py-0.5 text-xs text-zinc-800 font-medium leading-relaxed resize-none focus:border-zinc-200 focus:bg-white focus:outline-none" />
                          </div>
                        </div>
                      </div>

                      <button onClick={() => removeShot(s.id)} className="absolute top-3 right-3 rounded p-1 text-zinc-300 opacity-0 transition hover:bg-zinc-50 hover:text-red-500 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}

              {hasResult && shots.length < 12 && (
                <div className="pt-2 text-center">
                  <button onClick={handleLanjutkanCerita} disabled={isContinuing} className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50">
                    {isContinuing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Melakukan Rantai Sambungan Adegan...</> : <><ArrowDownRight className="h-3.5 w-3.5" /> Lanjutkan Alur Cerita (Otomatis Bikin Shot 7-12)</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
}
