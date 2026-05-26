import React, { useMemo, useState, useEffect } from "react";
import { Trash2, Sparkles, Image as ImageIcon, Loader2, Copy, ArrowDownRight, Link as LinkIcon, Upload, Eye, EyeOff, Layers, Film, ArrowRight, X, Moon, Sun, AlignLeft, Edit3, Cpu, User, Mail, Key, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

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
    placeholderIde: "Contoh: Jadikan ini buat produk Kopi Susu Gula Aren, tonjolkan efek bikin melek instan...",
    trendLabel: "Tren Viral Saat Ini / Gaya Visual (Opsional)",
    trendPlaceholder: "Contoh: Tren ASMR tapping produk, transisi beat drop jedag-jedug, gaya sinematik lofi...",
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
    textPlaceholder: "Tulis di sini deskripsi alur video yang lo ingat, ketik transkrip manual, atau sebutkan gaya moodboard text-based...",
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
    authRequiredDesc: "Silakan masuk untuk menyimpan brief ke Supabase dan menggunakan saldo backend API AI Anda.",
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
    placeholderIde: "e.g., Turn this into a campaign for iced coffee, emphasize the instant energy kick...",
    trendLabel: "Current Viral Trend / Visual Style (Optional)",
    trendPlaceholder: "e.g., ASMR product tapping, lofi cinematic aesthetic, fast beat drop transitions...",
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
    textPlaceholder: "Write rough pacing, text transcript, or text-based moodboard instructions here...",
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
    authRequiredDesc: "Please log in to save briefs to Supabase and use your AI backend API credits.",
  },
};

function SimpleAIImage({ src, alt, className, onClick, index }: { src: string; alt: string; className: string; onClick?: () => void; index: number }) {
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-[9px] text-zinc-400 font-mono cursor-pointer p-2 text-center" onClick={(e) => { e.stopPropagation(); setHasError(false); setIsLoaded(false); setShouldLoad(false); }}>
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
  const switchOffClass = !isOn ? "text-zinc-900 dark:text-zinc-100 scale-105" : "text-zinc-400 dark:text-zinc-600";
  const switchOnClass = isOn ? "text-zinc-900 dark:text-zinc-100 scale-105" : "text-zinc-400 dark:text-zinc-600";
  const capClass = isOn ? "bg-zinc-900 dark:bg-zinc-100 border border-zinc-800 dark:border-zinc-300" : "bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700";
  const ballClass = isOn ? "translate-x-4 bg-white dark:bg-zinc-900" : "translate-x-0.5 bg-zinc-600 dark:bg-zinc-400";

  return (
    <div onClick={onToggle} className="flex items-center gap-2 cursor-pointer select-none group p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all duration-150">
      {(labelOff || IconOff) && (
        <span className={`text-[10px] font-mono font-bold tracking-wider transition-all duration-200 ${switchOffClass}`}>
          {IconOff ? <IconOff className="w-3.5 h-3.5" /> : labelOff}
        </span>
      )}
      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${capClass}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-300 shadow-sm ${ballClass}`} />
      </div>
      {(labelOn || IconOn) && (
        <span className={`text-[10px] font-mono font-bold tracking-wider transition-all duration-200 ${switchOnClass}`}>
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
          <textarea
            rows={2}
            value={localImagePrompt}
            onChange={(e) => setLocalImagePrompt(e.target.value)}
            onBlur={() => handleBlur("imagePrompt", localImagePrompt, shot.imagePrompt || "")}
            className="w-full bg-zinc-900 text-zinc-300 font-mono text-[10px] rounded-md border border-zinc-800 px-2.5 py-2 leading-relaxed resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            placeholder="Prompt generator..."
          />
        </div>
        <button
          type="button"
          onClick={() => handleExecuteSingleImage(shot)}
          disabled={loadingSingleImage}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-[11px] font-bold tracking-tight text-zinc-700 dark:text-zinc-200 transition hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 shrink-0 ml-0 md:ml-4 cursor-pointer active:scale-95 duration-100"
        >
          {loadingSingleImage ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Film className="w-3.5 h-3.5 text-indigo-500" />
          )}{" "}
          {t.btnRenderSingle}
        </button>
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
  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6-4.53z" fill="#EA4335"/>
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorMsg(err.message || (lang === "id" ? "Gagal masuk dengan Google." : "Google login failed."));
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
      setErrorMsg(lang === "id" ? "Email dan password wajib diisi." : "Email and password are required.");
      setLoading(false);
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setErrorMsg(lang === "id" ? "Konfirmasi password tidak cocok." : "Password confirmation does not match.");
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
        toast.success(lang === "id" ? "Berhasil masuk ke studio!" : "Successfully logged in!");
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data?.session) {
          toast.success(lang === "id" ? "Akun berhasil dibuat dan masuk!" : "Account created and logged in!");
        } else {
          toast.success(lang === "id" ? "Pendaftaran berhasil! Cek email untuk verifikasi." : "Registration successful! Please check your email for verification.");
        }
        onClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || (lang === "id" ? "Terjadi kesalahan autentikasi." : "Authentication error occurred."));
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
            onClick={() => { setMode("login"); setErrorMsg(null); }}
            className={`text-[11px] font-bold py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${mode === "login" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}
          >
            {t.login}
          </button>
          <button 
            type="button" 
            onClick={() => { setMode("signup"); setErrorMsg(null); }}
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
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
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
            ) : (
              mode === "login" ? t.signIn : t.createAccount
            )}
          </button>

          {/* Switch Prompt */}
          <div className="text-center pt-1.5">
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrorMsg(null); }}
              className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium transition-colors hover:underline cursor-pointer"
            >
              {mode === "login" ? t.noAccount : t.haveAccount} <span className="text-indigo-500 dark:text-indigo-400 font-bold ml-0.5">{mode === "login" ? t.signup : t.login}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function VibeShotPlatform() {
  const [view, setView] = useState<"landing" | "app">("landing");
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
  const [masterIdentity, setMasterIdentity] = useState<{ talent?: string; product?: string } | null>(null);
  const [cloudBriefId, setCloudBriefId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isRenderingVisuals, setIsRenderingVisuals] = useState(false);
  const [loadingShotsImages, setLoadingShotsImages] = useState<Record<string, boolean>>({});
  
  // 🔥 FIX SAKTI FRONTEND: State errorMsg & setErrorMsg resmi dideklarasikan berpasangan!
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [hasResult, setHasResult] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    // Check initial session and cache the token in React state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAccessToken(session?.access_token || "");
    });

    // Keep token in sync whenever auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAccessToken(session?.access_token || "");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateShot = (id: string, field: keyof Shot, value: string) => {
    setShots((prev) => prev.map((shot) => (shot.id === id ? { ...shot, [field]: value } : shot)) );
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
            setIsGenerating(false);
            return;
          }
        }
      } catch (e) { console.error("Cloud Error:", e); } finally { setIsGenerating(false); }

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
      } catch { localStorage.clear(); }
    };
    loadSharedOrLocalBrief();
  }, []);

  const t = translations[lang] || translations["en"];

  const saveToLocalStorage = ( newShots: Shot[], newMood: string[], newPremise: string | null, newTitle: string | null, newIdentity: any, newStyle: string, cloudId: string | null) => {
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
    localStorage.clear();
    window.history.replaceState({}, document.title, window.location.pathname);
    setShots([]); setMoodboard([]); setPremiseOverride(null); setTitleOverride(null); setMasterIdentity(null); setCloudBriefId(null); setHasResult(false); setRefType("link"); setRefUrl(""); setRefTextDescription(""); setRefImageBase64(""); setImageModel("fal-ai/flux/schnell"); setView("app");
    toast.success(lang === "id" ? "Workspace dibersihkan." : "Workspace cleared.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast.error(lang === "id" ? "File maksimal 4MB." : "Max file size is 4MB."); return; }
    const reader = new FileReader(); reader.onloadend = () => { setRefImageBase64(reader.result as string); toast.success(lang === "id" ? "Aset visual terkunci." : "Visual asset cached."); };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    const token = accessToken;
    if (!token) {
      toast.error(lang === "id" ? "Autentikasi diperlukan. Silakan masuk terlebih dahulu!" : "Authentication required. Please log in first!");
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    setIsGenerating(true); setErrorMsg(null); setHasResult(false);
    const requestPayload = { engineMode: activeEngine, product: productName || "General Campaign Brand", usp: usp || "Buat adegan sekreatif mungkin", trend: trend, tone: activeEngine === "clone" ? "Matches Reference Pacing" : tone, shotCount: shotCount, platform: platform, pillar: pillar, talent: talent, refType: refType, refUrl: refUrl, refTextDescription: refTextDescription, refImageBase64: refImageBase64, };
    try {
      const res = await fetch(workerUrl, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify(requestPayload), 
      });
      const data = await res.json(); if (!res.ok) throw new Error(data?.error || "Error compiling.");

      const normalized = (data.shotlist || []).map((r: any) => ({ id: crypto.randomUUID(), angle: String(r?.angle || ""), location: String(r?.location || ""), tech_budget_hack: String(r?.tech_budget_hack || ""), action: String(r?.action || ""), audio: String(r?.audio || ""), image: String(r?.image || ""), imagePrompt: String(r?.imagePrompt || ""), }));
      setShots(normalized); setMoodboard(data.moodboard || []); setPremiseOverride(data.premise); setTitleOverride(data.title); setMasterIdentity(data.master_identity); setVisualStyle(data.visual_style || "real-life"); setCloudBriefId(data.briefId || null); setHasResult(true);
      saveToLocalStorage( normalized, data.moodboard || [], data.premise, data.title, data.master_identity, data.visual_style, data.briefId || null );
      toast.success(lang === "id" ? "Brief berhasil diracik!" : "Brief successfully compiled!");
    } catch (err: any) { setErrorMsg(err.message); toast.error(err.message); } finally { setIsGenerating(false); }
  };

  const handleMassExecuteImages = async () => {
    const token = accessToken;
    if (!token) {
      toast.error(lang === "id" ? "Autentikasi diperlukan. Silakan masuk terlebih dahulu!" : "Authentication required. Please log in first!");
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
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({ action: "render_images", briefId: cloudBriefId, title: titleOverride, premise: premiseOverride, visual_style: visualStyle, masterIdentity: masterIdentity, shotlist: shots, imageModel: imageModel }), 
      });
      const data = await res.json(); if (!res.ok) throw new Error(data?.error || "Error rendering images.");
      const updatedWithImages = (data.shotlist || []).map((r: any, idx: number) => ({ ...shots[idx], image: String(r?.image || ""), imagePrompt: String(r?.imagePrompt || shots[idx].imagePrompt), }));
      setShots(updatedWithImages); setMoodboard(data.moodboard || []);
      saveToLocalStorage( updatedWithImages, data.moodboard || [], premiseOverride, titleOverride, masterIdentity, visualStyle, cloudBriefId );
      toast.success(lang === "id" ? "Semua frame visual berhasil dirender!" : "All visual frames rendered!");
    } catch (err: any) { toast.error(err.message); } finally { setIsRenderingVisuals(false); }
  };

  const handleLanjutkanCerita = async () => {
    const token = accessToken;
    if (!token) {
      toast.error(lang === "id" ? "Autentikasi diperlukan. Silakan masuk terlebih dahulu!" : "Authentication required. Please log in first!");
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    setIsContinuing(true); setErrorMsg(null);
    try {
      const res = await fetch(workerUrl, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({ engineMode: activeEngine, product: productName || "Analyzed Reference Video", usp: usp, trend, tone, shotCount: shotCount || 3, platform, pillar, talent, isContinuation: true, existingShots: shots, masterIdentity: masterIdentity, title: titleOverride, visual_style: visualStyle, refType, refUrl, refTextDescription, refImageBase64, }), 
      });
      const data = await res.json(); if (!res.ok) throw new Error(data?.error || "Error chaining.");
      const normalizedNewShots = (data.shotlist || []).map((r: any) => ({ id: crypto.randomUUID(), angle: String(r?.angle || ""), location: String(r?.location || ""), tech_budget_hack: String(r?.tech_budget_hack || ""), action: String(r?.action || ""), audio: String(r?.audio || ""), image: String(r?.image || ""), imagePrompt: String(r?.imagePrompt || ""), }));
      const finalShots = [...shots, ...normalizedNewShots]; const finalMood = [...moodboard, ...(data.moodboard || [])]; const finalPremise = `${premiseOverride}\n\n[Continuous Sequence]:\n${data.premise}`;
      setShots(finalShots); setMoodboard(finalMood); setPremiseOverride(finalPremise); setCloudBriefId(data.briefId || cloudBriefId);
      saveToLocalStorage( finalShots, finalMood, finalPremise, titleOverride, masterIdentity, visualStyle, data.briefId || cloudBriefId );
      toast.success(lang === "id" ? "Alur berhasil disambung secara inline!" : "Timeline extended inline successfully!");
    } catch (err: any) { toast.error(err.message); } finally { setIsContinuing(false); }
  };

  const handleShareLink = () => {
    if (!cloudBriefId) { toast.error("Cloud ID missing."); return; }
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?id=${cloudBriefId}`);
    toast.success(t.shareSuccess);
  };

  const handleCopyTable = async () => {
    if (shots.length === 0) return;
    let htmlString = `<table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; width: 100%;"><tr style="background-color: #18181b; color: #ffffff; font-weight: bold;"><th>#</th><th>Camera Angle</th><th>Location</th><th>Action / Visual</th><th>Audio / VO</th></tr>`;
    shots.forEach((s, idx) => { htmlString += `<tr><td style="text-align: center; padding: 8px;">${idx + 1}</td><td>${s.angle}</td><td>${s.location}</td><td>${s.action}</td><td>${s.audio}</td></tr>`; }); htmlString += `</table>`;
    try { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([htmlString], { type: "text/html" }) })]); toast.success(lang === "id" ? "Struktur tabel berhasil disalin!" : "Table layout copied!"); } catch { toast.error("Copy failed."); }
  };

  const handleExecuteSingleImage = async (shot: Shot) => {
    const token = accessToken;
    if (!token) {
      toast.error(lang === "id" ? "Autentikasi diperlukan. Silakan masuk terlebih dahulu!" : "Authentication required. Please log in first!");
      setAuthModalMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    if (!cloudBriefId) { toast.error("KV Cloud ID missing. Selesaikan Phase 1 dulu, Cok."); return; }
    setLoadingShotsImages(prev => ({ ...prev, [shot.id]: true }));
    try {
      const res = await fetch(workerUrl, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({ action: "render_single_image", briefId: cloudBriefId, visual_style: visualStyle, singleShotId: shot.id, shotToGenerate: shot, masterIdentity: masterIdentity, imageModel: imageModel }), 
      });
      const data = await res.json(); if (!res.ok) throw new Error(data?.error || "Error rendering single.");
      updateShot(shot.id, "image", data.imageUrl);
      saveToLocalStorage( shots.map(s => s.id === shot.id ? {...s, image: data.imageUrl} : s), moodboard, premiseOverride, titleOverride, masterIdentity, visualStyle, cloudBriefId );
      toast.success(lang === "id" ? "Visual adegan berhasil dirender!" : "Visual frame generated!");
    } catch (err: any) { toast.error(err.message); } finally { setLoadingShotsImages(prev => ({ ...prev, [shot.id]: false })); }
  };

  const moodboardTiles = useMemo(() => {
    if (moodboard.length > 0) return moodboard;
    return Array.from({ length: shots.length || shotCount }).map(() => null);
  }, [moodboard, shotCount, shots.length]);

  const isTextOnlyBrief = useMemo(() => shots.length > 0 && shots.every((s) => !s.image), [shots]);
  const inputStyle = "w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none transition-colors";
  const hybridActiveStyle = activeEngine === "hybrid" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600";
  const cloneActiveStyle = activeEngine === "clone" ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-950 dark:text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600";

  if (view === "landing") return (
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
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                <User className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
                {user.email}
              </div>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="text-[11px] font-medium text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
              >
                {t.logout}
              </button>
              <button onClick={() => setView("app")} className="text-xs font-medium bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-colors shadow-sm cursor-pointer">
                Launch Studio →
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setAuthModalMode("login"); setIsAuthModalOpen(true); }} 
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 py-1.5 cursor-pointer"
              >
                {t.login}
              </button>
              <button 
                onClick={() => { setAuthModalMode("signup"); setIsAuthModalOpen(true); }} 
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
          <Sparkles className="h-3 w-3 text-zinc-400 dark:text-zinc-500" /> Private Beta Engine Active
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">Turn messy script ideas into crystal-clear production briefs.</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">The automated workspace built for Creative Strategists and Agency Workers. Translate loose briefs and visual references into word-for-word scripts, moodboards, and interactive storyboards in 60 seconds.</p>
        <div className="pt-2">
          {user ? (
            <button onClick={() => setView("app")} className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs px-5 py-3 rounded-lg shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all transform hover:-translate-y-0.5 cursor-pointer">
              Launch Studio Workspace <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => { setAuthModalMode("signup"); setIsAuthModalOpen(true); }} className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-xs px-5 py-3 rounded-lg shadow hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-all transform hover:-translate-y-0.5 cursor-pointer">
                Get Started for Free <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setView("app")} className="text-xs font-mono font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors py-2 px-3 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-lg cursor-pointer">
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
    </div>
  );

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
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    <User className="h-2.5 w-2.5 text-zinc-400" />
                    {user.email}
                  </div>
                  <button 
                    onClick={() => supabase.auth.signOut()} 
                    className="text-[10px] font-bold text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-mono uppercase cursor-pointer"
                  >
                    [{t.logout}]
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setAuthModalMode("login"); setIsAuthModalOpen(true); }} 
                  className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-650 dark:hover:text-indigo-300 transition-colors font-mono uppercase cursor-pointer"
                >
                  [{t.login}]
                </button>
              )}
              <span className="text-zinc-200 dark:text-zinc-700 font-mono text-xs">|</span>
              <button onClick={() => setView("landing")} className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors cursor-pointer">{t.backToHome}</button>
              {hasResult && <span className="text-zinc-200 dark:text-zinc-700 font-mono text-xs">|</span>}
              {hasResult && <button onClick={handleClearAll} className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer">{t.resetProject}</button>}
            </div>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-42px)] grid-cols-1 lg:grid-cols-[380px_1fr]">
          <aside className="border-r border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-[#111111] p-5 lg:sticky lg:top-[42px] lg:h-[calc(100vh-42px)] lg:overflow-y-auto space-y-5 shadow-sm">
            <div className="space-y-1.5">
              <span className="block text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.selectMode}</span>
              <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/40 dark:border-zinc-800">
                <button type="button" onClick={() => setActiveEngine("hybrid")} className={`text-[11px] font-bold py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer ${hybridActiveStyle}`}>{t.modeHybrid}</button>
                <button type="button" onClick={() => { setActiveEngine("clone"); setRefType("link"); setOpenSection("core"); }} className={`text-[11px] font-bold py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer ${cloneActiveStyle}`}>{t.modeClone}</button>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic leading-snug px-1">{activeEngine === "hybrid" ? t.modeHybridDesc : t.modeCloneDesc}</p>
            </div>
            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-2" />
            
            <div className="rounded-lg border border-zinc-200/60 dark:border-zinc-800 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/30 transition-all">
              <button type="button" onClick={() => setOpenSection(openSection === "core" ? "none" : "core")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white dark:bg-[#111111] border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <span className="flex items-center gap-2"><Edit3 className="h-3.5 w-3.5 text-zinc-500" /> {t.paramUtama}</span>
                {openSection === "core" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}
              </button>
              {openSection === "core" && (
                <div className="p-4 space-y-4 bg-white dark:bg-[#111111]">
                  <Field label={t.namaBrand}><input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Suzuki XL7 2026" className={inputStyle} /></Field>
                  <Field label={t.ideKasar}><textarea value={usp} onChange={(e) => setUsp(e.target.value)} rows={3} placeholder={t.placeholderIde} className={inputStyle + " resize-none"} /></Field>
                  <Field label={t.trendLabel}><input value={trend} onChange={(e) => setTrend(e.target.value)} placeholder={t.trendPlaceholder} className={inputStyle} /></Field>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-zinc-200/60 dark:border-zinc-800 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/30">
              <button type="button" onClick={() => setOpenSection(openSection === "ref" ? "none" : "ref")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white dark:bg-[#111111] border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"><span className="flex items-center gap-2"><Upload className="h-3.5 w-3.5 text-zinc-500" /> {t.refMultimodal}</span>{openSection === "ref" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}</button>
              {openSection === "ref" && (
                <div className="p-4 space-y-4 bg-white dark:bg-[#111111]">
                  <Field label={t.tipeAset}>
                    <select value={refType} onChange={(e) => setRefType(e.target.value)} className={inputStyle + " bg-zinc-50/50 dark:bg-zinc-800/50"}>
                      {activeEngine === "hybrid" && <option value="none">{t.noRef}</option>}
                      <option value="link">{t.pasteLink}</option>
                      <option value="photo">{t.uploadPhoto}</option>
                      {activeEngine === "hybrid" && <option value="text">{t.textBasedRef}</option>}
                    </select>
                  </Field>
                  {refType === "photo" && (
                    <div className="space-y-2">
                      <label className="flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                        <Upload className="h-5 w-5 text-zinc-400 dark:text-zinc-500 mb-1" />
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">{t.clickUpload}</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                      {refImageBase64 && <span className="text-[10px] font-mono text-emerald-500 block text-center font-medium">{t.payloadLocked}</span>}
                    </div>
                  )}
                  {refType === "link" && (
                    <Field label={t.pasteLink}>
                      <div className="relative flex items-center">
                        <input value={refUrl} onChange={(e) => setRefUrl(e.target.value)} placeholder={t.pastePlaceholder} className={inputStyle + " pr-8"} />
                        <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5" />
                      </div>
                    </Field>
                  )}
                  {refType === "text" && (
                    <Field label={t.textBasedRef}>
                      <textarea rows={4} value={refTextDescription} onChange={(e) => setRefTextDescription(e.target.value)} placeholder={t.textPlaceholder} className={inputStyle + " resize-none"} />
                    </Field>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-zinc-200/60 dark:border-zinc-800 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/30 transition-all">
              <button type="button" onClick={() => setOpenSection(openSection === "vibe" ? "none" : "vibe")} className="flex w-full items-center justify-between p-3 text-left text-xs font-medium bg-white dark:bg-[#111111] border-b border-zinc-100 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-zinc-500" /> {t.arsitekturVibe}</span>
                {openSection === "vibe" ? <Eye className="h-3 w-3 text-zinc-400" /> : <EyeOff className="h-3 w-3 text-zinc-400" />}
              </button>
              {openSection === "vibe" && (
                <div className="p-4 space-y-4 bg-white dark:bg-[#111111]">
                  {activeEngine === "hybrid" && (
                    <>
                      <Field label={t.targetPlatform}><select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputStyle + " bg-zinc-50/50 dark:bg-zinc-800/50"}><option value="Instagram Reels">Instagram Reels (Aesthetic & Trendy)</option><option value="YouTube Shorts">YouTube Shorts (Fast & Punchy)</option></select></Field>
                      <Field label={t.pillarKonten}><select value={pillar} onChange={(e) => setPillar(e.target.value)} className={inputStyle + " bg-zinc-50/50 dark:bg-zinc-800/50"}><option value="Hiburan / Entertainment">{t.pillarOption1}</option><option value="Hard Sell / Promosi Langsung">{t.pillarOption2}</option></select></Field>
                      <Field label={t.pendekatanTalent}><select value={talent} onChange={(e) => setTalent(e.target.value)} className={inputStyle + " bg-zinc-50/50 dark:bg-zinc-800/50"}><option value="Creator-Led">{t.talentOption1}</option><option value="Voice Over Only">{t.talentOption2}</option></select></Field>
                      <Field label={t.moodTone}><input value={tone} onChange={(e) => setTone(e.target.value)} className={inputStyle} /></Field>
                    </>
                  )}
                  <Field label={t.jumlahShot}><input type="number" min={1} max={24} value={shotCount} onChange={(e) => setShotCount(parseInt(e.target.value || "6", 10))} className={inputStyle + " w-24"} /></Field>
                  <Field label="AI Image Model (Fal.ai Weaponry)">
                    <select value={imageModel} onChange={(e) => { setImageModel(e.target.value); localStorage.setItem("vibeshot_image_model", e.target.value); }} className={inputStyle + " bg-gradient-to-r from-indigo-500/10 to-transparent font-medium border-indigo-500/30"}>
                      <optgroup label="⚡ KASTA EKONOMIS (Super Fast & Hemat Kredit)">
                        <option value="fal-ai/flux/schnell">FLUX 1 [Schnell] (Rekomendasi Utama - $0.003)</option>
                        <option value="fal-ai/flux-2/flash">FLUX 2 [Flash] (Crisper Text, Ultra Speed - $0.004)</option>
                        <option value="fal-ai/flux-2/turbo">FLUX 2 [Turbo] (Enhanced Native Editing - $0.004)</option>
                        <option value="fal-ai/gemini-3.1-flash-image-preview">Google Nano Banana 2 (State-of-the-art Fast - $0.003)</option>
                        <option value="fal-ai/bytedance/seedream/v5/lite/text-to-image">ByteDance Seedream 5.0 Lite (Intelligent Fast - $0.003)</option>
                      </optgroup>
                      <optgroup label="🎨 KASTA DESIGNER & TYPOGRAPHY (Anti-Typo & Ragam Poster)">
                        <option value="fal-ai/recraft/v4/pro/text-to-image">Recraft V4 Pro (SOTA Design System & Materials - $0.03)</option>
                        <option value="fal-ai/ideogram/v3">Ideogram V3 (Exceptional Typography Handling - $0.04)</option>
                        <option value="fal-ai/openai/gpt-image-2">OpenAI GPT Image 2 (Extremely Detailed Typography - $0.04)</option>
                        <option value="fal-ai/flux-pro/kontext/text-to-image">FLUX Kontext Pro (Flawless Text Following - $0.03)</option>
                      </optgroup>
                      <optgroup label="👑 KASTA SULTAN (Cinematic Hyper-Realism / Final Presentation)">
                        <option value="fal-ai/flux-2-max">FLUX 2 [Max] (Advanced Realism & Precision - $0.05)</option>
                        <option value="fal-ai/flux-pro/v1.1-ultra">FLUX 1.1 Pro Ultra (2K Resolution Photo Realism - $0.05)</option>
                        <option value="fal-ai/flux/dev">FLUX 1 [Dev] (Original Classic Cinematic - $0.025)</option>
                        <option value="fal-ai/flux-2-flex">FLUX 2 [Flex] (Fine-Tuned Control Guidance - $0.03)</option>
                      </optgroup>
                    </select>
                  </Field>
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
                {hasResult && cloudBriefId && <button type="button" onClick={handleShareLink} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm shrink-0 cursor-pointer"><LinkIcon className="w-3.5 h-3.5" /> {t.btnShare}</button>}
              </div>
              {isTextOnlyBrief && (
                <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                  <div><h3 className="text-sm font-bold flex items-center gap-2">💡 Teks Naskah Berhasil Di-sadur!</h3><p className="text-xs text-zinc-100 mt-0.5">Silakan periksa spesifikasi sheets di bawah. Jika mau render visual massal sekaligus, langsung klik tombol kanan.</p></div>
                  <button type="button" onClick={handleMassExecuteImages} disabled={isRenderingVisuals} className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-4 py-2 text-xs rounded-lg transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50">{isRenderingVisuals ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.btnRenderingVisualMassal}</> : <><Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t.btnRenderVisualMassal}</>}</button>
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
                        {src ? <SimpleAIImage src={src} index={i} alt={`Shot ${i+1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onClick={() => setPreviewImage(src)} /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600"><ImageIcon className="h-4 w-4" /><span className="text-[9px] font-mono uppercase">Shot {i + 1}</span></div>}
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
                {shots.length === 0 ? <div className="py-12 border border-dashed border-zinc-200 dark:border-dashed dark:border-zinc-800 bg-white dark:bg-[#111111] text-center rounded-xl text-xs text-zinc-400 dark:text-zinc-600 font-mono">{t.belumAda}</div> : (
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
                      />
                    ))}
                  </div>
                )}
                {hasResult && (
                  <div className="pt-6 pb-2 text-center flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                      <span>{lang === "id" ? "Berapa shot kelanjutan?" : "Extension size:"}</span>
                      <input type="number" min={1} max={12} value={shotCount} onChange={(e) => setShotCount(parseInt(e.target.value || "3", 10))} className="w-16 bg-white dark:bg-zinc-800 rounded px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 text-center font-bold text-zinc-800 dark:text-zinc-100" />
                    </div>
                    <button type="button" onClick={handleLanjutkanCerita} disabled={isContinuing} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer transform active:scale-95 duration-100">
                      {isContinuing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.btnExtending}</> : <><ArrowDownRight className="h-3.5 w-3.5" /> <span>{t.btnExtend} (+{shotCount} Shots)</span></>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-6 cursor-zoom-out" onClick={() => setPreviewImage(null)}>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img src={previewImage} alt="Preview Full Size" className="h-full w-full object-contain rounded-lg shadow-2xl border border-white/10" />
            <button type="button" className="absolute -top-4 -right-4 bg-white text-zinc-900 rounded-full p-1.5 shadow-lg hover:bg-zinc-200 transition-colors cursor-pointer" onClick={() => setPreviewImage(null)}><X className="h-5 w-5" /></button>
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
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return ( <div className="space-y-1"><span className="block text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{label}</span>{children}</div> ); }
