import React, { useMemo, useState, useEffect } from "react";
import {
  Trash2,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Copy,
  ArrowDownRight,
  Link as LinkIcon,
  Upload,
  Eye,
  EyeOff,
  Layers,
  Film,
  ArrowRight,
  X,
  Moon,
  Sun,
  AlignLeft,
  Edit3,
  Cpu,
  User,
  Mail,
  Key,
  ShieldAlert,
  CreditCard,
  Coins,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import pptxgen from "pptxgenjs";
import { supabase } from "../lib/supabase";
import { ChatInterface } from "./ChatInterface";
import { AccountSettingsModal } from "./AccountSettingsModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
declare global {
  interface Window {
    pendo?: {
      track: (event: string, metadata?: any) => void;
      identify: (config: any) => void;
    };
  }
}

interface Shot {
  id: string;
  angle: string;
  location: string;
  tech_budget_hack?: string;
  action: string;
  audio: string;
  image?: string;
  imagePrompt?: string;
  imageModel?: string;
}

const translations = {
  id: {
    backToHome: "← Kembali ke Home",
    resetProject: "Reset Workspace",
    briefComposer: "Production Engine Room 🛠️",
    selectMode: "Pilih Mode Amunisi AI",
    modeHybrid: "Hybrid Strategist",
    modeHybridDesc: "Gabung Brand/USP manual dengan alur video referensi",
    modeClone: "Instant Clone Engine",
    modeCloneDesc: "Replikasi ritme & struktur video viral untuk produk baru lo secara instan",
    paramUtama: "1. Parameter Utama Brief",
    namaBrand: "Nama Brand / Produk Target Baru",
    ideKasar: "Instruksi Modifikasi / USP Produk Baru",
    placeholderIde:
      "Contoh: Jadikan ini buat produk Kopi Susu Gula Aren, tonjolkan efek bikin melek instan...",
    trendLabel: "Tren Viral Saat Ini / Gaya Visual (Opsional)",
    trendPlaceholder:
      "Contoh: Tren ASMR tapping produk, transisi beat drop jedag-jedug, gaya sinematik lofi...",
    arsitekturVibe: "3. Arsitektur & Vibe Konten",
    targetPlatform: "Target Platform Konten",
    pillarKonten: "Pillar / Kategori Konten",
    pillarOption1: "Hiburan / Komedi Skit / Entertainment",
    pillarOption2: "Hard Sell / Promosi Produk Langsung",
    pendekatanTalent: "Pendekatan Talent (Approach)",
    talentOption1: "Creator-Led (Talent bicara depan kamera)",
    talentOption2: "Voice Over Only (Potongan visual + VO narator)",
    moodTone: "Mood & Tone Konten (Gaya Penyampaian)",
    jumlahShot: "Jumlah Shot Yang Diminta (Awal/Lanjutan)",
    refMultimodal: "2. Referensi Alur & Visual (Multimodal)",
    tipeAset: "Tipe Aset Referensi",
    noRef: "Tanpa referensi (Andalkan Teks Murni)",
    uploadPhoto: "Upload Foto Moodboard / Screenshot",
    pasteLink: "Paste Link Video Referensi (YouTube)",
    textBasedRef: "Tulis Deskripsi Teks / Transkrip Video Manual",
    clickUpload: "Klik untuk pilih gambar/screenshot/video",
    payloadLocked: "✓ payload aset visual terkunci",
    pastePlaceholder: "Paste link video YouTube di sini untuk dicuri strukturnya...",
    textPlaceholder:
      "Tulis di sini deskripsi alur video yang lo ingat, ketik transkrip manual, atau sebutkan gaya moodboard text-based...",
    btnCompile: "Eksekusi Cetak Biru Konten 🚀",
    btnCompiling: "Membongkar Referensi & Meracik AI...",
    specSheet: "Lembar Spesifikasi Produksi",
    papanStrategi: "Papan Strategi Konten",
    premisNaratif: "Premis Naratif Konsep (Alur Logika AI)",
    premisPlaceholder:
      "Hasil racikan narasi konsep komparasi teks & aset gambar akan mendarat di sini secara terstruktur.",
    panelKontinuitas: "Panel Kontinuitas Visual Storyboard (Master Frame 9:16)",
    garisWaktu: "Garis Waktu Shotlist Stack",
    salinTabel: "Salin Struktur Tabel (Buat Excel)",
    belumAda: "Belum ada runtutan adegan yang dieksekusi.",
    cameraSpecs: "Spesifikasi Kamera / Angle",
    locationEnv: "Lingkungan Adegan / Lokasi",
    visualScene: "Deskripsi Aksi Visual Adegan",
    audioScript: "Naskah Copywriting Audio (VO / Dialog / SFX)",
    btnExtend: "Lanjutkan Alur Cerita (Inline Extension)",
    btnExtending: "Melakukan Rantai Sambungan Adegan...",
    aiPromptLabel: "Master AI Image Prompt (Universal)",
    btnShare: "Bagikan Link Brief 🔗",
    shareSuccess: "Link brief berhasil disalin ke clipboard!",
    btnRenderVisualMassal: "Fase 2: Hasilkan Frame Storyboard Visual (RENDER MASSAL)",
    btnRenderingVisualMassal: "Bulk rendering via Fal.ai...",
    btnRenderSingle: "Generate Visual Ini",
    login: "Masuk",
    signup: "Daftar",
    logout: "Keluar",
    email: "Alamat Email",
    password: "Kata Sandi",
    confirmPassword: "Konfirmasi Kata Sandi",
    loggingIn: "Menghubungkan Sesi...",
    signingUp: "Membuat Akun Baru...",
    welcomeUser: "Selamat datang,",
    noAccount: "Belum punya akun?",
    haveAccount: "Sudah punya akun?",
    createAccount: "Buat Akun Studio",
    signIn: "Masuk ke Studio",
    guestMode: "Gunakan sebagai Tamu",
    authRequired: "Autentikasi Diperlukan",
    authRequiredDesc:
      "Silakan masuk untuk menyimpan brief ke Supabase dan menggunakan saldo backend API AI Anda.",
  },
  en: {
    backToHome: "← Back to Home",
    resetProject: "Reset Workspace",
    briefComposer: "Production Engine Room 🛠️",
    selectMode: "Select AI Engine Mode",
    modeHybrid: "Hybrid Strategist",
    modeHybridDesc: "Blend manual Brand/USP with a reference video's pacing",
    modeClone: "Instant Clone Engine",
    modeCloneDesc: "Replicate a viral video's layout structure for your own new product",
    paramUtama: "1. Core Brief Parameters",
    namaBrand: "Target New Brand / Product Name",
    ideKasar: "Modification Prompt / New Product USP",
    placeholderIde:
      "e.g., Turn this into a campaign for iced coffee, emphasize the instant energy kick...",
    trendLabel: "Current Viral Trend / Visual Style (Optional)",
    trendPlaceholder:
      "e.g., ASMR product tapping, lofi cinematic aesthetic, fast beat drop transitions...",
    arsitekturVibe: "3. Content Architecture",
    targetPlatform: "Target Platform",
    pillarKonten: "Content Pillar",
    pillarOption1: "Entertainment / Comedy Skit",
    pillarOption2: "Hard Sell / Direct Product Promotion",
    pendekatanTalent: "Talent Approach",
    talentOption1: "Creator-Led (Talent talking to camera)",
    talentOption2: "Voice Over Only (Visual clips + VO narrator)",
    moodTone: "Content Mood & Tone",
    jumlahShot: "Requested Shot Count (Initial/Extension)",
    refMultimodal: "2. Flow & Visual References (Multimodal)",
    tipeAset: "Reference Asset Type",
    noRef: "No reference (Text only)",
    uploadPhoto: "Upload Moodboard / Screenshot Photo",
    pasteLink: "Paste Reference Video Link (YouTube)",
    textBasedRef: "Write Text Description / Manual Transcript",
    clickUpload: "Click to select image/screenshot/video",
    payloadLocked: "✓ visual asset payload cached",
    pastePlaceholder: "Paste YouTube link to extract structural pacing...",
    textPlaceholder:
      "Write rough pacing, text transcript, or text-based moodboard instructions here...",
    btnCompile: "Execute Production Blueprint 🚀",
    btnCompiling: "Dissecting References & Compiling AI...",
    specSheet: "Production Spec Sheet",
    papanStrategi: "Untitled Strategy Board",
    premisNaratif: "Concept Narrative Premise (AI Logic Flow)",
    premisPlaceholder:
      "The AI-generated concept narrative matching text and visual assets will land here structured.",
    panelKontinuitas: "Visual Storyboard Continuity Panel (Master Frame 9:16)",
    garisWaktu: "Storyboard Timeline Stack",
    salinTabel: "Copy Table Structure (For Excel)",
    belumAda: "No execution sequences generated yet.",
    cameraSpecs: "Camera Specs / Angle",
    locationEnv: "Scene Environment / Location",
    visualScene: "Visual Scene Action Description",
    audioScript: "Audio Copywriting Script (VO / Dialog / SFX)",
    btnExtend: "Extend Storyline Layout (Inline Extension)",
    btnExtending: "Chaining Sequence Extensions...",
    aiPromptLabel: "Master AI Image Prompt (Universal)",
    btnShare: "Share Brief Link 🔗",
    shareSuccess: "Brief link copied to clipboard!",
    btnRenderVisualMassal: "Phase 2: Generate Storyboard Frames (BULK RENDER)",
    btnRenderingVisualMassal: "Bulk rendering via Fal.ai...",
    btnRenderSingle: "Generate Visual This Shot",
    login: "Log In",
    signup: "Sign Up",
    logout: "Log Out",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    loggingIn: "Connecting Session...",
    signingUp: "Creating Account...",
    welcomeUser: "Welcome,",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    createAccount: "Create Studio Account",
    signIn: "Sign In to Studio",
    guestMode: "Use as Guest",
    authRequired: "Authentication Required",
    authRequiredDesc:
      "Please log in to save briefs to Supabase and use your AI backend API credits.",
  },
};

function SimpleAIImage({
  src,
  alt,
  className,
  onClick,
  index,
}: {
  src: string;
  alt: string;
  className: string;
  onClick?: () => void;
  index: number;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), index * 400);
    return () => clearTimeout(timer);
  }, [index, src]);

  if (!src) return null;

  return (
    <div className="relative w-full h-full">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-400 font-mono animate-pulse rounded-lg">
          <span>rendering...</span>
        </div>
      )}
      {hasError && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-[9px] text-zinc-400 font-mono cursor-pointer p-2 text-center"
          onClick={(e) => {
            e.stopPropagation();
            setHasError(false);
            setIsLoaded(false);
            setShouldLoad(false);
          }}
        >
          <span className="text-orange-400 font-bold mb-0.5">API Error</span>
          <span className="underline scale-90">click to retry</span>
        </div>
      )}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500 ${onClick ? "cursor-zoom-in hover:opacity-90" : ""}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
          onClick={onClick}
        />
      )}
    </div>
  );
}

function CustomSwitch({ isOn, onToggle, labelOff, labelOn, IconOff, IconOn }: any) {
  const switchOffClass = !isOn
    ? "text-zinc-900 dark:text-zinc-100 scale-105"
    : "text-zinc-400 dark:text-zinc-600";
  const switchOnClass = isOn
    ? "text-zinc-900 dark:text-zinc-100 scale-105"
    : "text-zinc-400 dark:text-zinc-600";
  const capClass = isOn
    ? "bg-zinc-900 dark:bg-zinc-100 border border-zinc-800 dark:border-zinc-300"
    : "bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700";
  const ballClass = isOn
    ? "translate-x-4 bg-white dark:bg-zinc-900"
    : "translate-x-0.5 bg-zinc-600 dark:bg-zinc-400";

  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-2 cursor-pointer select-none group p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all duration-150"
    >
      {(labelOff || IconOff) && (
        <span
          className={`text-[10px] font-mono font-bold tracking-wider transition-all duration-200 ${switchOffClass}`}
        >
          {IconOff ? <IconOff className="w-3.5 h-3.5" /> : labelOff}
        </span>
      )}
      <div
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${capClass}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-300 shadow-sm ${ballClass}`}
        />
      </div>
      {(labelOn || IconOn) && (
        <span
          className={`text-[10px] font-mono font-bold tracking-wider transition-all duration-200 ${switchOnClass}`}
        >
          {IconOn ? <IconOn className="w-3.5 h-3.5" /> : labelOn}
        </span>
      )}
    </div>
  );
}

interface ShotCardProps {
  shot: Shot;
  index: number;
  t: any;
  lang: string;
  updateShot: (id: string, field: keyof Shot, value: string) => void;
  removeShot: (id: string) => void;
  handleExecuteSingleImage: (shot: Shot) => Promise<void>;
  loadingSingleImage: boolean;
  setPreviewImage: (src: string | null) => void;
  masterIdentity?: {
    talent?: string;
    product?: string;
  } | null;
}

function ShotCard({
  shot,
  index,
  t,
  lang,
  updateShot,
  removeShot,
  handleExecuteSingleImage,
  loadingSingleImage,
  setPreviewImage,
  masterIdentity,
}: ShotCardProps) {
  const [localAngle, setLocalAngle] = useState(shot.angle);
  const [localLocation, setLocalLocation] = useState(shot.location);
  const [localAction, setLocalAction] = useState(shot.action);
  const [localAudio, setLocalAudio] = useState(shot.audio);
  const [localImagePrompt, setLocalImagePrompt] = useState(shot.imagePrompt || "");

  // Sync local states if the parent shot changes (e.g., loaded from cloud or re-generated)
  useEffect(() => {
    setLocalAngle(shot.angle);
    setLocalLocation(shot.location);
    setLocalAction(shot.action);
    setLocalAudio(shot.audio);
    setLocalImagePrompt(shot.imagePrompt || "");
  }, [shot.angle, shot.location, shot.action, shot.audio, shot.imagePrompt]);

  const handleBlur = (field: keyof Shot, localValue: string, originalValue: string) => {
    if (localValue !== originalValue) {
      updateShot(shot.id, field, localValue);
    }
  };

  return (
    <div className="group relative flex flex-col gap-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#111111] p-4 shadow-sm transition hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex items-start gap-3 shrink-0">
          <div className="text-xs font-mono font-semibold text-zinc-300 dark:text-zinc-600 pt-1">
            {String(index + 1).padStart(2, "0")}
          </div>
          <div className="relative aspect-[9/16] w-24 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 shadow-inner">
            {shot.image ? (
              <SimpleAIImage
                src={shot.image}
                index={index}
                alt="Sequence"
                className="h-full w-full object-cover object-center cursor-zoom-in"
                onClick={() => setPreviewImage(shot.image!)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-600 font-mono text-center px-1">
                Teks Ready
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2.5 border-r border-zinc-100/80 dark:border-zinc-800/80 pr-2">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-200 uppercase tracking-wider block mb-0.5">
                {t.cameraSpecs}
              </span>
              <input
                value={localAngle}
                onChange={(e) => setLocalAngle(e.target.value)}
                onBlur={() => handleBlur("angle", localAngle, shot.angle)}
                className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 rounded border border-transparent px-1.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 font-medium focus:border-zinc-200 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-200 uppercase tracking-wider block mb-0.5">
                {t.locationEnv}
              </span>
              <input
                value={localLocation}
                onChange={(e) => setLocalLocation(e.target.value)}
                onBlur={() => handleBlur("location", localLocation, shot.location)}
                className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 rounded border border-transparent px-1.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:border-zinc-200 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-200 uppercase tracking-wider block mb-0.5">
                {t.visualScene}
              </span>
              <textarea
                rows={2}
                value={localAction}
                onChange={(e) => setLocalAction(e.target.value)}
                onBlur={() => handleBlur("action", localAction, shot.action)}
                className="w-full bg-transparent rounded border border-transparent px-1 py-0.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed resize-none focus:border-zinc-200 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-200 uppercase tracking-wider block mb-0.5">
                {t.audioScript}
              </span>
              <textarea
                rows={2}
                value={localAudio}
                onChange={(e) => setLocalAudio(e.target.value)}
                onBlur={() => handleBlur("audio", localAudio, shot.audio)}
                className="w-full bg-transparent rounded border border-transparent px-1 py-0.5 text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed resize-none focus:border-zinc-200 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
      {shot.tech_budget_hack && (
        <div className="mt-1 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-700/50 rounded-md">
          <span className="text-[10px] font-bold text-yellow-800 dark:text-yellow-500 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> TECH & BUDGET HACK
          </span>
          <p className="text-xs mt-1 text-yellow-900 dark:text-yellow-200/80 leading-relaxed">
            {shot.tech_budget_hack}
          </p>
        </div>
      )}
      <div className="mt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-0">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {t.aiPromptLabel}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  // Reconstruct prompt dynamically from live editable card inputs!
                  let basePrompt = localAction || "cinematic commercial scenario";
                  
                  // Detect camera perspective from localAngle
                  let cameraFraming = "";
                  const angleUpper = localAngle.toUpperCase();
                  const isDroneOrWide = angleUpper.includes("DRONE") || angleUpper.includes("AERIAL") || angleUpper.includes("BIRD") || angleUpper.includes("ESTABLISHING") || angleUpper.includes("WIDE");
                  
                  if (angleUpper.includes("DRONE") || angleUpper.includes("AERIAL") || angleUpper.includes("BIRD")) {
                    cameraFraming = "Ultra-high-angle drone follow-cam wide landscape shot";
                  } else if (angleUpper.includes("WIDE") || angleUpper.includes("ESTABLISHING")) {
                    cameraFraming = "Cinematic extreme wide establishing landscape shot, expansive scale";
                  } else if (angleUpper.includes("CLOSE")) {
                    cameraFraming = "Extreme close-up macro shot, highly detailed focus";
                  } else if (angleUpper.includes("MEDIUM")) {
                    cameraFraming = "Cinematic medium shot, waist-up framing";
                  } else if (angleUpper.includes("POV")) {
                    cameraFraming = "First-person point-of-view (POV) cinematic perspective shot";
                  } else if (localAngle) {
                    cameraFraming = `${localAngle} camera angle shot`;
                  }
                  
                  let lensStyle = "shot on 35mm anamorphic lens, cinematic composition, professional studio lighting, gorgeous depth of field";
                  if (isDroneOrWide) {
                    lensStyle = "shot on ultra-wide 16mm cinema lens, deep focus, epic landscape scale, volumetric golden hour morning sun rays, cinematic lighting";
                  } else if (angleUpper.includes("CLOSE")) {
                    lensStyle = "shot on 85mm macro lens, sharp focus, professional portrait studio lighting, dramatic background bokeh blur";
                  }
                  
                  // Clean portrait metrics for wide view
                  if (isDroneOrWide) {
                    basePrompt = basePrompt
                      .replace(/A stylish young Indonesian woman, confident and relaxed, wearing natural-toned comfortable clothes, ready for work\./gi, "")
                      .replace(/A stylish young Indonesian woman/gi, "")
                      .replace(/wearing natural-toned comfortable clothes/gi, "")
                      .replace(/portrait/gi, "wide landscape view")
                      .replace(/close-up/gi, "wide view")
                      .replace(/close up/gi, "wide view");
                  }
                  
                  let identityPart = "";
                  if (masterIdentity) {
                    const talent = masterIdentity.talent || "";
                    const product = masterIdentity.product || "";
                    
                    const masterStr = isDroneOrWide 
                      ? [product].filter(Boolean).join(". ")
                      : [talent, product].filter(Boolean).join(". ");
                    
                    if (masterStr) {
                      const baseLower = basePrompt.toLowerCase();
                      const masterTerms = masterStr.toLowerCase().split(/\s+/).slice(0, 3);
                      const hasOverlap = masterTerms.some(term => term.length > 3 && baseLower.includes(term));
                      if (!hasOverlap) {
                        identityPart = `${masterStr.trim()}. `;
                      }
                    }
                  }
                  
                  let enhanced = "";
                  if (cameraFraming) {
                    enhanced += `${cameraFraming}. `;
                  }
                  enhanced += identityPart;
                  enhanced += `${basePrompt.trim()}. `;
                  if (localLocation) {
                    enhanced += `Location environment: ${localLocation}. `;
                  }
                  enhanced += lensStyle;
                  
                  // Final sanitization
                  if (isDroneOrWide) {
                    enhanced = enhanced
                      .replace(/portrait/gi, "wide landscape view")
                      .replace(/close-up/gi, "wide view")
                      .replace(/close up/gi, "wide view");
                  }
                  
                  setLocalImagePrompt(enhanced);
                  handleBlur("imagePrompt", enhanced, shot.imagePrompt || "");
                  toast.success(lang === "id" ? "Prompt berhasil ditingkatkan berdasarkan data kartu adegan!" : "Prompt dynamically enhanced using card data!");
                }}
                className="text-[9px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold flex items-center gap-1 font-mono transition-all hover:scale-105 active:scale-95 duration-100 cursor-pointer mr-2"
              >
                <Sparkles className="w-3 h-3 animate-pulse" /> enhance prompt
              </button>
              
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(localImagePrompt);
                  toast.success("Prompt disalin!");
                }}
                className="text-[9px] text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center gap-1 font-mono transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3" /> copy prompt
              </button>
            </div>
          </div>
          <textarea
            rows={2}
            value={localImagePrompt}
            onChange={(e) => setLocalImagePrompt(e.target.value)}
            onBlur={() => handleBlur("imagePrompt", localImagePrompt, shot.imagePrompt || "")}
            className="w-full bg-zinc-900 text-zinc-300 font-mono text-[10px] rounded-md border border-zinc-800 px-2.5 py-2 leading-relaxed resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            placeholder="Prompt generator..."
          />
        </div>
        <div className="flex flex-col gap-1.5 shrink-0 w-full md:w-auto ml-0 md:ml-4">
          <div>
            <span className="text-[8px] font-mono text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block mb-1">
              AI model
            </span>
            <select
              value={shot.imageModel || ""}
              onChange={(e) => updateShot(shot.id, "imageModel", e.target.value)}
              className="w-full md:w-48 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px] text-zinc-800 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-700 focus:outline-none transition-colors font-medium"
            >
              <option value="">(Global Model Default)</option>
              <optgroup label="⚡ KASTA EKONOMIS">
                <option value="fal-ai/flux/schnell">FLUX 1 [Schnell] ($0.003)</option>
                <option value="fal-ai/flux-2/flash">FLUX 2 [Flash] ($0.004)</option>
                <option value="fal-ai/flux-2/turbo">FLUX 2 [Turbo] ($0.004)</option>
                <option value="fal-ai/bytedance/seedream/v5/lite/text-to-image">
                  Seedream 5.0 Lite ($0.003)
                </option>
              </optgroup>
              <optgroup label="🎨 KASTA DESIGNER & TYPO">
                <option value="fal-ai/recraft/v4/pro/text-to-image">Recraft V4 Pro ($0.03)</option>
                <option value="fal-ai/ideogram/v3">Ideogram V3 ($0.04)</option>
                <option value="fal-ai/openai/gpt-image-2">OpenAI GPT 2 ($0.04)</option>
                <option value="fal-ai/flux-pro/kontext/text-to-image">
                  FLUX Kontext Pro ($0.03)
                </option>
              </optgroup>
              <optgroup label="🤖 GOOGLE AI (GEMINI)">
                <option value="fal-ai/nano-banana-2">Nano Banana 2 — FAST ($0.08)</option>
                <option value="fal-ai/nano-banana-pro">Nano Banana Pro — SOTA ($0.15)</option>
              </optgroup>
              <optgroup label="👑 KASTA SULTAN">
                <option value="fal-ai/flux-2-max">FLUX 2 [Max] ($0.05)</option>
                <option value="fal-ai/flux-pro/v1.1-ultra">FLUX 1.1 Ultra ($0.05)</option>
                <option value="fal-ai/flux/dev">FLUX 1 [Dev] ($0.025)</option>
                <option value="fal-ai/flux-2-flex">FLUX 2 [Flex] ($0.03)</option>
              </optgroup>
            </select>
          </div>
          <button
            type="button"
            onClick={() => handleExecuteSingleImage(shot)}
            disabled={loadingSingleImage}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-[11px] font-bold tracking-tight text-zinc-700 dark:text-zinc-200 transition hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 cursor-pointer active:scale-95 duration-100 w-full"
          >
            {loadingSingleImage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Film className="w-3.5 h-3.5 text-indigo-500" />
            )}{" "}
            {t.btnRenderSingle}
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => removeShot(shot.id)}
        className="absolute top-3 right-3 rounded p-1 text-zinc-300 dark:text-zinc-600 opacity-0 transition hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100 cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "id" | "en";
  t: any;
  initialMode: "login" | "signup";
}

const GoogleIcon = () => (
  <svg
    className="h-3.5 w-3.5 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6-4.53z"
      fill="#EA4335"
    />
  </svg>
);

function AuthModal({ isOpen, onClose, lang, t, initialMode }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [initialMode, isOpen]);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    // Pendo Track: Google OAuth initiated
    window.pendo?.track("google_oauth_initiated", {
      provider: "google",
      language: lang,
    });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorMsg(
        err.message || (lang === "id" ? "Gagal masuk dengan Google." : "Google login failed."),
      );
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg(
        lang === "id" ? "Email dan password wajib diisi." : "Email and password are required.",
      );
      setLoading(false);
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setErrorMsg(
        lang === "id"
          ? "Konfirmasi password tidak cocok."
          : "Password confirmation does not match.",
      );
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Pendo Track: User logged in
        window.pendo?.track("user_logged_in", {
          email: email,
          language: lang,
        });
        toast.success(lang === "id" ? "Berhasil masuk ke studio!" : "Successfully logged in!");
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Pendo Track: User signed up
        window.pendo?.track("user_signed_up", {
          email: email,
          has_session: !!data?.session,
          language: lang,
        });
        if (data?.session) {
          toast.success(
            lang === "id" ? "Akun berhasil dibuat dan masuk!" : "Account created and logged in!",
          );
        } else {
          toast.success(
            lang === "id"
              ? "Pendaftaran berhasil! Cek email untuk verifikasi."
              : "Registration successful! Please check your email for verification.",
          );
        }
        onClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(
        err.message ||
          (lang === "id" ? "Terjadi kesalahan autentikasi." : "Authentication error occurred."),
      );
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with premium blur */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#111111]/95 p-6 shadow-2xl transition-all duration-300 transform scale-100 backdrop-blur-md">
        {/* Glow effect in background */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-sm font-extrabold mb-2.5 shadow-md">
            V
          </div>
          <h3 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
            {mode === "login" ? t.signIn : t.createAccount}
          </h3>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 font-mono uppercase tracking-wider font-bold">
            VibeShot Studio Portal
          </p>
        </div>

        {/* Tabs Switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/40 dark:border-zinc-800 mb-5 relative z-10">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`text-[11px] font-bold py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${mode === "login" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}
          >
            {t.login}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
            }}
            className={`text-[11px] font-bold py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${mode === "signup" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}
          >
            {t.signup}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Google Login Button */}
          <div>
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-sm transition-all duration-150 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <GoogleIcon />
              {mode === "login" ? "Continue with Google" : "Sign Up with Google"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center my-3.5">
            <div className="border-t border-zinc-200 dark:border-zinc-850 w-full" />
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 px-3.5 uppercase tracking-wider font-bold shrink-0">
              {lang === "id" ? "atau" : "or"}
            </span>
            <div className="border-t border-zinc-200 dark:border-zinc-850 w-full" />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 rounded-lg text-[11px] text-red-600 dark:text-red-400 flex items-start gap-2">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block font-semibold">
              {t.email}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pl-8.5 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block font-semibold">
              {t.password}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Key className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pl-8.5 pr-8 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (only on Signup) */}
          {mode === "signup" && (
            <div className="space-y-1 animate-[fadeIn_0.2s_ease-out]">
              <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block font-semibold">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Key className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pl-8.5 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 text-xs font-bold tracking-tight shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-150 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {mode === "login" ? t.loggingIn : t.signingUp}
              </>
            ) : mode === "login" ? (
              t.signIn
            ) : (
              t.createAccount
            )}
          </button>

          {/* Switch Prompt */}
          <div className="text-center pt-1.5">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setErrorMsg(null);
              }}
              className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium transition-colors hover:underline cursor-pointer"
            >
              {mode === "login" ? t.noAccount : t.haveAccount}{" "}
              <span className="text-indigo-500 dark:text-indigo-400 font-bold ml-0.5">
                {mode === "login" ? t.signup : t.login}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  user: any;
  lang: "id" | "en";
  t: any;
  workerUrl: string;
  profile: any;
  onProfileUpdated: () => void;
}

function UpgradeModal({
  isOpen,
  onClose,
  accessToken,
  user,
  lang,
  t,
  workerUrl,
  profile,
  onProfileUpdated,
}: UpgradeModalProps) {
  const [activeTab, setActiveTab] = useState<"crypto" | "card" | "mayar">("crypto");

  // Crypto Flow states
  const [signature, setSignature] = useState("");
  const [isVerifyingCrypto, setIsVerifyingCrypto] = useState(false);
  const [solanaNetwork, setSolanaNetwork] = useState<"mainnet-beta" | "devnet">("mainnet-beta");

  // PLG Free Tier Activation Lock states
  const [isPaymentMethodAdded, setIsPaymentMethodAdded] = useState(false);
  const [isActivatingFree, setIsActivatingFree] = useState(false);

  // Card Flow states
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isUpgradingCard, setIsUpgradingCard] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Mayar Flow states
  const [isUpgradingMayar, setIsUpgradingMayar] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("crypto");
      setSignature("");
      setCardNumber("");
      setCardHolder("");
      setExpiry("");
      setCvv("");
      setCardFlipped(false);
      setIsPaymentMethodAdded(false);
    }
  }, [isOpen]);

  const handleCopySolanaAddress = () => {
    navigator.clipboard.writeText("Guz6jxrmW8744a4k9CLa19SWLdm4HPs4yEefEj6PTje2");
    toast.success(lang === "id" ? "Alamat Solana disalin!" : "Solana wallet address copied!");
  };

  const handleActivateFree = async () => {
    if (!isPaymentMethodAdded) {
      toast.error(
        lang === "id"
          ? "Harap tautkan metode pembayaran (kartu atau Solana wallet) terlebih dahulu!"
          : "Please link a payment method (card or Solana wallet) first!",
      );
      return;
    }

    setIsActivatingFree(true);
    try {
      const res = await fetch(`${workerUrl}api/checkout/free-activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengaktifkan free tier.");

      toast.success(
        data.message ||
          (lang === "id" ? "Aktivasi free tier sukses!" : "Free tier activation successful!"),
      );

      if (onProfileUpdated) {
        onProfileUpdated();
      }

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsActivatingFree(false);
    }
  };

  const handleVerifyCrypto = async (simulate: boolean) => {
    const txSig = simulate ? "mock-signature-sandbox" : signature.trim();
    if (!txSig) {
      toast.error(
        lang === "id"
          ? "Harap isi signature transaksi!"
          : "Please provide a transaction signature.",
      );
      return;
    }

    setIsVerifyingCrypto(true);
    try {
      const res = await fetch(`${workerUrl}api/checkout/crypto/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          signature: txSig,
          simulate,
          solanaNetwork,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melakukan verifikasi.");

      toast.success(
        data.message || (lang === "id" ? "Aktivasi sukses!" : "Activation successful!"),
      );

      if (onProfileUpdated) {
        onProfileUpdated();
      }

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsVerifyingCrypto(false);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      toast.error(
        lang === "id" ? "Semua field kartu wajib diisi!" : "All card fields are required.",
      );
      return;
    }

    setIsUpgradingCard(true);
    try {
      const res = await fetch(`${workerUrl}api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          paymentMethod: "card",
          email: user?.email,
          amount: 150000,
          name: "VibeShot Pro Upgrade",
          description: "Premium access via simulated Stripe card billing + 300 render visual",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses kartu.");

      // Card is mock sandbox checkout, we simulate webhook upgrade using mock
      const webhookRes = await fetch(`${workerUrl}api/webhooks/mock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      const webhookData = await webhookRes.json();
      if (!webhookRes.ok)
        throw new Error(webhookData.error || "Simulated webhook callback failed.");

      toast.success(
        lang === "id"
          ? "Pembayaran kartu disimulasikan & akun diupgrade!"
          : "Card payment simulated & premium activated!",
      );

      if (onProfileUpdated) {
        onProfileUpdated();
      }

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpgradingCard(false);
    }
  };

  const handleMayarCheckoutSubmit = async () => {
    setIsUpgradingMayar(true);
    try {
      const res = await fetch(`${workerUrl}api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          paymentMethod: "mayar",
          email: user?.email,
          amount: 150000,
          name: "VibeShot Pro Upgrade",
          description: "Akses premium Vibeshot Studio + 300 render visual",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses checkout Mayar.");

      if (data.checkoutUrl) {
        toast.success(
          lang === "id"
            ? "Mengalihkan ke halaman Mayar Sandbox..."
            : "Redirecting to Mayar Sandbox page...",
        );
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Checkout URL missing.");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpgradingMayar(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with premium blur */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#111111]/95 p-6 shadow-2xl transition-all duration-300 transform scale-100 backdrop-blur-md text-zinc-900 dark:text-zinc-100 scrollbar-thin">
        {/* Glow effects in background */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer z-20"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-sm font-extrabold mb-2 shadow-md">
            V
          </div>
          <h3 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
            {lang === "id"
              ? "Pilih Metode Aktivasi Pro 🚀"
              : "Select Premium Pro Activation Method 🚀"}
          </h3>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 font-mono uppercase tracking-wider font-bold">
            VIBESHOT PREMIUM MEMBERSHIP
          </p>
        </div>

        {/* Free Tier Activation Lock Banner */}
        {user && (!profile || profile.tier === "free" || profile.tier === "") && (
          <div className="mb-5 p-3.5 rounded-xl border border-emerald-250/20 bg-emerald-500/5 dark:bg-emerald-500/10 backdrop-blur-md relative overflow-hidden animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  🎁 Unlock 10 Free Renders!
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[7px] font-mono uppercase tracking-wider font-extrabold ${isPaymentMethodAdded ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"}`}
                >
                  {isPaymentMethodAdded ? "🟢 Ready" : "🔴 Link Card/Wallet first"}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                {lang === "id"
                  ? "Dapatkan 10 render gratis! Cukup hubungkan Solana Wallet atau isi detail kartu sandbox di bawah sebagai verifikasi identitas anti-bot Anda."
                  : "Get 10 free renders! Simply link a Solana Wallet or enter sandbox card details below as your anti-bot identity verification."}
              </p>
              <button
                type="button"
                disabled={!isPaymentMethodAdded || isActivatingFree}
                onClick={handleActivateFree}
                className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold tracking-tight shadow active:scale-98 transition-all disabled:opacity-50 cursor-pointer ${isPaymentMethodAdded ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"}`}
              >
                {isActivatingFree ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {lang === "id" ? "Mengaktifkan..." : "Activating..."}
                  </span>
                ) : lang === "id" ? (
                  "Aktifkan Saldo Free 10 Render 🎁"
                ) : (
                  "Activate Free 10 Render Credits 🎁"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tabs Switch */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/40 dark:border-zinc-800 mb-5 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab("crypto")}
            className={`text-[10px] font-bold py-2 rounded-lg transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 ${activeTab === "crypto" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}
          >
            <span>🌐 Crypto</span>
            <span className="text-[7px] text-emerald-500 uppercase tracking-widest font-extrabold">
              Instant & KYC-Free
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("card")}
            className={`text-[10px] font-bold py-2 rounded-lg transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 ${activeTab === "card" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}
          >
            <span>💳 Card</span>
            <span className="text-[7px] text-amber-500 uppercase tracking-widest font-extrabold">
              Stripe Sandbox
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mayar")}
            className={`text-[10px] font-bold py-2 rounded-lg transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 ${activeTab === "mayar" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}
          >
            <span>⚡ Mayar.id</span>
            <span className="text-[7px] text-amber-500 uppercase tracking-widest font-extrabold">
              QRIS Sandbox
            </span>
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="relative z-10 space-y-4">
          {/* TAB 1: CRYPTO GATEWAY (ACTIVE & FUNCTIONAL) */}
          {activeTab === "crypto" && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                <strong>⚡ No KYC Required:</strong>{" "}
                {lang === "id"
                  ? "Gerbang pembayaran ini berjalan live! Transfer SOL/USDC ke alamat di bawah, lalu masukkan signature transaksi untuk verifikasi on-chain instan."
                  : "This gateway operates live! Transfer SOL or USDC to the merchant address below, then paste the transaction signature for instant on-chain verification."}
              </div>

              {/* Anti-Bot Connect Wallet */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 rounded-xl flex items-center justify-between gap-3 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold">
                    Anti-Bot Identity Verification
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-normal">
                    {lang === "id"
                      ? "Hubungkan dompet Anda untuk verifikasi identitas anti-bot instan."
                      : "Link Solana wallet for instant anti-bot verification."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentMethodAdded(true);
                    toast.success(
                      lang === "id"
                        ? "Dompet Solana terhubung! Metode pembayaran tersimpan."
                        : "Solana Wallet linked! Payment method registered.",
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold tracking-tight active:scale-98 transition-all cursor-pointer border shrink-0 ${isPaymentMethodAdded ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250/20" : "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border-transparent"}`}
                >
                  {isPaymentMethodAdded ? "🟢 Connected" : "🔗 Connect Wallet"}
                </button>
              </div>

              {/* QR Code and Wallet Area */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 rounded-xl">
                {/* Simulated QR Code */}
                <div className="w-22 h-22 bg-white p-1 rounded-lg shadow border border-zinc-200 flex items-center justify-center shrink-0">
                  <svg
                    className="w-full h-full text-zinc-900"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="100" height="100" fill="white" />
                    <path
                      d="M10 10h20v20H10V10zm5 5v10h10V15H15zm25-5h20v20H40V10zm5 5v10h10V15H45zm25-5h20v20H70V10zm5 5v10h10V15H75zm-65 55h20v20H10V70zm5 5v10h10V75H15zm45 5h10v10H60V80zm10-10h10v10H70V70zm-10-10h10v10H60V60zm20 10h10v20H80V70zm-10 10h10v10H70V80zm-20-10h10v10H50V70zm10-15h10v10H60V55zm-15 0h10v10H45V55zm15-15h10v10H60V40zm15 15h10v10H75V55zm-45 5h10v10H30V60z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                {/* Wallet Details */}
                <div className="space-y-2 text-center sm:text-left w-full">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold">
                    {lang === "id" ? "Alamat Dompet Merchant (Solana)" : "Merchant Solana Wallet"}
                  </div>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <code className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 max-w-[200px] truncate select-all">
                      Guz6jxrmW8744a4k9CLa19SWLdm4HPs4yEefEj6PTje2
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySolanaAddress}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {lang === "id" ? "Harga Upgrade:" : "Upgrade Price:"}{" "}
                    <strong className="text-zinc-850 dark:text-zinc-100 font-bold font-mono">
                      10 USDC / 0.1 SOL (300 Renders)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Solana Network Selector */}
              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                <span className="text-[11px] font-medium text-zinc-400 font-mono uppercase tracking-wider">
                  {lang === "id" ? "Jaringan Blockchain" : "Solana Network"}
                </span>
                <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSolanaNetwork("mainnet-beta")}
                    className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all ${solanaNetwork === "mainnet-beta" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-400 hover:text-zinc-650"}`}
                  >
                    Mainnet
                  </button>
                  <button
                    type="button"
                    onClick={() => setSolanaNetwork("devnet")}
                    className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all ${solanaNetwork === "devnet" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-400 hover:text-zinc-650"}`}
                  >
                    Devnet
                  </button>
                </div>
              </div>

              {/* Transaction Signature Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                  {lang === "id"
                    ? "Signature Transaksi Solana (TxId)"
                    : "Solana Transaction Signature (TxID)"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Contoh: 3a2BcdF... or click Simulate below"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-inner font-mono text-[10px]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  disabled={isVerifyingCrypto}
                  onClick={() => handleVerifyCrypto(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 py-2.5 text-xs font-bold shadow hover:bg-zinc-50 dark:hover:bg-zinc-850 active:scale-98 transition-all cursor-pointer"
                >
                  ⚡ Simulate Upgrade
                </button>
                <button
                  type="button"
                  disabled={isVerifyingCrypto}
                  onClick={() => handleVerifyCrypto(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-extrabold tracking-tight shadow active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isVerifyingCrypto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {lang === "id" ? "Memindai Blockchain..." : "Verifying On-Chain..."}
                    </>
                  ) : (
                    "Verify Solana Payment"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREDIT / DEBIT CARD (MOCK STRIPE SANDBOX) */}
          {activeTab === "card" && (
            <form onSubmit={handleCardSubmit} className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="p-3 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>💳 Stripe KYC Pending:</strong>{" "}
                {lang === "id"
                  ? "Akun merchant sedang diverifikasi. Menggunakan visualisasi simulasi sandbox di bawah. Silakan masukkan nomor kartu sembarang untuk mencoba."
                  : "Merchant account activation pending. Operating under Stripe Sandbox simulation. You can enter any credit card details to test."}
              </div>

              {/* Premium Credit Card Mockup */}
              <div className="relative w-full h-40 rounded-2xl text-white overflow-hidden shadow-xl transition-all duration-300 border border-zinc-700/50 bg-gradient-to-br from-zinc-850 via-zinc-900 to-indigo-950 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-400">
                      VibeShot Studio Premium
                    </span>
                    <div className="text-[10px] font-bold text-zinc-200">PRO MEMBERSHIP</div>
                  </div>
                  {/* Mock Chip */}
                  <div className="w-7 h-5 bg-gradient-to-br from-amber-400 to-amber-200 rounded-md opacity-85" />
                </div>
                <div className="text-sm font-mono tracking-widest text-zinc-100 select-none py-1">
                  {cardNumber || "•••• •••• •••• ••••"}
                </div>
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <div className="text-[7px] uppercase font-mono text-zinc-500">Card Holder</div>
                    <div className="font-mono tracking-wide truncate max-w-[150px] uppercase text-[9px] text-zinc-200">
                      {cardHolder || "CREATIVE STRATEGIST"}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <div className="text-[7px] uppercase font-mono text-zinc-500">Expires</div>
                      <div className="font-mono text-[9px] text-zinc-200">{expiry || "MM/YY"}</div>
                    </div>
                    <div>
                      <div className="text-[7px] uppercase font-mono text-zinc-500">CVV</div>
                      <div className="font-mono text-[9px] text-zinc-200">{cvv || "•••"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block font-semibold">
                    {lang === "id" ? "Nomor Kartu Kredit" : "Card Number"}
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4111 2222 3333 4444"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none transition-all shadow-inner font-mono"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block font-semibold">
                    {lang === "id" ? "Nama Pemilik Kartu" : "Card Holder Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="CREATIVE STRATEGIST"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none transition-all shadow-inner uppercase font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block font-semibold">
                    {lang === "id" ? "Tanggal Kedaluwarsa" : "Expiry Date"}
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none transition-all shadow-inner font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block font-semibold">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={3}
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="123"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none transition-all shadow-inner font-mono text-center"
                  />
                </div>
              </div>

              {/* Link Simulated Card Button */}
              <button
                type="button"
                onClick={() => {
                  if (!cardNumber || !cardHolder || !expiry || !cvv) {
                    toast.error(
                      lang === "id"
                        ? "Semua field kartu wajib diisi untuk menautkan!"
                        : "All card fields are required to link.",
                    );
                    return;
                  }
                  setIsPaymentMethodAdded(true);
                  toast.success(
                    lang === "id"
                      ? "Kartu Kredit disimulasikan & ditautkan sebagai metode pembayaran!"
                      : "Card linked as a simulated payment method!",
                  );
                }}
                className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold shadow border active:scale-98 transition-all cursor-pointer ${isPaymentMethodAdded ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250/20 animate-[pulse_2s_infinite]" : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850"}`}
              >
                {isPaymentMethodAdded ? "🟢 Card Saved" : "🔗 Link Simulated Card"}
              </button>

              {/* Submit Card */}
              <button
                type="submit"
                disabled={isUpgradingCard}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 text-xs font-bold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer mt-2 active:scale-98 disabled:opacity-50"
              >
                {isUpgradingCard ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {lang === "id"
                      ? "Memproses Verifikasi Sandbox..."
                      : "Verifying Sandbox Credit..."}
                  </>
                ) : lang === "id" ? (
                  "Simulasikan Pembayaran Kartu 💳"
                ) : (
                  "Simulate Card Payment 💳"
                )}
              </button>
            </form>
          )}

          {/* TAB 3: MAYAR GATEWAY (MOCK SANDBOX) */}
          {activeTab === "mayar" && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="p-3 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>⚡ Mayar KYC Pending:</strong>{" "}
                {lang === "id"
                  ? "Sistem merchant lokal Mayar sedang dalam tahap peninjauan dokumen resmi. Mengaktifkan visualisasi simulasi sandbox Mayar di bawah. Klik tombol untuk meluncurkan gerbang sandbox."
                  : "Local Mayar merchant credentials under formal document review. Operating in Mayar Sandbox simulation mode. Click below to launch simulated checkout link."}
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl text-center space-y-2">
                <div className="font-mono font-bold text-zinc-700 dark:text-zinc-300 text-xs">
                  VibeShot Pro Upgrade via Mayar
                </div>
                <div className="text-[11px] text-zinc-500">
                  Rp 150.000 (QRIS / Bank VA / Alfamart)
                </div>
                <p className="text-[10px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {lang === "id"
                    ? "Setelah menekan tombol, sistem akan meminta pembuatan checkout link dan mengalihkan Anda ke antarmuka Mayar Mock Simulator."
                    : "Once launched, the system generates a secure transaction token and redirects your browser to Mayar Mock checkout."}
                </p>
              </div>

              <button
                type="button"
                disabled={isUpgradingMayar}
                onClick={handleMayarCheckoutSubmit}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-xs font-extrabold shadow active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isUpgradingMayar ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {lang === "id" ? "Membuat Checkout Token..." : "Initializing Mayar Token..."}
                  </>
                ) : lang === "id" ? (
                  "Luncurkan Mayar Sandbox Checkout →"
                ) : (
                  "Launch Mayar Sandbox Checkout →"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VibeShotPlatform() {
  const [view, setView] = useState<"landing" | "app">("app");
  const [lang, setLang] = useState<"id" | "en">("en");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeEngine, setActiveEngine] = useState<"hybrid" | "clone">("hybrid");
  const workerUrl = "https://vibeshot-backend-ai.zakyjundana.workers.dev/";

  const [productName, setProductName] = useState("");
  const [usp, setUsp] = useState("");
  const [trend, setTrend] = useState("");
  const [tone, setTone] = useState("Comedic");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [pillar, setPillar] = useState("Hiburan / Entertainment");
  const [talent, setTalent] = useState("Creator-Led");
  const [shotCount, setShotCount] = useState(6);
  const [imageModel, setImageModel] = useState("fal-ai/flux/schnell");

  const [refType, setRefType] = useState<string>("link");
  const [refUrl, setRefUrl] = useState("");
  const [refTextDescription, setRefTextDescription] = useState("");
  const [refImageBase64, setRefImageBase64] = useState("");
  const [openSection, setOpenSection] = useState<string>("core");

  const [shots, setShots] = useState<Shot[]>([]);
  const [moodboard, setMoodboard] = useState<string[]>([]);
  const [premiseOverride, setPremiseOverride] = useState<string | null>(null);
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [visualStyle, setVisualStyle] = useState<string>("real-life");
  const [masterIdentity, setMasterIdentity] = useState<{
    talent?: string;
    product?: string;
  } | null>(null);
  const [cloudBriefId, setCloudBriefId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isRenderingVisuals, setIsRenderingVisuals] = useState(false);
  const [loadingShotsImages, setLoadingShotsImages] = useState<Record<string, boolean>>({});
  const [isUpgrading, setIsUpgrading] = useState(false);

  // 🔥 FIX SAKTI FRONTEND: State errorMsg & setErrorMsg resmi dideklarasikan berpasangan!
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [hasResult, setHasResult] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Shared Chat State to preserve context across View transitions
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatExtracted, setChatExtracted] = useState<any>({});
  const [chatAttachedImage, setChatAttachedImage] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<
    "profile" | "billing" | "credit" | "settings"
  >("profile");

  const [profile, setProfile] = useState<{ tier: string; credits: number } | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("tier, credits")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    // Check initial session and cache the token in React state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAccessToken(session?.access_token || "");
    });

    // Keep token in sync whenever auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAccessToken(session?.access_token || "");

      // Pendo Adoption Challenge tracking
      if (session?.user) {
        try {
          (window as any).pendo?.identify({
            visitor: {
              id: session.user.id,
              email: session.user.email || "",
            },
            account: {
              id: "vibeshot-studio-client",
            },
          });
          console.log(
            "Pendo Adoption Challenge — pendo.identify() executed successfully for:",
            session.user.email,
          );
        } catch (pendoErr) {
          console.error("Pendo identification failed:", pendoErr);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateShot = (id: string, field: keyof Shot, value: string) => {
    setShots((prev) => prev.map((shot) => (shot.id === id ? { ...shot, [field]: value } : shot)));
  };

  const removeShot = (id: string) => {
    setShots((prev) => prev.filter((shot) => shot.id !== id));
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
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
            // Pendo Track: Shared brief viewed
            window.pendo?.track("shared_brief_viewed", {
              brief_id: sharedId,
              has_shots: (cloudData.shotlist || []).length > 0,
              shot_count: (cloudData.shotlist || []).length,
              visual_style: cloudData.visual_style || "real-life",
              language: lang,
            });
            setIsGenerating(false);
            return;
          }
        }
      } catch (e) {
        console.error("Cloud Error:", e);
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
        const savedModel = localStorage.getItem("vibeshot_image_model");
        if (savedShots && savedMoodboard) {
          setShots(JSON.parse(savedShots));
          setMoodboard(JSON.parse(savedMoodboard));
          setPremiseOverride(savedPremise);
          setTitleOverride(savedTitle);
          if (savedIdentity) setMasterIdentity(JSON.parse(savedIdentity));
          if (savedStyle) setVisualStyle(savedStyle);
          if (savedCloudId) setCloudBriefId(savedCloudId);
          if (savedEngine) setActiveEngine(savedEngine as any);
          if (savedModel) setImageModel(savedModel);
          setHasResult(true);
          setView("app");
        }
      } catch {
        localStorage.clear();
      }
    };
    loadSharedOrLocalBrief();
  }, []);

  const t = translations[lang] || translations["en"];

  const saveToLocalStorage = (
    newShots: Shot[],
    newMood: string[],
    newPremise: string | null,
    newTitle: string | null,
    newIdentity: any,
    newStyle: string,
    cloudId: string | null,
  ) => {
    localStorage.setItem("vibeshot_shots", JSON.stringify(newShots));
    localStorage.setItem("vibeshot_moodboard", JSON.stringify(newMood));
    if (newPremise) localStorage.setItem("vibeshot_premise", newPremise);
    if (newTitle) localStorage.setItem("vibeshot_title", newTitle);
    if (newIdentity) localStorage.setItem("vibeshot_identity", JSON.stringify(newIdentity));
    if (newStyle) localStorage.setItem("vibeshot_style", newStyle);
    if (cloudId) localStorage.setItem("vibeshot_cloud_id", cloudId);
    localStorage.setItem("vibeshot_active_engine", activeEngine);
    localStorage.setItem("vibeshot_image_model", imageModel);
  };

  const handleClearAll = () => {
    // Capture state before clearing for tracking
    const hadBrief = !!cloudBriefId;
    const hadShots = shots.length > 0;
    const shotCountBeforeClear = shots.length;
    
    localStorage.clear();
    window.history.replaceState({}, document.title, window.location.pathname);
    setShots([]);
    setMoodboard([]);
    setPremiseOverride(null);
    setTitleOverride(null);
    setMasterIdentity(null);
    setCloudBriefId(null);
    setHasResult(false);
    setRefType("link");
    setRefUrl("");
    setRefTextDescription("");
    setRefImageBase64("");
    setImageModel("fal-ai/flux/schnell");
    setView("app");
    
    // Pendo Track: Workspace cleared
    window.pendo?.track("workspace_cleared", {
      had_existing_brief: hadBrief,
      had_existing_shots: hadShots,
      shot_count_before_clear: shotCountBeforeClear,
      language: lang,
    });
    
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
      
      // Pendo Track: Reference image uploaded
      window.pendo?.track("reference_image_uploaded", {
        file_size_bytes: file.size,
        file_type: file.type,
        language: lang,
      });
      
      toast.success(lang === "id" ? "Aset visual terkunci." : "Visual asset cached.");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    const token = accessToken;
    if (!token) {
      toast.error(
        lang === "id"
          ? "Autentikasi diperlukan. Silakan masuk terlebih dahulu!"
          : "Authentication required. Please log in first!",
      );
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    setIsGenerating(true);
    setErrorMsg(null);
    setHasResult(false);
    const requestPayload = {
      engineMode: activeEngine,
      product: productName || "General Campaign Brand",
      usp: usp || "Buat adegan sekreatif mungkin",
      trend: trend,
      tone: activeEngine === "clone" ? "Matches Reference Pacing" : tone,
      shotCount: shotCount,
      platform: platform,
      pillar: pillar,
      talent: talent,
      refType: refType,
      refUrl: refUrl,
      refTextDescription: refTextDescription,
      refImageBase64: refImageBase64,
    };
    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      saveToLocalStorage(
        normalized,
        data.moodboard || [],
        data.premise,
        data.title,
        data.master_identity,
        data.visual_style,
        data.briefId || null,
      );
      
      // Pendo Track: Brief generated successfully
      window.pendo?.track("brief_generated", {
        engine_mode: activeEngine,
        platform: platform,
        pillar: pillar,
        talent: talent,
        shot_count: shotCount,
        ref_type: refType,
        image_model: imageModel,
        visual_style: data.visual_style || "real-life",
        has_product_name: !!productName,
        has_usp: !!usp,
        has_trend: !!trend,
        brief_id: data.briefId || "",
        language: lang,
      });
      
      toast.success(lang === "id" ? "Brief berhasil diracik!" : "Brief successfully compiled!");
    } catch (err: any) {
      setErrorMsg(err.message);
      toast.error(err.message);
      
      // Pendo Track: Brief generation failed
      window.pendo?.track("brief_generation_failed", {
        error_message: String(err.message).substring(0, 100),
        engine_mode: activeEngine,
        platform: platform,
        ref_type: refType,
        shot_count: shotCount,
        language: lang,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromChat = async (params: any) => {
    const token = accessToken;
    if (!token) {
      toast.error(
        lang === "id"
          ? "Autentikasi diperlukan. Silakan masuk terlebih dahulu!"
          : "Authentication required. Please log in first!",
      );
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }

    setProductName(params.product || "");
    setUsp(params.usp || "");
    if (params.tone) setTone(params.tone);
    if (params.visualStyle) setVisualStyle(params.visualStyle);
    if (params.platform) setPlatform(params.platform);
    if (params.shotCount) setShotCount(params.shotCount);
    if (params.talent) setTalent(params.talent);
    if (params.refUrl) setRefUrl(params.refUrl);

    setIsGenerating(true);
    setErrorMsg(null);
    setHasResult(false);
    const requestPayload = {
      engineMode: "hybrid",
      product: params.product || "General Campaign Brand",
      usp: params.usp || "Buat adegan sekreatif mungkin",
      trend: "",
      tone: params.tone || "Cinematic Inspirational",
      shotCount: params.shotCount || 6,
      platform: params.platform || "Instagram Reels",
      pillar: "Hiburan / Entertainment",
      talent: params.talent || "Creator-Led",
      refType: params.refUrl ? "link" : "none",
      refUrl: params.refUrl || "",
      refTextDescription: "",
      refImageBase64: "",
    };

    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      saveToLocalStorage(
        normalized,
        data.moodboard || [],
        data.premise,
        data.title,
        data.master_identity,
        data.visual_style,
        data.briefId || null,
      );
      toast.success(lang === "id" ? "Brief berhasil diracik!" : "Brief successfully compiled!");
      return data.briefId;
    } catch (err: any) {
      setErrorMsg(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBriefUpdated = async (updatedData: any) => {
    if (!updatedData) return;

    const normalized = (updatedData.shotlist || []).map((r: any, idx: number) => {
      const existing = shots[idx];
      return {
        id: existing?.id || crypto.randomUUID(),
        angle: String(r?.angle || ""),
        location: String(r?.location || ""),
        tech_budget_hack: String(r?.tech_budget_hack || ""),
        action: String(r?.action || ""),
        audio: String(r?.audio || ""),
        // Keep old image temporarily — will be regenerated below if shot already had one
        image: r?.image || existing?.image || "",
        imagePrompt: String(r?.imagePrompt || existing?.imagePrompt || ""),
        imageModel: r?.imageModel || existing?.imageModel || "",
      };
    });

    setShots(normalized);
    setMoodboard(updatedData.moodboard || normalized.map((s: any) => s.image || ""));
    setPremiseOverride(updatedData.premise || null);
    setTitleOverride(updatedData.title || null);
    setMasterIdentity(updatedData.master_identity || null);
    setVisualStyle(updatedData.visual_style || "real-life");

    saveToLocalStorage(
      normalized,
      updatedData.moodboard || normalized.map((s: any) => s.image || ""),
      updatedData.premise || null,
      updatedData.title || null,
      updatedData.master_identity || null,
      updatedData.visual_style || "real-life",
      cloudBriefId,
    );

    // Detect which shots already had images — auto-regenerate with updated imagePrompt
    const shotsWithImages = normalized.filter((s: any) => s.image && s.imagePrompt);
    if (shotsWithImages.length > 0 && cloudBriefId && accessToken) {
      toast.info(
        lang === "id"
          ? `✨ Storyboard diupdate! Auto-regenerate ${shotsWithImages.length} visual sesuai perubahan...`
          : `✨ Storyboard updated! Auto-regenerating ${shotsWithImages.length} visuals with new context...`,
        { duration: 5000 },
      );
      // Regenerate images sequentially to avoid overloading the API
      for (const shot of shotsWithImages) {
        try {
          setLoadingShotsImages((prev) => ({ ...prev, [shot.id]: true }));
          const res = await fetch(workerUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              action: "render_single_image",
              briefId: cloudBriefId,
              visual_style: updatedData.visual_style || visualStyle,
              singleShotId: shot.id,
              shotToGenerate: shot,
              masterIdentity: updatedData.master_identity || masterIdentity,
              imageModel: imageModel,
            }),
          });
          const data = await res.json();
          if (res.ok && data.imageUrl) {
            setShots((prev) =>
              prev.map((s) => (s.id === shot.id ? { ...s, image: data.imageUrl } : s)),
            );
            setMoodboard((prev) =>
              prev.map((img, idx) => {
                const shotAtIdx = normalized[idx];
                return shotAtIdx?.id === shot.id ? data.imageUrl : img;
              }),
            );
          }
        } catch {
          // silently skip failed renders
        } finally {
          setLoadingShotsImages((prev) => ({ ...prev, [shot.id]: false }));
        }
      }
      toast.success(
        lang === "id" ? "🎬 Semua visual berhasil diperbarui!" : "🎬 All visuals updated!",
      );
    } else {
      toast.success(
        lang === "id"
          ? "✨ Adegan storyboard berhasil diupdate via AI Chat!"
          : "✨ Storyboard updated live via AI Chat!",
      );
    }
  };

  const onLoadBrief = async (briefId: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${workerUrl}?id=${briefId}`);
      if (res.ok) {
        const cloudData = await res.json();
        setShots(cloudData.shotlist || []);
        setMoodboard(cloudData.moodboard || []);
        setPremiseOverride(cloudData.premise);
        setTitleOverride(cloudData.title);
        setMasterIdentity(cloudData.master_identity);
        setVisualStyle(cloudData.visual_style || "real-life");
        setCloudBriefId(briefId);
        setHasResult(true);
        saveToLocalStorage(
          cloudData.shotlist || [],
          cloudData.moodboard || [],
          cloudData.premise,
          cloudData.title,
          cloudData.master_identity,
          cloudData.visual_style,
          briefId,
        );
      } else {
        toast.error("Gagal memuat brief cloud.");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMassExecuteImages = async () => {
    const token = accessToken;
    if (!token) {
      toast.error(
        lang === "id"
          ? "Autentikasi diperlukan. Silakan masuk terlebih dahulu!"
          : "Authentication required. Please log in first!",
      );
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    setIsRenderingVisuals(true);
    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "render_images",
          briefId: cloudBriefId,
          title: titleOverride,
          premise: premiseOverride,
          visual_style: visualStyle,
          masterIdentity: masterIdentity,
          shotlist: shots,
          imageModel: imageModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error rendering images.");
      const updatedWithImages = (data.shotlist || []).map((r: any, idx: number) => ({
        ...shots[idx],
        image: String(r?.image || ""),
        imagePrompt: String(r?.imagePrompt || shots[idx].imagePrompt),
      }));
      setShots(updatedWithImages);
      setMoodboard(data.moodboard || []);
      saveToLocalStorage(
        updatedWithImages,
        data.moodboard || [],
        premiseOverride,
        titleOverride,
        masterIdentity,
        visualStyle,
        cloudBriefId,
      );
      
      // Pendo Track: Bulk images rendered
      window.pendo?.track("bulk_images_rendered", {
        brief_id: cloudBriefId || "",
        shot_count: shots.length,
        visual_style: visualStyle,
        image_model: imageModel,
        language: lang,
      });
      
      toast.success(
        lang === "id" ? "Semua frame visual berhasil dirender!" : "All visual frames rendered!",
      );
    } catch (err: any) {
      toast.error(err.message);
      
      // Pendo Track: Image rendering failed (bulk)
      window.pendo?.track("image_rendering_failed", {
        render_type: "bulk",
        error_message: String(err.message).substring(0, 100),
        brief_id: cloudBriefId || "",
        shot_count: shots.length,
        language: lang,
      });
    } finally {
      setIsRenderingVisuals(false);
    }
  };

  const handleLanjutkanCerita = async () => {
    const token = accessToken;
    if (!token) {
      toast.error(
        lang === "id"
          ? "Autentikasi diperlukan. Silakan masuk terlebih dahulu!"
          : "Authentication required. Please log in first!",
      );
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    setIsContinuing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          engineMode: activeEngine,
          product: productName || "Analyzed Reference Video",
          usp: usp,
          trend,
          tone,
          shotCount: shotCount || 3,
          platform,
          pillar,
          talent,
          isContinuation: true,
          existingShots: shots,
          masterIdentity: masterIdentity,
          title: titleOverride,
          visual_style: visualStyle,
          refType,
          refUrl,
          refTextDescription,
          refImageBase64,
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
      saveToLocalStorage(
        finalShots,
        finalMood,
        finalPremise,
        titleOverride,
        masterIdentity,
        visualStyle,
        data.briefId || cloudBriefId,
      );
      
      // Pendo Track: Story timeline extended
      window.pendo?.track("story_timeline_extended", {
        brief_id: data.briefId || cloudBriefId || "",
        previous_shot_count: shots.length,
        added_shot_count: normalizedNewShots.length,
        final_shot_count: finalShots.length,
        language: lang,
      });
      
      toast.success(
        lang === "id"
          ? "Alur berhasil disambung secara inline!"
          : "Timeline extended inline successfully!",
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsContinuing(false);
    }
  };

  const handleExportSlides = () => {
    if (shots.length === 0) {
      toast.error(
        lang === "id" ? "Tidak ada storyboard untuk diekspor!" : "No storyboard to export!",
      );
      return;
    }
    toast.info(
      lang === "id"
        ? "Membuka menu cetak... Pilih opsi 'Landscape', 'A4', dan aktifkan 'Background graphics' untuk hasil terbaik!"
        : "Opening print menu... Choose 'Landscape', 'A4', and enable 'Background graphics' for best results!",
      { duration: 6000 },
    );
    setTimeout(() => {
      window.print();
    }, 800);
  };

  const handleExportPptx = async () => {
    if (shots.length === 0) {
      toast.error(
        lang === "id" ? "Tidak ada storyboard untuk diekspor!" : "No storyboard to export!",
      );
      return;
    }
    const toastId = toast.loading(
      lang === "id" ? "Menyiapkan file .pptx..." : "Preparing .pptx file...",
    );
    try {
      const pptx = new pptxgen();
      pptx.layout = "LAYOUT_WIDE"; // 16:9 widescreen
      pptx.author = "VibeShot AI";
      pptx.subject = "Storyboard & Shotlist";

      // ── SLIDE 1: Cover ──────────────────────────────────────────
      const cover = pptx.addSlide();
      cover.background = { color: "09090b" };

      // Gradient accent bar
      cover.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: "100%",
        h: 0.18,
        fill: { color: "6366f1" },
        line: { color: "6366f1" },
      });

      // VibeShot label
      cover.addText("VIBESHOT AI", {
        x: 0.6,
        y: 0.5,
        w: "90%",
        h: 0.4,
        fontSize: 10,
        color: "6366f1",
        bold: true,
        fontFace: "Arial",
        charSpacing: 4,
      });

      // Title from brief
      const coverTitle =
        titleOverride ||
        productName ||
        (lang === "id" ? "Storyboard Konten" : "Content Storyboard");
      cover.addText(coverTitle, {
        x: 0.6,
        y: 1.1,
        w: "90%",
        h: 1.2,
        fontSize: 36,
        color: "ffffff",
        bold: true,
        fontFace: "Arial",
        breakLine: false,
      });

      // Premise
      if (premiseOverride) {
        const premiseText =
          premiseOverride.length > 400
            ? premiseOverride.substring(0, 400) + "..."
            : premiseOverride;
        cover.addText(premiseText, {
          x: 0.6,
          y: 2.6,
          w: "88%",
          h: 2.0,
          fontSize: 11,
          color: "a1a1aa",
          fontFace: "Arial",
          valign: "top",
          breakLine: true,
        });
      }

      // Meta info row
      const metaItems = [
        platform ? `Platform: ${platform}` : null,
        tone ? `Tone: ${tone}` : null,
        visualStyle ? `Style: ${visualStyle}` : null,
        `${shots.length} shots`,
      ]
        .filter(Boolean)
        .join("  ·  ");

      cover.addText(metaItems, {
        x: 0.6,
        y: 4.8,
        w: "90%",
        h: 0.4,
        fontSize: 9,
        color: "52525b",
        fontFace: "Arial",
        bold: true,
        charSpacing: 1,
      });

      // ── CONTENT SLIDES: 6 shots per slide ───────────────────────
      const SHOTS_PER_SLIDE = 6;
      for (let i = 0; i < shots.length; i += SHOTS_PER_SLIDE) {
        const chunk = shots.slice(i, i + SHOTS_PER_SLIDE);
        const slideNum = Math.floor(i / SHOTS_PER_SLIDE) + 1;
        const totalSlides = Math.ceil(shots.length / SHOTS_PER_SLIDE);

        const slide = pptx.addSlide();
        slide.background = { color: "ffffff" };

        // Top accent bar
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: "100%",
          h: 0.12,
          fill: { color: "6366f1" },
          line: { color: "6366f1" },
        });

        // Slide header
        slide.addText(`STORYBOARD & SHOTLIST — ${(coverTitle || "").toUpperCase()}`, {
          x: 0.35,
          y: 0.22,
          w: 7.5,
          h: 0.28,
          fontSize: 7,
          color: "3f3f46",
          bold: true,
          fontFace: "Arial",
          charSpacing: 2,
        });
        slide.addText(`SLIDE ${slideNum + 1} / ${totalSlides + 1}`, {
          x: 8.5,
          y: 0.22,
          w: 1.5,
          h: 0.28,
          fontSize: 7,
          color: "a1a1aa",
          bold: true,
          fontFace: "Arial",
          align: "right",
        });

        // Divider
        slide.addShape(pptx.ShapeType.line, {
          x: 0.35,
          y: 0.58,
          w: 9.6,
          h: 0,
          line: { color: "e4e4e7", width: 0.5 },
        });

        // 6 shot cards in a row
        const CARD_W = 1.52;
        const CARD_H = 4.7;
        const CARD_GAP = 0.08;
        const START_X = 0.2;
        const START_Y = 0.72;
        const FRAME_H = CARD_W * (16 / 9); // strict 9:16 → height from width

        chunk.forEach((shot, idx) => {
          const shotNum = i + idx + 1;
          const cx = START_X + idx * (CARD_W + CARD_GAP);
          const cy = START_Y;

          // Card background
          slide.addShape(pptx.ShapeType.rect, {
            x: cx,
            y: cy,
            w: CARD_W,
            h: CARD_H,
            fill: { color: "fafafa" },
            line: { color: "e4e4e7", width: 0.5 },
            rectRadius: 0.08,
          });

          // Shot number badge
          slide.addShape(pptx.ShapeType.rect, {
            x: cx + 0.07,
            y: cy + 0.07,
            w: 0.32,
            h: 0.2,
            fill: { color: "09090b" },
            line: { color: "09090b" },
            rectRadius: 0.04,
          });
          slide.addText(String(shotNum).padStart(2, "0"), {
            x: cx + 0.07,
            y: cy + 0.07,
            w: 0.32,
            h: 0.2,
            fontSize: 6.5,
            color: "ffffff",
            bold: true,
            fontFace: "Courier New",
            align: "center",
            valign: "middle",
          });

          // 9:16 visual frame
          const frameY = cy + 0.35;
          if (shot.image) {
            try {
              const isBase64 = shot.image.startsWith("data:");
              slide.addImage({
                path: isBase64 ? undefined : shot.image,
                data: isBase64 ? shot.image : undefined,
                x: cx + 0.06,
                y: frameY,
                w: CARD_W - 0.12,
                h: FRAME_H,
                sizing: { type: "cover", w: CARD_W - 0.12, h: FRAME_H },
              });
            } catch {
              // fallback if image data fails
              slide.addShape(pptx.ShapeType.rect, {
                x: cx + 0.06,
                y: frameY,
                w: CARD_W - 0.12,
                h: FRAME_H,
                fill: { color: "e4e4e7" },
                line: { color: "d4d4d8" },
              });
            }
          } else {
            slide.addShape(pptx.ShapeType.rect, {
              x: cx + 0.06,
              y: frameY,
              w: CARD_W - 0.12,
              h: FRAME_H,
              fill: { color: "f0f0f2" },
              line: { color: "d4d4d8" },
            });
            slide.addText("No Visual", {
              x: cx + 0.06,
              y: frameY + FRAME_H / 2 - 0.1,
              w: CARD_W - 0.12,
              h: 0.2,
              fontSize: 6,
              color: "a1a1aa",
              align: "center",
              fontFace: "Arial",
            });
          }

          // Text content below frame
          const textY = frameY + FRAME_H + 0.1;
          // Camera angle label
          slide.addText("SHOTLIST:", {
            x: cx + 0.07,
            y: textY,
            w: CARD_W - 0.14,
            h: 0.16,
            fontSize: 5.5,
            color: "18181b",
            bold: true,
            fontFace: "Arial",
            charSpacing: 1,
          });
          slide.addText(shot.angle || "", {
            x: cx + 0.07,
            y: textY + 0.17,
            w: CARD_W - 0.14,
            h: 0.22,
            fontSize: 6,
            color: "3f3f46",
            bold: true,
            italic: true,
            fontFace: "Arial",
          });
          // Action description
          slide.addText(shot.action || "", {
            x: cx + 0.07,
            y: textY + 0.42,
            w: CARD_W - 0.14,
            h: 0.55,
            fontSize: 5.5,
            color: "52525b",
            fontFace: "Arial",
            valign: "top",
            breakLine: true,
          });
        });
      }

      // Download the file
      const safeName = (coverTitle || "vibeshot-storyboard")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      await pptx.writeFile({ fileName: `${safeName}.pptx` });
      toast.dismiss(toastId);
      toast.success(
        lang === "id"
          ? "File .pptx berhasil didownload! Buka di Google Slides → File → Buka."
          : "PPTX downloaded! Open in Google Slides → File → Open.",
        { duration: 6000 },
      );
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Export failed.");
    }
  };

  const handleShareLink = () => {
    if (!cloudBriefId) {
      toast.error("Cloud ID missing.");
      return;
    }
    navigator.clipboard.writeText(
      `${window.location.origin}${window.location.pathname}?id=${cloudBriefId}`,
    );
    // Pendo Track: Brief shared
    window.pendo?.track("brief_shared", {
      brief_id: cloudBriefId,
      shot_count: shots.length,
      language: lang,
    });
    toast.success(t.shareSuccess);
  };

  const handleCopyTable = async () => {
    if (shots.length === 0) return;
    let htmlString = `<table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; width: 100%;"><tr style="background-color: #18181b; color: #ffffff; font-weight: bold;"><th>#</th><th>Camera Angle</th><th>Location</th><th>Action / Visual</th><th>Audio / VO</th></tr>`;
    shots.forEach((s, idx) => {
      htmlString += `<tr><td style="text-align: center; padding: 8px;">${idx + 1}</td><td>${s.angle}</td><td>${s.location}</td><td>${s.action}</td><td>${s.audio}</td></tr>`;
    });
    htmlString += `</table>`;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([htmlString], { type: "text/html" }) }),
      ]);
      
      // Pendo Track: Production table exported
      window.pendo?.track("production_table_exported", {
        brief_id: cloudBriefId || "",
        shot_count: shots.length,
        language: lang,
      });
      
      toast.success(lang === "id" ? "Struktur tabel berhasil disalin!" : "Table layout copied!");
    } catch {
      toast.error("Copy failed.");
    }
  };

  const handleOpenUpgradeModal = () => {
    if (!user) {
      toast.error(lang === "id" ? "Silakan login terlebih dahulu!" : "Please log in first!");
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    setIsUpgradeModalOpen(true);
  };

  const handleExecuteSingleImage = async (shot: Shot) => {
    const token = accessToken;
    if (!token) {
      toast.error(
        lang === "id"
          ? "Autentikasi diperlukan. Silakan masuk terlebih dahulu!"
          : "Authentication required. Please log in first!",
      );
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    if (!cloudBriefId) {
      toast.error("KV Cloud ID missing. Selesaikan Phase 1 dulu, Cok.");
      return;
    }
    setLoadingShotsImages((prev) => ({ ...prev, [shot.id]: true }));
    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "render_single_image",
          briefId: cloudBriefId,
          visual_style: visualStyle,
          singleShotId: shot.id,
          shotToGenerate: shot,
          masterIdentity: masterIdentity,
          imageModel: imageModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error rendering single.");
      const nextShots = shots.map((s) => (s.id === shot.id ? { ...s, image: data.imageUrl } : s));
      const nextMood = nextShots.map((s) => s.image || "");
      updateShot(shot.id, "image", data.imageUrl);
      setMoodboard(nextMood);
      saveToLocalStorage(
        nextShots,
        nextMood,
        premiseOverride,
        titleOverride,
        masterIdentity,
        visualStyle,
        cloudBriefId,
      );
      
      // Pendo Track: Single image rendered
      window.pendo?.track("single_image_rendered", {
        brief_id: cloudBriefId,
        shot_id: shot.id,
        visual_style: visualStyle,
        image_model: imageModel,
        language: lang,
      });
      
      toast.success(lang === "id" ? "Visual adegan berhasil dirender!" : "Visual frame generated!");
    } catch (err: any) {
      toast.error(err.message);
      
      // Pendo Track: Image rendering failed (single)
      window.pendo?.track("image_rendering_failed", {
        render_type: "single",
        error_message: String(err.message).substring(0, 100),
        brief_id: cloudBriefId || "",
        shot_id: shot.id,
        language: lang,
      });
    } finally {
      setLoadingShotsImages((prev) => ({ ...prev, [shot.id]: false }));
    }
  };

  const moodboardTiles = useMemo(() => {
    const list = shots.map((s) => s.image || null);
    if (list.some((img) => img !== null)) return list;
    return Array.from({ length: shots.length || shotCount }).map(() => null);
  }, [shots, shotCount]);

  const isTextOnlyBrief = useMemo(() => shots.length > 0 && shots.every((s) => !s.image), [shots]);

  const shotChunks = useMemo(() => {
    const chunks: Shot[][] = [];
    for (let i = 0; i < shots.length; i += 6) {
      chunks.push(shots.slice(i, i + 6));
    }
    return chunks;
  }, [shots]);
  const inputStyle =
    "w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none transition-colors";
  const hybridActiveStyle =
    activeEngine === "hybrid"
      ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white"
      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600";
  const cloneActiveStyle =
    activeEngine === "clone"
      ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white"
      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600";

  if (view === "landing")
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors duration-200">
        <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-[10px] font-bold">
              V
            </div>
            <span className="text-xs font-semibold tracking-tight">vibeshot.studio</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 border-r border-zinc-200 dark:border-zinc-700 pr-4">
              <CustomSwitch
                isOn={lang === "id"}
                onToggle={() => setLang(lang === "en" ? "id" : "en")}
                labelOff="EN"
                labelOn="ID"
              />
              <CustomSwitch
                isOn={isDarkMode}
                onToggle={() => setIsDarkMode(!isDarkMode)}
                IconOff={Sun}
                IconOn={Moon}
              />
            </div>
            {user ? (
              <div className="flex items-center gap-3 animate-fade-in">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800 text-[10px] text-zinc-655 dark:text-zinc-350 font-mono transition-all cursor-pointer shadow-sm">
                      <User className="h-2.5 w-2.5 text-zinc-450" />
                      <span>{user.email}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-white dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                  >
                    <DropdownMenuLabel className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      {lang === "id" ? "Menu Akun" : "Account Menu"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-800/80" />
                    <DropdownMenuItem
                      onClick={() => {
                        setSettingsModalTab("profile");
                        setIsSettingsModalOpen(true);
                      }}
                      className="cursor-pointer text-xs flex items-center gap-2"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>{lang === "id" ? "Profil Saya" : "My Profile"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSettingsModalTab("billing");
                        setIsSettingsModalOpen(true);
                      }}
                      className="cursor-pointer text-xs flex items-center gap-2"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>{lang === "id" ? "Tagihan & Pembayaran" : "Billing & Payments"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSettingsModalTab("credit");
                        setIsSettingsModalOpen(true);
                      }}
                      className="cursor-pointer text-xs flex items-center gap-2"
                    >
                      <Coins className="h-3.5 w-3.5" />
                      <span>{lang === "id" ? "Kredit Penggunaan" : "Usage Credits"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSettingsModalTab("settings");
                        setIsSettingsModalOpen(true);
                      }}
                      className="cursor-pointer text-xs flex items-center gap-2"
                    >
                      <SettingsIcon className="h-3.5 w-3.5" />
                      <span>{lang === "id" ? "Pengaturan Aplikasi" : "App Settings"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-800/80" />
                    <DropdownMenuItem
                      onClick={() => supabase.auth.signOut()}
                      className="cursor-pointer text-xs text-red-500 focus:text-red-500 flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{t.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={() => setView("app")}
                  className="text-xs font-medium bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-colors shadow-sm cursor-pointer"
                >
                  Launch Studio →
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setAuthModalMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 py-1.5 cursor-pointer"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode("signup");
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs font-medium bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-colors shadow-sm cursor-pointer"
                >
                  {t.signup}
                </button>
              </div>
            )}
          </div>
        </nav>
        <header className="mx-auto max-w-3xl text-center px-6 pt-20 pb-16 space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 px-3 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            <Sparkles className="h-3 w-3 text-zinc-400 dark:text-zinc-500" /> Private Beta Engine
            Active
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Turn messy script ideas into crystal-clear production briefs.
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
            The automated workspace built for Creative Strategists and Agency Workers. Translate
            loose briefs and visual references into word-for-word scripts, moodboards, and
            interactive storyboards in 60 seconds.
          </p>
          <div className="pt-2">
            {user ? (
              <button
                onClick={() => setView("app")}
                className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs px-5 py-3 rounded-lg shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                Launch Studio Workspace <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setAuthModalMode("signup");
                    setIsAuthModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-xs px-5 py-3 rounded-lg shadow hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Get Started for Free <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setView("app")}
                  className="text-xs font-mono font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors py-2 px-3 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-lg cursor-pointer"
                >
                  {t.guestMode}
                </button>
              </div>
            )}
          </div>
        </header>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          lang={lang}
          t={t}
          initialMode={authModalMode}
        />
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          accessToken={accessToken}
          user={user}
          lang={lang}
          t={t}
          workerUrl={workerUrl}
          profile={profile}
          onProfileUpdated={fetchProfile}
        />
        <AccountSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          user={user}
          profile={profile}
          onProfileUpdated={fetchProfile}
          lang={lang}
          initialTab={settingsModalTab}
        />
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] font-sans text-zinc-900 dark:text-zinc-100 antialiased transition-colors duration-200 print:hidden">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#111111] px-6 py-2.5 gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("landing")}
              className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-[10px] font-bold transition-colors"
            >
              V
            </button>
            <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">/</span>
            <span className="text-xs font-medium tracking-tight">vibeshot.studio/workspace</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-4 border-r border-zinc-200 dark:border-zinc-700 pr-3">
              <CustomSwitch
                isOn={lang === "id"}
                onToggle={() => setLang(lang === "en" ? "id" : "en")}
                labelOff="EN"
                labelOn="ID"
              />
              <CustomSwitch
                isOn={isDarkMode}
                onToggle={() => setIsDarkMode(!isDarkMode)}
                IconOff={Sun}
                IconOn={Moon}
              />
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono transition-all cursor-pointer shadow-sm">
                        <User className="h-2.5 w-2.5 text-zinc-450" />
                        <span>{user.email}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-white dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                    >
                      <DropdownMenuLabel className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        {lang === "id" ? "Menu Akun" : "Account Menu"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-800/80" />
                      <DropdownMenuItem
                        onClick={() => {
                          setSettingsModalTab("profile");
                          setIsSettingsModalOpen(true);
                        }}
                        className="cursor-pointer text-xs flex items-center gap-2"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>{lang === "id" ? "Profil Saya" : "My Profile"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSettingsModalTab("billing");
                          setIsSettingsModalOpen(true);
                        }}
                        className="cursor-pointer text-xs flex items-center gap-2"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>{lang === "id" ? "Tagihan & Pembayaran" : "Billing & Payments"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSettingsModalTab("credit");
                          setIsSettingsModalOpen(true);
                        }}
                        className="cursor-pointer text-xs flex items-center gap-2"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        <span>{lang === "id" ? "Kredit Penggunaan" : "Usage Credits"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSettingsModalTab("settings");
                          setIsSettingsModalOpen(true);
                        }}
                        className="cursor-pointer text-xs flex items-center gap-2"
                      >
                        <SettingsIcon className="h-3.5 w-3.5" />
                        <span>{lang === "id" ? "Pengaturan Aplikasi" : "App Settings"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-800/80" />
                      <DropdownMenuItem
                        onClick={() => supabase.auth.signOut()}
                        className="cursor-pointer text-xs text-red-500 focus:text-red-500 flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{t.logout}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {profile && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-55/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-[10px] font-mono text-emerald-600 dark:text-emerald-450 uppercase font-extrabold animate-[fadeIn_0.3s_ease-out]">
                      {profile.tier === "premium"
                        ? "Pro 🚀"
                        : profile.tier === "free-active"
                          ? "Active Free 🎁"
                          : "Inactive Free 🔒"}
                      <span className="opacity-40 font-normal">|</span>
                      <span>{profile.credits} Renders</span>
                    </div>
                  )}
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="text-[10px] font-bold text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-mono uppercase cursor-pointer"
                  >
                    [{t.logout}]
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-650 dark:hover:text-indigo-300 transition-colors font-mono uppercase cursor-pointer"
                >
                  [{t.login}]
                </button>
              )}
              <span className="text-zinc-200 dark:text-zinc-700 font-mono text-xs">|</span>
              {hasResult ? (
                <button
                  onClick={() => setHasResult(false)}
                  className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  {lang === "id" ? "← Kembali ke Chat" : "← Back to Chat"}
                </button>
              ) : (
                <button
                  onClick={() => setView("landing")}
                  className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  {t.backToHome}
                </button>
              )}
              {hasResult && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  {t.resetProject}
                </button>
              )}
              <span className="text-zinc-200 dark:text-zinc-700 font-mono text-xs">|</span>
              {(!profile || profile.tier !== "premium") && (
                <button
                  onClick={handleOpenUpgradeModal}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer inline-flex items-center gap-1 hover:scale-105 transition-transform animate-pulse"
                >
                  Upgrade Pro 🚀
                </button>
              )}
            </div>
          </div>
        </header>

        {hasResult ? (
          <div className="grid min-h-[calc(100vh-42px)] grid-cols-1 lg:grid-cols-[380px_1fr] animate-[fadeIn_0.3s_ease-out]">
            <div className="border-r border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-[#111111] lg:sticky lg:top-[42px] lg:h-[calc(100vh-42px)] shadow-sm">
              <ChatInterface
                user={user}
                accessToken={accessToken}
                lang={lang}
                workerUrl={workerUrl}
                onGenerateStoryboard={handleGenerateFromChat}
                isGeneratingStoryboard={isGenerating}
                onLoadBrief={onLoadBrief}
                isDocked={true}
                onBriefUpdated={handleBriefUpdated}
                activeShots={shots.length > 0 ? shots : undefined}
                sessions={chatSessions}
                setSessions={setChatSessions}
                currentSession={currentChatSession}
                setCurrentSession={setCurrentChatSession}
                messages={chatMessages}
                setMessages={setChatMessages}
                extracted={chatExtracted}
                setExtracted={setChatExtracted}
                attachedImage={chatAttachedImage}
                setAttachedImage={setChatAttachedImage}
              />
            </div>

            <main className="p-6 lg:p-10 overflow-y-auto max-h-[calc(100vh-42px)] bg-[#fafafa] dark:bg-[#0a0a0a]">
              <div className="mx-auto max-w-4xl space-y-8">
                <div className="pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    {titleOverride || t.papanStrategi}
                  </h2>
                  {hasResult && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {cloudBriefId && (
                        <button
                          type="button"
                          onClick={handleShareLink}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-650/10 hover:bg-indigo-650/15 text-indigo-650 dark:text-indigo-300 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-xs font-semibold transition shadow-sm cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5" /> {t.btnShare}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleExportPptx}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold transition shadow-sm cursor-pointer hover:scale-105 active:scale-95 duration-100"
                      >
                        <Film className="w-3.5 h-3.5" />{" "}
                        {lang === "id" ? "Ekspor .pptx 📊" : "Export .pptx 📊"}
                      </button>
                    </div>
                  )}
                </div>
                {isTextOnlyBrief && (
                  <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        💡 Teks Naskah Berhasil Di-sadur!
                      </h3>
                      <p className="text-xs text-zinc-100 mt-0.5">
                        Silakan periksa spesifikasi sheets di bawah. Jika mau render visual massal
                        sekaligus, langsung klik tombol kanan.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleMassExecuteImages}
                      disabled={isRenderingVisuals}
                      className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-4 py-2 text-xs rounded-lg transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isRenderingVisuals ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                          {t.btnRenderingVisualMassal}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />{" "}
                          {t.btnRenderVisualMassal}
                        </>
                      )}
                    </button>
                  </div>
                )}
                <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#111111] p-5 shadow-sm space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                    {t.premisNaratif}
                  </span>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans">
                    {premiseOverride || t.premisPlaceholder}
                  </p>
                </div>
                {!isTextOnlyBrief && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                      {t.panelKontinuitas}
                    </span>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                      {moodboardTiles.map((src, i) => (
                        <div
                          key={i}
                          className="group relative aspect-[9/16] overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
                        >
                          {src ? (
                            <SimpleAIImage
                              src={src}
                              index={i}
                              alt={`Shot ${i + 1}`}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onClick={() => setPreviewImage(src)}
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600">
                              <ImageIcon className="h-4 w-4" />
                              <span className="text-[9px] font-mono uppercase">Shot {i + 1}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {t.garisWaktu} ({shots.length} Sequence)
                    </span>
                    {hasResult && (
                      <button
                        type="button"
                        onClick={handleCopyTable}
                        className="inline-flex items-center gap-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 transition hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm cursor-pointer"
                      >
                        <Copy className="h-3 w-3" /> {t.salinTabel}
                      </button>
                    )}
                  </div>
                  {shots.length === 0 ? (
                    <div className="py-12 border border-dashed border-zinc-200 dark:border-dashed dark:border-zinc-800 bg-white dark:bg-[#111111] text-center rounded-xl text-xs text-zinc-400 dark:text-zinc-600 font-mono">
                      {t.belumAda}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shots.map((s, idx) => (
                        <ShotCard
                          key={s.id}
                          shot={s}
                          index={idx}
                          t={t}
                          lang={lang}
                          updateShot={updateShot}
                          removeShot={removeShot}
                          handleExecuteSingleImage={handleExecuteSingleImage}
                          loadingSingleImage={loadingShotsImages[s.id]}
                          setPreviewImage={setPreviewImage}
                          masterIdentity={masterIdentity}
                        />
                      ))}
                    </div>
                  )}
                  {hasResult && (
                    <div className="pt-6 pb-2 text-center flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                        <span>{lang === "id" ? "Berapa shot kelanjutan?" : "Extension size:"}</span>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={shotCount}
                          onChange={(e) => setShotCount(parseInt(e.target.value || "3", 10))}
                          className="w-16 bg-white dark:bg-zinc-800 rounded px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 text-center font-bold text-zinc-800 dark:text-zinc-100"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleLanjutkanCerita}
                        disabled={isContinuing}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer transform active:scale-95 duration-100"
                      >
                        {isContinuing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.btnExtending}
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="h-3.5 w-3.5" />{" "}
                            <span>
                              {t.btnExtend} (+{shotCount} Shots)
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        ) : (
          <div className="relative min-h-[calc(100vh-42px)] bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-0 overflow-hidden select-none">
            {/* FLOATING 3D GLASS SHAPES & RADIAL GLOW ORBS */}
            {/* Left glowing blue-indigo orb */}
            <div className="absolute top-[10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
            {/* Right glowing cyan-blue orb */}
            <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] pointer-events-none animate-pulse duration-[10000ms]" />
            {/* Center soft white glowing blur */}
            <div className="absolute top-[30%] left-[25%] w-[50vw] h-[30vw] rounded-full bg-indigo-300/5 dark:bg-indigo-500/5 blur-[100px] pointer-events-none" />

            {/* Rotated Left Glassy Capsule */}
            <div
              className="absolute left-[-80px] top-[20%] w-[240px] h-[480px] rounded-[120px] border border-white/20 dark:border-white/10 bg-white/5 dark:bg-zinc-950/5 backdrop-blur-[24px] pointer-events-none transform -rotate-[25deg] hidden md:block"
              style={{
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.2), 0 24px 48px -12px rgba(0,0,0,0.1)",
              }}
            />

            {/* Rotated Right Glassy Capsule (Blue Gradient Accent) */}
            <div
              className="absolute right-[-120px] bottom-[10%] w-[280px] h-[560px] rounded-[140px] border border-white/25 dark:border-white/10 bg-gradient-to-tr from-blue-500/10 to-indigo-500/5 backdrop-blur-[28px] pointer-events-none transform rotate-[35deg] hidden md:block"
              style={{
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.25), 0 30px 60px -15px rgba(0,0,0,0.15)",
              }}
            />

            {/* Immersive Chat Interface */}
            <div className="w-full h-[calc(100vh-42px)] relative z-10">
              <ChatInterface
                user={user}
                accessToken={accessToken}
                lang={lang}
                workerUrl={workerUrl}
                onGenerateStoryboard={handleGenerateFromChat}
                isGeneratingStoryboard={isGenerating}
                onLoadBrief={onLoadBrief}
                isDocked={false}
                onBriefUpdated={handleBriefUpdated}
                activeShots={shots.length > 0 ? shots : undefined}
                sessions={chatSessions}
                setSessions={setChatSessions}
                currentSession={currentChatSession}
                setCurrentSession={setCurrentChatSession}
                messages={chatMessages}
                setMessages={setChatMessages}
                extracted={chatExtracted}
                setExtracted={setChatExtracted}
                attachedImage={chatAttachedImage}
                setAttachedImage={setChatAttachedImage}
              />
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-6 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview Full Size"
              className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg shadow-2xl border border-white/10"
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        t={t}
        initialMode={authModalMode}
      />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        accessToken={accessToken}
        user={user}
        lang={lang}
        t={t}
        workerUrl={workerUrl}
        profile={profile}
        onProfileUpdated={fetchProfile}
      />
      <AccountSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        profile={profile}
        onProfileUpdated={fetchProfile}
        lang={lang}
        initialTab={settingsModalTab}
      />

      {/* Hidden container for printing landscape slides */}
      <div className="hidden print:block print-slides-container">
        {/* Slide 1: Cover Slide */}
        <div className="slide-page bg-zinc-950 text-white flex flex-col justify-between p-12 border-none">
          <div className="space-y-4">
            <div className="text-emerald-500 font-mono text-xs uppercase tracking-widest font-bold">
              Campaign Storyboard Deck
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mt-2 text-white">
              {titleOverride ||
                productName ||
                (lang === "id"
                  ? "Rencana Strategis Kampanye Video"
                  : "Strategic Video Campaign Plan")}
            </h1>
          </div>

          <div className="my-auto py-8">
            <div className="text-zinc-500 font-semibold text-xs uppercase tracking-widest mb-2">
              PREMISE UTAMA / CORE NARRATIVE CONCEPT
            </div>
            <blockquote className="text-xl font-medium leading-relaxed italic text-zinc-200 border-l-4 border-emerald-500 pl-4">
              "
              {premiseOverride ||
                usp ||
                (lang === "id"
                  ? "Konsep visual kreatif untuk menghasilkan interaksi dan konversi maksimal."
                  : "Creative visual concept designed for maximum engagement and conversions.")}
              "
            </blockquote>
          </div>

          <div className="grid grid-cols-4 gap-6 pt-6 border-t border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 block font-mono uppercase tracking-wider mb-1">
                Target Platform
              </span>
              <span className="font-semibold text-zinc-200">
                {platform || "Instagram / TikTok"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block font-mono uppercase tracking-wider mb-1">
                Narrative Tone
              </span>
              <span className="font-semibold text-zinc-200">{tone || "Comedic / Engagement"}</span>
            </div>
            <div>
              <span className="text-zinc-500 block font-mono uppercase tracking-wider mb-1">
                Visual Style
              </span>
              <span className="font-semibold text-zinc-200">9:16 Cinematic (Portrait Mode)</span>
            </div>
            <div>
              <span className="text-zinc-500 block font-mono uppercase tracking-wider mb-1">
                Decentralized Seal
              </span>
              <span
                className="font-mono text-zinc-400 truncate block max-w-[200px]"
                title="Guz6jxrmW8744a4k9CLa19SWLdm4HPs4yEefEj6PTje2"
              >
                SOL-SEAL: Guz6jxrmW8744a4k9...
              </span>
            </div>
          </div>
        </div>

        {/* Slide 2 & Beyond: Content slides showing 6 horizontal shots side-by-side */}
        {shotChunks.map((chunk, chunkIdx) => {
          const startNum = chunkIdx * 6 + 1;
          const endNum = Math.min((chunkIdx + 1) * 6, shots.length);

          return (
            <div
              key={chunkIdx}
              className="slide-page bg-white text-zinc-900 flex flex-col justify-between p-10 border-none"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-zinc-150 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-zinc-900 uppercase">
                    STORYBOARD & SHOTLIST —{" "}
                    {titleOverride || productName || (lang === "id" ? "KAMPANYE" : "CAMPAIGN")}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    SCENE {String(startNum).padStart(2, "0")} - {String(endNum).padStart(2, "0")}
                  </p>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                  SLIDE {chunkIdx + 2} / {shotChunks.length + 1}
                </div>
              </div>

              {/* Grid of 6 Shots */}
              <div className="grid grid-cols-6 gap-3 items-stretch my-auto">
                {chunk.map((shot, idx) => {
                  const shotIndex = startNum + idx;
                  const formattedIndex = String(shotIndex).padStart(2, "0");

                  return (
                    <div
                      key={shot.id || idx}
                      className="flex flex-col justify-between bg-zinc-50 rounded-lg p-2.5 border border-zinc-200/60 shadow-sm relative h-full"
                    >
                      {/* Badge Overlay */}
                      <span className="absolute top-4 left-4 z-10 bg-zinc-950 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        {formattedIndex}
                      </span>

                      {/* 9:16 Visual Frame — uses slide-visual-frame CSS class for strict print enforcement */}
                      <div className="slide-visual-frame mb-2.5">
                        {shot.image ? (
                          <img
                            src={shot.image}
                            alt={`Shot ${formattedIndex}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 text-zinc-400 bg-zinc-100">
                            <ImageIcon className="w-6 h-6 stroke-1 mb-1" />
                            <span className="text-[7px] font-medium leading-tight">
                              No Visual Rendered
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        {/* Shotlist angle */}
                        <div className="text-[8px] leading-relaxed">
                          <span className="font-extrabold uppercase text-zinc-900 block tracking-wider">
                            SHOTLIST:
                          </span>
                          <span
                            className="font-bold text-zinc-700 block italic leading-snug mt-0.5 truncate"
                            title={shot.angle}
                          >
                            {shot.angle}
                          </span>
                          <span
                            className="text-zinc-600 block leading-normal mt-1 line-clamp-3"
                            title={shot.action}
                          >
                            {shot.action}
                          </span>
                        </div>

                        {/* Note block */}
                        <div className="text-[7px] border-t border-zinc-200/80 pt-1.5 leading-snug">
                          <span className="font-extrabold uppercase text-zinc-900 block tracking-wider">
                            NOTE:
                          </span>
                          <span
                            className="text-zinc-650 block line-clamp-2 mt-0.5 italic"
                            title={shot.tech_budget_hack || "-"}
                          >
                            {shot.tech_budget_hack || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-[8px] text-zinc-400 border-t border-zinc-100 pt-3 mt-4">
                <span>VibeShot Studio Creative Platform — Pitch-Ready Slides</span>
                <span>Decentralized Proof: Guz6jxrmW8744a4k9CLa19SWLdm4HPs4yEefEj6PTje2</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="block text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}
