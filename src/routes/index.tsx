import React, { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Sparkles, Image as ImageIcon, FileText, Loader2, Copy, ArrowDownRight, Link, Upload, Eye, EyeOff, LayoutGrid, Layers, Film, ArrowRight, X } from "lucide-react";
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

const translations = {
  id: {
    backToHome: "← Kembali ke Home",
    resetProject: "Reset Project",
    briefComposer: "Brief Composer (Peracik Konten)",
    paramUtama: "1. Parameter Utama Brief",
    namaBrand: "Nama Brand / Produk",
    ideKasar: "Ide Kasar / USP Utama Konten (Tumpahkan semua di sini)",
    placeholderIde: "Tulis plot kasar, poin jualan, atau arahan revisi reviewer agensi di sini...",
    arsitekturVibe: "2. Arsitektur & Vibe Konten",
    targetPlatform: "Target Platform Konten",
    pillarKonten: "Pillar / Kategori Konten",
    pillarOption1: "Hiburan / Komedi Skit / Entertainment",
    pillarOption2: "Hard Sell / Promosi Produk Langsung",
    pendekatanTalent: "Pendekatan Talent (Approach)",
    talentOption1: "Creator-Led (Talent bicara depan kamera)",
    talentOption2: "Voice Over Only (Potongan visual + VO narator)",
    moodTone: "Mood & Tone Konten (Gaya Penyampaian)",
    jumlahShot: "Jumlah Shot Awal Yang Diminta",
    refMultimodal: "3. Referensi Multimodal (Aset Tambahan)",
    tipeAset: "Tipe Aset Referensi",
    noRef: "Tanpa referensi (Andalkan Teks Murni)",
    uploadPhoto: "Upload Foto Moodboard / Screenshot",
    pasteLink: "Paste Link Video Referensi (TikTok/YouTube)",
    clickUpload: "Klik untuk pilih gambar/screenshot",
    payloadLocked: "✓ payload aset visual terkunci",
    pastePlaceholder: "Paste link video TikTok atau YouTube...",
    btnCompile: "Susun Brief Produksi PREMIUM ✨",
    btnCompiling: "Meracik Kombinasi AI...",
    specSheet: "Lembar Spesifikasi Produksi",
    papanStrategi: "Papan Strategi Konten",
    premisNaratif: "Premis Naratif Konsep (Alur Logika AI)",
    premisPlaceholder: "Hasil racikan narasi konsep komparasi teks & aset gambar akan mendarat di sini secara terstruktur.",
    panelKontinuitas: "Panel Kontinuitas Visual Storyboard (Master Frame 9:16)",
    garisWaktu: "Garis Waktu Shotlist Stack",
    salinTabel: "Salin Struktur Tabel (Buat Excel)",
    belumAda: "Belum ada runtutan adegan yang dieksekusi.",
    cameraSpecs: "Spesifikasi Kamera / Angle",
    locationEnv: "Lingkungan Adegan / Lokasi",
    visualScene: "Deskripsi Aksi Visual Adegan",
    audioScript: "Naskah Copywriting Audio (VO / Dialog / SFX)",
    btnExtend: "Lanjutkan Alur Cerita (Otomatis Bikin Shot 7-12)",
    btnExtending: "Melakukan Rantai Sambungan Adegan...",
    aiPromptLabel: "Master AI Image Prompt (Universal)",
  },
  en: {
    backToHome: "← Back to Home",
    resetProject: "Reset Workspace",
    briefComposer: "Brief Composer",
    paramUtama: "1. Core Brief Parameters",
    namaBrand: "Brand / Product Name",
    ideKasar: "Raw Idea / Main USP (Talk freely here)",
    placeholderIde: "Write rough plot, selling points, or reviewer feedback here...",
    arsitekturVibe: "2. Content Architecture",
    targetPlatform: "Target Platform",
    pillarKonten: "Content Pillar",
    pillarOption1: "Entertainment / Comedy Skit",
    pillarOption2: "Hard Sell / Direct Product Promotion",
    pendekatanTalent: "Talent Approach",
    talentOption1: "Creator-Led (Talent talking to camera)",
    talentOption2: "Voice Over Only (Visual clips + VO narrator)",
    moodTone: "Content Mood & Tone",
    jumlahShot: "Initial Shots Count",
    refMultimodal: "3. Multimodal References",
    tipeAset: "Reference Asset Type",
    noRef: "No reference (Text only)",
    uploadPhoto: "Upload Moodboard / Screenshot Photo",
    pasteLink: "Paste Reference Video Link (TikTok/YouTube)",
    clickUpload: "Click to select image/screenshot",
    payloadLocked: "✓ visual asset payload cached",
    pastePlaceholder: "Paste TikTok or YouTube video link...",
    btnCompile: "Compile Production Brief PREMIUM ✨",
    btnCompiling: "Compiling AI Engine...",
    specSheet: "Production Spec Sheet",
    papanStrategi: "Untitled Strategy Board",
    premisNaratif: "Concept Narrative Premise (AI Logic Flow)",
    premisPlaceholder: "The AI-generated concept narrative matching text and visual assets will land here structured.",
    panelKontinuitas: "Visual Storyboard Continuity Panel (Master Frame 9:16)",
    garisWaktu: "Storyboard Timeline Stack",
    salinTabel: "Copy Table Structure (For Excel)",
    belumAda: "No execution sequences generated yet.",
    cameraSpecs: "Camera Specs / Angle",
    locationEnv: "Scene Environment / Location",
    visualScene: "Visual Scene Action Description",
    audioScript: "Audio Copywriting Script (VO / Dialog / SFX)",
    btnExtend: "Extend Storyline Layout (Create Shots 7-12)",
    btnExtending: "Chaining Sequence Extensions...",
    aiPromptLabel: "Master AI Image Prompt (Universal)",
  }
};

function SimpleAIImage({ src, alt, className, onClick, index }: { src: string; alt: string; className: string; onClick?: () => void; index: number }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), index * 2000); 
    return () => clearTimeout(timer);
  }, [index, src]);

  return (
    <>
      {(!isLoaded && !hasError) && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 border border-dashed border-zinc-200 text-[10px] text-zinc-400 font-mono ${shouldLoad ? 'animate-pulse' : ''}`}>
          <span>{shouldLoad ? "rendering..." : `queue #${index + 1}`}</span>
        </div>
      )}
      {hasError && (
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 border border-dashed border-zinc-200 text-[9px] text-zinc-400 font-mono cursor-pointer hover:bg-zinc-100 transition-colors`}
          onClick={(e) => {
            e.stopPropagation();
            setHasError(false);
            setIsLoaded(false);
            setShouldLoad(false);
            setTimeout(() => setShouldLoad(true), 100);
          }}
        >
          <span className="text-orange-400 mb-1">timeout</span>
          <span className="underline">click to retry</span>
        </div>
      )}
      {shouldLoad && (
        <img 
          src={src} 
          alt={alt} 
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 ${onClick ? 'cursor-zoom-in hover:opacity-90' : ''}`}
          onLoad={() => setIsLoaded(true)} 
          onError={() => setHasError(true)} 
          loading="lazy" 
          onClick={onClick}
        />
      )}
    </>
  );
}

function VibeShotPlatform() {
  const [view, setView] = useState<"landing" | "app">("landing");
  const [lang, setLang] = useState<"id" | "en">("en");
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const browserLang = navigator.language || (navigator as any).userLanguage || "en";
      setLang(browserLang.startsWith("id") ? "id" : "en");
    } catch { setLang("en"); }

    try {
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
        setView("app");
      }
    } catch { localStorage.clear(); }
  }, []);

  const t = translations[lang] || translations["en"];

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
    setView("landing");
    toast.success(lang === "id" ? "Workspace dibersihkan." : "Workspace cleared.");
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setHasResult(false);

    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productName, usp, trend, tone, shotCount, platform, pillar, talent, refType, refUrl, refImageBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error compiling.");

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
      
      saveToLocalStorage(normalized, data.moodboard || [], data.premise, data.title);
      toast.success(lang === "id" ? "Brief berhasil diracik!" : "Brief successfully compiled!");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLanjutkanCerita = async () => {
    setIsContinuing(true);
    setErrorMsg(null);

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
      if (!res.ok) throw new Error(data?.error || "Error chaining.");

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
      const finalPremise = `${premiseOverride}\n\n[Continuous Sequence]:\n${data.premise}`;

      setShots(finalShots);
      setMoodboard(finalMood);
      setPremiseOverride(finalPremise);
      
      saveToLocalStorage(finalShots, finalMood, finalPremise, titleOverride);
      toast.success(lang === "id" ? "Alur berhasil disambung!" : "Timeline extended successfully!");
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
      toast.success(lang === "id" ? "Struktur tabel berhasil disalin!" : "Table layout copied!");
    } catch { toast.error("Copy failed."); }
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
            <button onClick={() => setView("app")} className="text-xs font-medium bg-zinc-950 text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors shadow-sm">Launch Studio →</button>
          </div>
        </nav>
        <header className="mx-auto max-w-3xl text-center px-6 pt-20 pb-16 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
            Turn messy script ideas into crystal-clear production briefs.
          </h1>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
            The automated workspace built for Creative Strategists and Agency Workers. Translate loose briefs and visual references into word-for-word scripts, moodboards, and interactive storyboards in 60 seconds.
          </p>
          <div className="pt-2">
            <button onClick={() => setView("app")} className="inline-flex items-center gap-2 bg-zinc-900 text-white font-medium text-xs px-5 py-3 rounded-lg shadow hover:bg-zinc-800 transition-all transform hover:-translate-y-0.5">
              Get Started for Free <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 antialiased selection:bg-zinc-200">
        <header className="flex items-center justify-between border-b border-zinc-200/80 bg-white px-6 py-2.5">
          <div className="flex items-center gap-2">
            <button onClick={() => setView("landing")} className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-white font-mono text-[10px] font-bold hover:bg-zinc-700 transition-colors">V</button>
            <span className="text-xs text-zinc-400 font-mono">/</span>
            <span className="text-xs font-medium tracking-tight text-zinc-800">vibeshot.studio/workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView("landing")} className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors">{t.backToHome}</button>
            {hasResult && <span className="text-zinc-200 font-mono text-xs">|</span>}
            {hasResult && <button onClick={handleClearAll} className="text-[11px] font-medium text-zinc-400 hover:text-red-500 transition-colors">{t.resetProject}</button>}
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-42px)] grid-cols-1 lg:grid-cols-[380px_1fr]">
          <aside className="border-r border-zinc-200/70 bg-white p-5 lg:sticky lg:top-[42px] lg:h-[calc(100vh-42px)] lg:overflow-y-auto space-y-4 shadow-sm">
            <div className="pb-2 border-b border-zinc-100">
              <h1 className="text-xs font-semibold tracking-tight uppercase text-zinc-400">{t.briefComposer}</h1>
            </div>

            <div className="rounded-lg border border-zinc-200/60 overflow-hidden bg-zinc-50/30">
              <button onClick={() => setOpenSection(openSection === "core" ? "none" : "core")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                <span className="flex items-center gap-2"><Film className="h-3.5 w-3.5 text-zinc-500" /> {t.paramUtama}</span>
                {openSection === "core" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}
              </button>
              {openSection === "core" && (
                <div className="p-4 space-y-4 bg-white">
                  <Field label={t.namaBrand}><input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Suzuki Carry, Wardah" className={inputStyle} /></Field>
                  <Field label={t.ideKasar}><textarea value={usp} onChange={(e) => setUsp(e.target.value)} rows={4} placeholder={t.placeholderIde} className={inputStyle + " resize-none"} /></Field>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-zinc-200/60 overflow-hidden bg-zinc-50/30">
              <button onClick={() => setOpenSection(openSection === "vibe" ? "none" : "vibe")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-zinc-500" /> {t.arsitekturVibe}</span>
              </button>
              {openSection === "vibe" && (
                <div className="p-4 space-y-4 bg-white">
                  <Field label={t.targetPlatform}>
                    <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputStyle + " bg-zinc-50/50"}>
                      <option value="TikTok">TikTok (Organic & Raw Concept)</option><option value="Instagram Reels">Instagram Reels (Aesthetic & Trendy)</option>
                    </select>
                  </Field>
                  <Field label={t.pillarKonten}>
                    <select value={pillar} onChange={(e) => setPillar(e.target.value)} className={inputStyle + " bg-zinc-50/50"}>
                      <option value="Hiburan / Entertainment">{t.pillarOption1}</option><option value="Hard Sell / Promosi Langsung">{t.pillarOption2}</option>
                    </select>
                  </Field>
                  <Field label={t.moodTone}><input value={tone} onChange={(e) => setTone(e.target.value)} className={inputStyle} /></Field>
                  <Field label={t.jumlahShot}><input type="number" min={1} max={12} value={shotCount} onChange={(e) => setShotCount(parseInt(e.target.value || "6", 10))} className={inputStyle + " w-24"} /></Field>
                </div>
              )}
            </div>

            <button onClick={handleGenerate} disabled={isGenerating || isContinuing} className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50">
              {isGenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.btnCompiling}</> : <><Sparkles className="h-3.5 w-3.5" /> {t.btnCompile}</>}
            </button>
          </aside>

          <main className="p-6 lg:p-10 overflow-y-auto max-h-[calc(100vh-42px)]">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="pb-4 border-b border-zinc-200/60">
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">{titleOverride || t.papanStrategi}</h2>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">{t.premisNaratif}</span>
                <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700 font-sans">{premiseOverride || t.premisPlaceholder}</p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">{t.panelKontinuitas}</span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {moodboardTiles.map((src, i) => (
                    <div key={i} className="group relative aspect-[9/16] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                      {src ? (
                        <SimpleAIImage src={src} index={i} alt={`Shot ${i+1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onClick={() => setPreviewImage(src)} />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-zinc-50 text-zinc-300"><ImageIcon className="h-4 w-4" /><span className="text-[9px] font-mono uppercase">Shot {i + 1}</span></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">{t.garisWaktu} ({shots.length} Sequence)</span>
                  {hasResult && <button onClick={handleCopyTable} className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-50 shadow-sm"><Copy className="h-3 w-3" /> {t.salinTabel}</button>}
                </div>

                {shots.length === 0 ? (
                  <div className="py-12 border border-dashed border-zinc-200 bg-white text-center rounded-xl text-xs text-zinc-400 font-mono">{t.belumAda}</div>
                ) : (
                  <div className="space-y-4">
                    {shots.map((s, idx) => (
                      <div key={s.id} className="group relative flex flex-col gap-4 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-zinc-300">
                        <div className="flex flex-col md:flex-row gap-5">
                          <div className="flex items-start gap-3 shrink-0">
                            <div className="text-xs font-mono font-semibold text-zinc-300 pt-1">{String(idx + 1).padStart(2, "0")}</div>
                            
                            <div className="relative aspect-[9/16] w-24 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 shrink-0 shadow-inner">
                              {s.image ? <SimpleAIImage src={s.image} index={idx} alt="Sequence" className="h-full w-full object-cover object-center cursor-zoom-in" onClick={() => setPreviewImage(s.image!)} /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400 font-mono">loading...</div>}
                            </div>
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2.5 border-r border-zinc-100/80 pr-2">
                              <div>
                                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block mb-0.5">{t.cameraSpecs}</span>
                                <input value={s.angle} onChange={(e) => updateShot(s.id, "angle", e.target.value)} className="w-full bg-zinc-50/50 rounded border border-transparent px-1.5 py-1 text-xs text-zinc-800 font-medium focus:border-zinc-200 focus:bg-white focus:outline-none" />
                              </div>
                              <div>
                                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block mb-0.5">{t.locationEnv}</span>
                                <input value={s.location} onChange={(e) => updateShot(s.id, "location", e.target.value)} className="w-full bg-zinc-50/50 rounded border border-transparent px-1.5 py-1 text-xs text-zinc-700 focus:border-zinc-200 focus:bg-white focus:outline-none" />
                              </div>
                            </div>

                            <div className="space-y-2.5">
                              <div>
                                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block mb-0.5">{t.visualScene}</span>
                                <textarea rows={2} value={s.action} onChange={(e) => updateShot(s.id, "action", e.target.value)} className="w-full bg-transparent rounded border border-transparent px-1 py-0.5 text-xs text-zinc-700 leading-relaxed resize-none focus:border-zinc-200 focus:bg-white focus:outline-none" />
                              </div>
                              <div>
                                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block mb-0.5">{t.audioScript}</span>
                                <textarea rows={2} value={s.audio} onChange={(e) => updateShot(s.id, "audio", e.target.value)} className="w-full bg-transparent rounded border border-transparent px-1 py-0.5 text-xs text-zinc-800 font-medium leading-relaxed resize-none focus:border-zinc-200 focus:bg-white focus:outline-none" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SECTION BARU: KOTAK AI PROMPT MASTER */}
                        <div className="mt-2 border-t border-dashed border-zinc-200 pt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-mono text-indigo-500 uppercase tracking-wider font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> {t.aiPromptLabel}</span>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(s.imagePrompt || ""); toast.success("Prompt disalin!"); }}
                              className="text-[9px] text-zinc-400 hover:text-indigo-500 flex items-center gap-1 font-mono transition-colors"
                            >
                              <Copy className="w-3 h-3" /> copy prompt
                            </button>
                          </div>
                          <textarea 
                            rows={2} 
                            value={s.imagePrompt} 
                            onChange={(e) => updateShot(s.id, "imagePrompt", e.target.value)} 
                            className="w-full bg-zinc-900 text-zinc-300 font-mono text-[10px] rounded-md border border-zinc-800 px-2.5 py-2 leading-relaxed resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all" 
                            placeholder="Prompt generator..."
                          />
                        </div>

                        <button onClick={() => removeShot(s.id)} className="absolute top-3 right-3 rounded p-1 text-zinc-300 opacity-0 transition hover:bg-zinc-50 hover:text-red-500 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-6 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img 
              src={previewImage} 
              alt="Preview Full Size" 
              className="h-full w-full object-contain rounded-lg shadow-2xl border border-white/10"
            />
            <button 
              className="absolute -top-4 -right-4 bg-white text-zinc-900 rounded-full p-1.5 shadow-lg hover:bg-zinc-200 transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
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
