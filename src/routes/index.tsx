import React, { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Sparkles, Image as ImageIcon, FileText, Loader2, Copy, ArrowDownRight, Link as LinkIcon, Upload, Eye, EyeOff, Layers, Film, ArrowRight, X, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: VibeShotPlatform,
});

interface Shot {
  id: string;
  angle: string;
  location: string;
  tech_budget_hack?: string;
  action: string;
  audio: string;
  image?: string;
  imagePrompt?: string;
}

const translations = {
  id: {
    backToHome: "← Kembali ke Home",
    resetProject: "Reset Project",
    briefComposer: "Production Engine Room 🛠️",
    selectMode: "Pilih Mode Amunisi AI",
    modeHybrid: "Hybrid Strategist",
    modeHybridDesc: "Gabung Brand/USP manual dengan alur video referensi",
    modeClone: "Instant Clone Engine",
    modeCloneDesc: "Hanya tempel link / upload media, AI auto-buat brief & transkrip",
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
    refMultimodal: "3. Referensi Alur & Visual (Multimodal)",
    tipeAset: "Tipe Aset Referensi",
    noRef: "Tanpa referensi (Andalkan Teks Murni)",
    uploadPhoto: "Upload Foto Moodboard / Screenshot",
    pasteLink: "Paste Link Video Referensi (TikTok/YouTube)",
    clickUpload: "Klik untuk pilih gambar/screenshot/video",
    payloadLocked: "✓ payload aset visual terkunci",
    pastePlaceholder: "Paste link video TikTok atau YouTube di sini untuk direplikasi...",
    btnCompile: "Eksekusi Cetak Biru Konten 🚀",
    btnCompiling: "Membongkar Referensi & Meracik AI...",
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
    btnExtend: "Lanjutkan Alur Cerita",
    btnExtending: "Melakukan Rantai Sambungan Adegan...",
    aiPromptLabel: "Master AI Image Prompt (Universal)",
    btnShare: "Bagikan Link Brief 🔗",
    shareSuccess: "Link brief berhasil disalin ke clipboard!",
    btnRenderVisual: "Fase 2: Hasilkan Frame Storyboard Visual 🎬",
    btnRenderingVisual: "Mengerjakan Render Gambar FLUX Dev..."
  },
  en: {
    backToHome: "← Back to Home",
    resetProject: "Reset Workspace",
    briefComposer: "Production Engine Room 🛠️",
    selectMode: "Select AI Engine Mode",
    modeHybrid: "Hybrid Strategist",
    modeHybridDesc: "Blend manual Brand/USP with a reference video's pacing",
    modeClone: "Instant Clone Engine",
    modeCloneDesc: "Drop URL / media file, AI auto-creates script & breakdown",
    paramUtama: "1. Core Brief Parameters",
    namaBrand: "Brand / Product Name",
    ideKasar: "Raw Idea / Main USP (Talk freely here)",
    placeholderIde: "Write rough plot, selling points, or reviewer feedback here...",
    arsitekturVibe: "2. Content Architecture",
    targetPlatform: "Target Platform",
    pillarKonten: "Content Pillar",
    pillarOption1: "Entertainment / Comedy Skit",
    pillarOption2: "Hard Sell / Direct Product Promotion",
    talentApproach: "Talent Approach",
    talentOption1: "Creator-Led (Talent talking to camera)",
    talentOption2: "Voice Over Only (Visual clips + VO narrator)",
    moodTone: "Content Mood & Tone",
    jumlahShot: "Initial Shots Count",
    refMultimodal: "3. Flow & Visual References (Multimodal)",
    tipeAset: "Reference Asset Type",
    noRef: "No reference (Text only)",
    uploadPhoto: "Upload Moodboard / Screenshot Photo",
    pasteLink: "Paste Reference Video Link (TikTok/YouTube)",
    clickUpload: "Click to select image/screenshot/video",
    payloadLocked: "✓ visual asset payload cached",
    pastePlaceholder: "Paste TikTok or YouTube link here to replicate scene structure...",
    btnCompile: "Execute Production Blueprint 🚀",
    btnCompiling: "Dissecting References & Compiling AI...",
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
    btnExtend: "Extend Storyline Layout",
    btnExtending: "Chaining Sequence Extensions...",
    aiPromptLabel: "Master AI Image Prompt (Universal)",
    btnShare: "Share Brief Link 🔗",
    shareSuccess: "Brief link copied to clipboard!",
    btnRenderVisual: "Phase 2: Generate Visual Storyboard Frames 🎬",
    btnRenderingVisual: "Rendering frames via FLUX Dev..."
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

  if (!src) return null;

  return (
    <>
      {(!isLoaded && !hasError) && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800 border border-dashed border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-400 font-mono ${shouldLoad ? 'animate-pulse' : ''}`}>
          <span>{shouldLoad ? "rendering..." : `queue #${index + 1}`}</span>
        </div>
      )}
      {hasError && (
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800 border border-dashed border-zinc-200 dark:border-zinc-700 text-[9px] text-zinc-400 font-mono cursor-pointer hover:bg-zinc-100 transition-colors`}
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

function CustomSwitch({ isOn, onToggle, labelOff, labelOn, IconOff, IconOn }: any) {
  return (
    <div onClick={onToggle} className="flex items-center gap-2 cursor-pointer select-none group p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all duration-150">
      {labelOff || IconOff ? (
        <span className={`text-[10px] font-mono font-bold tracking-wider transition-all duration-200 ${!isOn ? 'text-zinc-900 dark:text-zinc-100 scale-105' : 'text-zinc-400 dark:text-zinc-600'}`}>
          {IconOff ? <IconOff className="w-3.5 h-3.5" /> : labelOff}
        </span>
      ) : null}
      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${isOn ? 'bg-zinc-900 dark:bg-zinc-100 border border-zinc-800 dark:border-zinc-300' : 'bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700'}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-300 shadow-sm ${isOn ? 'translate-x-4 bg-white dark:bg-zinc-900' : 'translate-x-0.5 bg-zinc-600 dark:bg-zinc-400'}`} />
      </div>
      {labelOn || IconOn ? (
        <span className={`text-[10px] font-mono font-bold tracking-wider transition-all duration-200 ${isOn ? 'text-zinc-900 dark:text-zinc-100 scale-105' : 'text-zinc-400 dark:text-zinc-600'}`}>
          {IconOn ? <IconOn className="w-3.5 h-3.5" /> : labelOn}
        </span>
      ) : null}
    </div>
  );
}

function VibeShotPlatform() {
  const [view, setView] = useState<"landing" | "app">("landing");
  const [lang, setLang] = useState<"id" | "en">("en");
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [activeEngine, setActiveEngine] = useState<"hybrid" | "clone">("hybrid"); 
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
  const [visualStyle, setVisualStyle] = useState<string>("real-life");
  const [masterIdentity, setMasterIdentity] = useState<{talent?: string, product?: string} | null>(null);
  const [cloudBriefId, setCloudBriefId] = useState<string | null>(null); 
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isRenderingVisuals, setIsRenderingVisuals] = useState(false); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const loadSharedOrLocalBrief = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedId = urlParams.get("id");

        if (sharedId) {
          setIsGenerating(true);
          const res = await fetch(`${workerUrl}?id=${sharedId}`);
          if (res.ok) {
            const cloudData = await res.json();
            setShots(cloudData.shotlist || []);
            setMoodboard(cloudData.moodboard || []);
            setPremiseOverride(cloudData.premise);
            setTitleOverride(cloudData.title);
            setMasterIdentity(cloudData.master_identity);
            setVisualStyle(cloudData.visual_style || "real-life");
            setCloudBriefId(sharedId);
            setHasResult(true);
            setView("app");
            toast.success(lang === "id" ? "Brief Cloud berhasil dimuat!" : "Cloud brief loaded successfully!");
            setIsGenerating(false);
            return;
          }
        }
      } catch (e) {
        console.error("Gagal menarik data cloud:", e);
      } finally {
        setIsGenerating(false);
      }

      try {
        const savedShots = localStorage.getItem("vibeshot_shots");
        const savedMoodboard = localStorage.getItem("vibeshot_moodboard");
        const savedPremise = localStorage.getItem("vibeshot_premise");
        const savedTitle = localStorage.getItem("vibeshot_title");
        const savedIdentity = localStorage.getItem("vibeshot_identity");
        const savedStyle = localStorage.getItem("vibeshot_style");
        const savedCloudId = localStorage.getItem("vibeshot_cloud_id");
        const savedEngine = localStorage.getItem("vibeshot_active_engine");

        if (savedShots && savedMoodboard) {
          setShots(JSON.parse(savedShots));
          setMoodboard(JSON.parse(savedMoodboard));
          setPremiseOverride(savedPremise);
          setTitleOverride(savedTitle);
          if (savedIdentity) setMasterIdentity(JSON.parse(savedIdentity));
          if (savedStyle) setVisualStyle(savedStyle);
          if (savedCloudId) setCloudBriefId(savedCloudId);
          if (savedEngine) setActiveEngine(savedEngine as any);
          setHasResult(true);
          setView("app");
        }
      } catch { localStorage.clear(); }
    };

    loadSharedOrLocalBrief();

    try {
      const browserLang = navigator.language || (navigator as any).userLanguage || "en";
      setLang(browserLang.startsWith("id") ? "id" : "en");
    } catch { setLang("en"); }
  }, []);

  const t = translations[lang] || translations["en"];

  const saveToLocalStorage = (newShots: Shot[], newMood: string[], newPremise: string | null, newTitle: string | null, newIdentity: any, newStyle: string, cloudId: string | null) => {
    localStorage.setItem("vibeshot_shots", JSON.stringify(newShots));
    localStorage.setItem("vibeshot_moodboard", JSON.stringify(newMood));
    if (newPremise) localStorage.setItem("vibeshot_premise", newPremise);
    if (newTitle) localStorage.setItem("vibeshot_title", newTitle);
    if (newIdentity) localStorage.setItem("vibeshot_identity", JSON.stringify(newIdentity));
    if (newStyle) localStorage.setItem("vibeshot_style", newStyle);
    if (cloudId) localStorage.setItem("vibeshot_cloud_id", cloudId);
    localStorage.setItem("vibeshot_active_engine", activeEngine);
  };

  const handleClearAll = () => {
    localStorage.clear();
    window.history.replaceState({}, document.title, window.location.pathname);
    setShots([]);
    setMoodboard([]);
    setPremiseOverride(null);
    setTitleOverride(null);
    setMasterIdentity(null);
    setCloudBriefId(null);
    setHasResult(false);
    setRefType("none");
    setRefUrl("");
    setRefImageBase64("");
    setView("landing");
    toast.success(lang === "id" ? "Workspace dibersihkan." : "Workspace cleared.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error(lang === "id" ? "File maksimal 4MB." : "Max file size is 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setRefImageBase64(reader.result as string);
      toast.success(lang === "id" ? "Aset visual terkunci." : "Visual asset cached.");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setHasResult(false);

    let productVal = productName;
    let uspVal = usp;
    let toneVal = tone;
    let talentVal = talent;
    let shotCountVal = shotCount;
    let refTypeVal = refType;

    if (activeEngine === "clone") {
      productVal = "Analyzed Reference Video";
      uspVal = "Extracted Blueprint & Transcript";
      toneVal = "Matches Reference";
      talentVal = "Matches Reference";
      shotCountVal = 6;
      if (refType === "none") {
        refTypeVal = "link";
      }
    }

    const requestPayload = {
      product: productVal,
      usp: uspVal,
      trend: trend,
      tone: toneVal,
      shotCount: shotCountVal,
      platform: platform,
      pillar: pillar,
      talent: talentVal,
      refType: refTypeVal,
      refUrl: refUrl,
      refImageBase64: refImageBase64
    };

    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error compiling.");

      const normalized = (data.shotlist || []).map((r: any) => ({
        id: crypto.randomUUID(),
        angle: String(r?.angle || ""),
        location: String(r?.location || ""),
        tech_budget_hack: String(r?.tech_budget_hack || ""),
        action: String(r?.action || ""),
        audio: String(r?.audio || ""),
        image: String(r?.image || ""),
        imagePrompt: String(r?.imagePrompt || ""),
      }));

      setShots(normalized);
      setMoodboard(data.moodboard || []);
      setPremiseOverride(data.premise);
      setTitleOverride(data.title);
      setMasterIdentity(data.master_identity); 
      setVisualStyle(data.visual_style || "real-life"); 
      setCloudBriefId(data.briefId || null); 
      setHasResult(true);
      
      saveToLocalStorage(normalized, data.moodboard || [], data.premise, data.title, data.master_identity, data.visual_style, data.briefId || null);
      toast.success(lang === "id" ? "Brief berhasil diracik!" : "Brief successfully compiled!");
    } catch (err: any) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMassExecuteImages = async () => {
    setIsRenderingVisuals(true);
    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "render_images",
          briefId: cloudBriefId,
          title: titleOverride,
          premise: premiseOverride,
          visual_style: visualStyle,
          masterIdentity: masterIdentity,
          shotlist: shots 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error rendering images.");

      const updatedWithImages = (data.shotlist || []).map((r: any, idx: number) => ({
        ...shots[idx],
        image: String(r?.image || ""),
        imagePrompt: String(r?.imagePrompt || shots[idx].imagePrompt)
      }));

      setShots(updatedWithImages);
      setMoodboard(data.moodboard || []);
      
      saveToLocalStorage(updatedWithImages, data.moodboard || [], premiseOverride, titleOverride, masterIdentity, visualStyle, cloudBriefId);
      toast.success(lang === "id" ? "Semua frame visual berhasil dirender!" : "All visual frames rendered!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsRenderingVisuals(false);
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
          masterIdentity: masterIdentity, 
          title: titleOverride, 
          visual_style: visualStyle,
          refType, refUrl, refImageBase64
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error chaining.");

      const normalizedNewShots = (data.shotlist || []).map((r: any) => ({
        id: crypto.randomUUID(),
        angle: String(r?.angle || ""),
        location: String(r?.location || ""),
        tech_budget_hack: String(r?.tech_budget_hack || ""),
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
      setCloudBriefId(data.briefId || cloudBriefId); 
      
      saveToLocalStorage(finalShots, finalMood, finalPremise, titleOverride, masterIdentity, visualStyle, data.briefId || cloudBriefId);
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

  const isTextOnlyBrief = useMemo(() => {
    return shots.length > 0 && shots.every(s => !s.image);
  }, [shots]);

  const inputStyle = "w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none transition-colors";

  if (view === "landing") {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors duration-200">
        <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-[10px] font-bold">V</div>
            <span className="text-xs font-semibold tracking-tight">vibeshot.studio</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 border-r border-zinc-200 dark:border-zinc-700 pr-4">
              <CustomSwitch isOn={lang === "id"} onToggle={() => setLang(lang === "en" ? "id" : "en")} labelOff="EN" labelOn="ID" />
              <CustomSwitch isOn={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} IconOff={Sun} IconOn={Moon} />
            </div>
            <button onClick={() => setView("app")} className="text-xs font-medium bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-colors shadow-sm">Launch Studio →</button>
          </div>
        </nav>
        <header className="mx-auto max-w-3xl text-center px-6 pt-20 pb-16 space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 px-3 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            <Sparkles className="h-3 w-3 text-zinc-400 dark:text-zinc-500" /> Private Beta Engine Active
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Turn messy script ideas into crystal-clear production briefs.
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
            The automated workspace built for Creative Strategists and Agency Workers. Translate loose briefs and visual references into word-for-word scripts, moodboards, and interactive storyboards in 60 seconds.
          </p>
          <div className="pt-2">
            <button onClick={() => setView("app")} className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-xs px-5 py-3 rounded-lg shadow hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-all transform hover:-translate-y-0.5">
              Get Started for Free <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] font-sans text-zinc-900 dark:text-zinc-100 antialiased transition-colors duration-200">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#111111] px-6 py-2.5 gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setView("landing")} className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-[10px] font-bold transition-colors">V</button>
            <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">/</span>
            <span className="text-xs font-medium tracking-tight">vibeshot.studio/workspace</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-4 border-r border-zinc-200 dark:border-zinc-700 pr-3">
              <CustomSwitch isOn={lang === "id"} onToggle={() => setLang(lang === "en" ? "id" : "en")} labelOff="EN" labelOn="ID" />
              <CustomSwitch isOn={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} IconOff={Sun} IconOn={Moon} />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setView("landing")} className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors">{t.backToHome}</button>
              {hasResult && <span className="text-zinc-200 dark:text-zinc-700 font-mono text-xs">|</span>}
              {hasResult && <button onClick={handleClearAll} className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">{t.resetProject}</button>}
            </div>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-42px)] grid-cols-1 lg:grid-cols-[380px_1fr]">
          <aside className="border-r border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-[#111111] p-5 lg:sticky lg:top-[42px] lg:h-[calc(100vh-42px)] lg:overflow-y-auto space-y-5 shadow-sm">
            
            <div className="space-y-1.5">
              <span className="block text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.selectMode}</span>
              <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/40 dark:border-zinc-800">
                <button 
                  type="button"
                  onClick={() => setActiveEngine("hybrid")}
                  className={`text-[11px] font-bold py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer ${activeEngine === "hybrid" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}
                >
                  {t.modeHybrid}
                </button>
                <button 
                  type="button"
                  onClick={() => { setActiveEngine("clone"); setOpenSection("ref"); }}
                  className={`text-[11px] font-bold py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer ${activeEngine === "clone" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}
                >
                  {t.modeClone}
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic leading-snug px-1">
                {activeEngine === "hybrid" ? t.modeHybridDesc : t.modeCloneDesc}
              </p>
            </div>

            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-2" />

            {activeEngine === "hybrid" && (
              <div className="rounded-lg border border-zinc-200/60 dark:border-zinc-800 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/30 transition-all">
                <button type="button" onClick={() => setOpenSection(openSection === "core" ? "none" : "core")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white dark:bg-[#111111] border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <span className="flex items-center gap-2"><Film className="h-3.5 w-3.5 text-zinc-500" /> {t.paramUtama}</span>
                  {openSection === "core" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}
                </button>
                {openSection === "core" && (
                  <div className="p-4 space-y-4 bg-white dark:bg-[#111111]">
                    <Field label={t.namaBrand}><input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Suzuki Carry Pick Up 2026" className={inputStyle} /></Field>
                    <Field label={t.ideKasar}><textarea value={usp} onChange={(e) => setUsp(e.target.value)} rows={4} placeholder={t.placeholderIde} className={inputStyle + " resize-none"} /></Field>
                  </div>
                )}
              </div>
            )}

            {activeEngine === "hybrid" && (
              <div className="rounded-lg border border-zinc-200/60 dark:border-zinc-800 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/30 transition-all">
                <button type="button" onClick={() => setOpenSection(openSection === "vibe" ? "none" : "vibe")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white dark:bg-[#111111] border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-zinc-500" /> {t.arsitekturVibe}</span>
                  {openSection === "vibe" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}
                </button>
                {openSection === "vibe" && (
                  <div className="p-4 space-y-4 bg-white dark:bg-[#111111]">
                    <Field label={t.targetPlatform}>
                      <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputStyle + " bg-zinc-50/50 dark:bg-zinc-800/50"}>
                        <option value="TikTok">TikTok (Organic & Raw Concept)</option><option value="Instagram Reels">Instagram Reels (Aesthetic & Trendy)</option>
                      </select>
                    </Field>
                    <Field label={t.pillarKonten}>
                      <select value={pillar} onChange={(e) => setPillar(e.target.value)} className={inputStyle + " bg-zinc-50/50 dark:bg-zinc-800/50"}>
                        <option value="Hiburan / Entertainment">{t.pillarOption1}</option><option value="Hard Sell / Promosi Langsung">{t.pillarOption2}</option>
                      </select>
                    </Field>
                    <Field label={lang === "id" ? t.pendekatanTalent : "Talent Approach"}>
                      <select value={talent} onChange={(e) => setTalent(e.target.value)} className={inputStyle + " bg-zinc-50/50 dark:bg-zinc-800/50"}>
                        <option value="Creator-Led (Ada talent berbicara ke kamera)">{t.talentOption1}</option><option value="Voice Over Only (Kombinasi cuplikan + VO)">{t.talentOption2}</option>
                      </select>
                    </Field>
                    <Field label={t.moodTone}><input value={tone} onChange={(e) => setTone(e.target.value)} className={inputStyle} /></Field>
                    <Field label={t.jumlahShot}><input type="number" min={1} max={12} value={shotCount} onChange={(e) => setShotCount(parseInt(e.target.value || "6", 10))} className={inputStyle + " w-24"} /></Field>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-zinc-200/60 dark:border-zinc-800 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/30">
              <button type="button" onClick={() => setOpenSection(openSection === "ref" ? "none" : "ref")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white dark:bg-[#111111] border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <span className="flex items-center gap-2"><Upload className="h-3.5 w-3.5 text-zinc-500" /> {t.refMultimodal}</span>
                {openSection === "ref" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}
              </button>
              {openSection === "ref" && (
                <div className="p-4 space-y-4 bg-white dark:bg-[#111111]">
                  <Field label={t.tipeAset}>
                    <select value={activeEngine === "clone" && refType === "none" ? "link" : refType} onChange={(e) => setRefType(e.target.value)} className={inputStyle + " bg-zinc-50/50 dark:bg-zinc-800/50"}>
                      {activeEngine === "hybrid" && <option value="none">{t.noRef}</option>}
                      <option value="link">{t.pasteLink}</option>
                      <option value="photo">{t.uploadPhoto}</option>
                    </select>
                  </Field>

                  {((refType === "photo") || (activeEngine === "clone" && refType === "none" && refUrl === "")) && (
                    <div className="space-y-2">
                      <label className="flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                        <Upload className="h-5 w-5 text-zinc-400 dark:text-zinc-500 mb-1" />
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">{t.clickUpload}</span>
                        <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                      </label>
                      {refImageBase64 && (
                        <span className="text-[10px] font-mono text-emerald-500 block text-center font-medium">{t.payloadLocked}</span>
                      )}
                    </div>
                  )}

                  {((refType === "link") || (activeEngine === "clone" && refType === "none")) && (
                    <Field label={t.pasteLink}>
                      <div className="relative flex items-center">
                        <input value={refUrl} onChange={(e) => setRefUrl(e.target.value)} placeholder={t.pastePlaceholder} className={inputStyle + " pr-8"} />
                        <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5" />
                      </div>
                    </Field>
                  )}
                </div>
              )}
            </div>

            <button type="button" onClick={handleGenerate} disabled={isGenerating || isContinuing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-3 text-xs font-bold text-white dark:text-zinc-900 shadow-md transition hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 cursor-pointer transform active:scale-95 duration-100">
              {isGenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.btnCompiling}</> : <><Sparkles className="h-3.5 w-3.5" /> {t.btnCompile}</>}
            </button>
          </aside>

          <main className="p-6 lg:p-10 overflow-y-auto max-h-[calc(100vh-42px)] bg-[#fafafa] dark:bg-[#0a0a0a]">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{titleOverride || t.papanStrategi}</h2>
                {hasResult && cloudBriefId && (
                  <button type="button" onClick={handleShareLink} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm shrink-0 cursor-pointer">
                    <LinkIcon className="w-3.5 h-3.5" /> {t.btnShare}
                  </button>
                )}
              </div>

              {isTextOnlyBrief && (
                <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">💡 Teks Naskah Berhasil Di-sadur!</h3>
                    <p className="text-xs text-zinc-100 mt-0.5">Silakan periksa, edit camera angle & copywriting audio di bawah terlebih dahulu. Jika sudah mantap, gas render visualnya!</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleMassExecuteImages} 
                    disabled={isRenderingVisuals}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-4 py-2 text-xs rounded-lg transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isRenderingVisuals ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.btnRenderingVisual}</> : <><Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t.btnRenderVisual}</>}
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#111111] p-5 shadow-sm space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">{t.premisNaratif}</span>
                <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans">{premiseOverride || t.premisPlaceholder}</p>
              </div>

              {!isTextOnlyBrief && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">{t.panelKontinuitas}</span>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                    {moodboardTiles.map((src, i) => (
                      <div key={i} className="group relative aspect-[9/16] overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                        {src ? (
                          <SimpleAIImage src={src} index={i} alt={`Shot ${i+1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onClick={() => setPreviewImage(src)} />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600"><ImageIcon className="h-4 w-4" /><span className="text-[9px] font-mono uppercase">Shot {i + 1}</span></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t.garisWaktu} ({shots.length} Sequence)</span>
                  {hasResult && <button type="button" onClick={handleCopyTable} className="inline-flex items-center gap-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 transition hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm cursor-pointer"><Copy className="h-3 w-3" /> {t.salinTabel}</button>}
                </div>

                {shots.length === 0 ? (
                  <div className="py-12 border border-dashed border-zinc-200 dark:border-dashed dark:border-zinc-800 bg-white dark:bg-[#111111] text-center rounded-xl text-xs text-zinc-400 dark:text-zinc-600 font-mono">{t.belumAda}</div>
                ) : (
                  <div className="space-y-4">
                    {shots.map((s, idx) => (
                      <div key={s.id} className="group relative flex flex-col gap-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#111111] p-4 shadow-sm transition hover:border-zinc-300 dark:hover:border-zinc-700">
                        <div className="flex flex-col md:flex-row gap-5">
                          <div className="flex items-start gap-3 shrink-0">
                            <div className="text-xs font-mono font-semibold text-zinc-300 dark:text-zinc-600 pt-1">{String(idx + 1).padStart(2, "0")}</div>
                            
                            <div className="relative aspect-[9/16] w-24 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 shadow-inner">
                              {s.image ? <SimpleAIImage src={s.image} index={idx} alt="Sequence" className="h-full w-full object-cover object-center cursor-zoom-in" onClick={() => setPreviewImage(s.image!)} /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-600 font-mono text-center px-1">Teks Ready</div>}
                            </div>
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2.5 border-r border-zinc-100/80 dark:border-zinc-800/80 pr-2">
                              <div>
                                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-0.5">{t.cameraSpecs}</span>
                                <input value={s.angle} onChange={(e) => updateShot(s.id, "angle", e.target.value)} className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 rounded border border-transparent px-1.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 font-medium focus:border-zinc-200 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-colors" />
                              </div>
                              <div>
                                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-0.5">{t.locationEnv}</span>
                                <input value={s.location} onChange={(e) => updateShot(s.id, "location", e.target.value)} className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 rounded border border-transparent px-1.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:border-zinc-200 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-colors" />
                              </div>
                            </div>

                            <div className="space-y-2.5">
                              <div>
                                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-0.5">{t.visualScene}</span>
                                <textarea rows={2} value={s.action} onChange={(e) => updateShot(s.id, "action", e.target.value)} className="w-full bg-transparent rounded border border-transparent px-1 py-0.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed resize-none focus:border-zinc-200 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-colors" />
                              </div>
                              <div>
                                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-0.5">{t.audioScript}</span>
                                <textarea rows={2} value={s.audio} onChange={(e) => updateShot(s.id, "audio", e.target.value)} className="w-full bg-transparent rounded border border-transparent px-1 py-0.5 text-xs text-zinc-100 font-medium leading-relaxed resize-none focus:border-zinc-200 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-colors" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {s.tech_budget_hack && (
                          <div className="mt-1 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-700/50 rounded-md">
                            <span className="text-[10px] font-bold text-yellow-800 dark:text-yellow-500 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" /> TECH & BUDGET HACK
                            </span>
                            <p className="text-xs mt-1 text-yellow-900 dark:text-yellow-200/80 leading-relaxed">{s.tech_budget_hack}</p>
                          </div>
                        )}

                        <div className="mt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> {t.aiPromptLabel}</span>
                            <button 
                              type="button"
                              onClick={() => { navigator.clipboard.writeText(s.imagePrompt || ""); toast.success("Prompt disalin!"); }}
                              className="text-[9px] text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center gap-1 font-mono transition-colors cursor-pointer"
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

                        <button type="button" onClick={() => removeShot(s.id)} className="absolute top-3 right-3 rounded p-1 text-zinc-300 dark:text-zinc-600 opacity-0 transition hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {hasResult && !isTextOnlyBrief && (
                  <div className="pt-6 pb-2 text-center">
                    <button type="button" onClick={handleLanjutkanCerita} disabled={isContinuing} className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 shadow-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 cursor-pointer">
                      {isContinuing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.btnExtending}</> : 
                      <><ArrowDownRight className="h-3.5 w-3.5" /> 
                        <span className="md:hidden">
                          {t.btnExtend}
                        </span>
                        <span className="hidden md:inline">
                          {t.btnExtend} (Shots {shots.length + 1}-{shots.length + (shotCount || 6)})
                        </span>
                      </>}
                    </button>
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
              type="button"
              className="absolute -top-4 -right-4 bg-white text-zinc-900 rounded-full p-1.5 shadow-lg hover:bg-zinc-200 transition-colors cursor-pointer"
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
      <span className="block text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
}
