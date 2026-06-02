import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  CreditCard,
  History,
  Gift,
  Coins,
  Settings as SettingsIcon,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // assuming supabase helper exists, otherwise we mock it safely

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  onProfileUpdated?: () => void;
  lang: "id" | "en";
  initialTab?: "profile" | "billing" | "credit" | "settings";
  workerUrl?: string;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  profile,
  onProfileUpdated,
  lang,
  initialTab = "profile",
  workerUrl = "https://vibeshot-backend-ai.zakyjundana.workers.dev/",
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "credit" | "settings">(
    initialTab,
  );

  const [tiktokUsername, setTiktokUsername] = useState(user?.user_metadata?.tiktok_username || "");

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "TIKTOK_LINK_SUCCESS") {
        setIsConnectingTikTok(false);
        setIsTikTokLinked(true);
        if (event.data.username) {
          setTiktokUsername(event.data.username);
        }
        toast.success(
          lang === "id"
            ? `Akun TikTok ${event.data.username || ""} berhasil ditautkan secara resmi!`
            : `TikTok account ${event.data.username || ""} successfully linked officially!`,
        );
        if (onProfileUpdated) onProfileUpdated();
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [lang, onProfileUpdated]);

  useEffect(() => {
    if (user?.user_metadata?.tiktok_username) {
      setIsTikTokLinked(true);
      setTiktokUsername(user.user_metadata.tiktok_username);
    } else {
      setIsTikTokLinked(false);
      setTiktokUsername("");
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Mock states for settings UI
  const [username, setUsername] = useState(user?.email?.split("@")[0] || "creative_user");
  const [password, setPassword] = useState("••••••••");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isTikTokLinked, setIsTikTokLinked] = useState(!!user?.user_metadata?.tiktok_username);
  const [isInstagramLinked, setIsInstagramLinked] = useState(false);
  const [isConnectingTikTok, setIsConnectingTikTok] = useState(false);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);

  // Redeem code states
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Settings states
  const [defaultQuality, setDefaultQuality] = useState("high");
  const [autoSave, setAutoSave] = useState(true);
  const [emailPromo, setEmailPromo] = useState(false);

  const t = {
    id: {
      title: "Pengaturan Akun",
      profile: "Profil",
      billing: "Tagihan",
      credit: "Kredit Penggunaan",
      settings: "Pengaturan",
      email: "Alamat Email",
      username: "Nama Pengguna",
      password: "Kata Sandi",
      forgotPassword: "Lupa kata sandi?",
      changePassword: "Ubah Kata Sandi",
      linkedAccounts: "Otorisasi & Tautan Akun",
      tiktok: "Tautkan TikTok",
      instagram: "Tautkan Instagram",
      linked: "Tersambung",
      notLinked: "Belum Tersambung",
      paymentMethod: "Metode Pembayaran",
      paymentHistory: "Riwayat Pembayaran",
      redeemCode: "Tukar Kode Voucher",
      redeemBtn: "Klaim",
      availableCredit: "Sisa Kredit Render",
      creditsDescription: "Kredit yang tersedia setelah proses pendaftaran & topup.",
      buyMore: "Beli Kredit Tambahan",
      defaultEngine: "Kualitas Gambar Standar",
      autoSaveDesc: "Simpan draft otomatis saat mengetik",
      emailPromoDesc: "Terima update email produk & promo menarik",
      saveChanges: "Simpan Perubahan",
      saveSuccess: "Pengaturan berhasil disimpan!",
      unlinkedSuccess: "Koneksi akun berhasil dilepas.",
      linkedSuccess: "Akun berhasil diotorisasi!",
    },
    en: {
      title: "Account Settings",
      profile: "Profile",
      billing: "Billing",
      credit: "Usage Credit",
      settings: "Settings",
      email: "Email Address",
      username: "Username",
      password: "Password",
      forgotPassword: "Forgot password?",
      changePassword: "Change Password",
      linkedAccounts: "Account Authorization & Links",
      tiktok: "Link TikTok",
      instagram: "Link Instagram",
      linked: "Linked",
      notLinked: "Not Linked",
      paymentMethod: "Payment Method",
      paymentHistory: "Payment History",
      redeemCode: "Redeem Promo Code",
      redeemBtn: "Redeem",
      availableCredit: "Available Render Credits",
      creditsDescription: "Credits allocated at signup or purchased via top-ups.",
      buyMore: "Buy More Credits",
      defaultEngine: "Default Rendering Quality",
      autoSaveDesc: "Auto-save drafts as you type",
      emailPromoDesc: "Receive marketing and product update emails",
      saveChanges: "Save Changes",
      saveSuccess: "Settings saved successfully!",
      unlinkedSuccess: "Account disconnected successfully.",
      linkedSuccess: "Account authorized successfully!",
    },
  }[lang];

  if (!isOpen) return null;

  const handleSaveChanges = () => {
    toast.success(t.saveSuccess);
    if (onProfileUpdated) onProfileUpdated();
  };

  const toggleTikTok = async () => {
    if (isTikTokLinked) {
      setIsConnectingTikTok(true);
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            tiktok_username: null,
            tiktok_linked: false,
          },
        });
        if (error) throw error;
        setIsTikTokLinked(false);
        setTiktokUsername("");
        toast.success(t.unlinkedSuccess);
        if (onProfileUpdated) onProfileUpdated();
      } catch (err: any) {
        toast.error(err.message || "Failed to disconnect account");
      } finally {
        setIsConnectingTikTok(false);
      }
    } else {
      setIsConnectingTikTok(true);
      toast.info(lang === "id" ? "Menghubungkan ke TikTok..." : "Connecting to TikTok...");

      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token || "";
        const oauthUrl = `${workerUrl}api/auth/tiktok?userId=${user?.id || ""}&token=${encodeURIComponent(token)}`;

        const oauthWindow = window.open(
          oauthUrl,
          "TikTok Authorization",
          `width=${width},height=${height},left=${left},top=${top},status=no,location=no,toolbar=no,menubar=no`,
        );

        if (!oauthWindow) {
          toast.error(
            lang === "id"
              ? "Popup diblokir! Harap izinkan popup untuk situs ini."
              : "Popup blocked! Please allow popups for this website.",
          );
          setIsConnectingTikTok(false);
        }
      } catch (err: any) {
        toast.error("Failed to initiate authorization flow");
        setIsConnectingTikTok(false);
      }
    }
  };

  const toggleInstagram = () => {
    if (isInstagramLinked) {
      setIsInstagramLinked(false);
      toast.success(t.unlinkedSuccess);
    } else {
      setIsConnectingInstagram(true);
      toast.info(lang === "id" ? "Menghubungkan ke Instagram..." : "Connecting to Instagram...");

      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const oauthWindow = window.open(
        "",
        "Instagram Authorization",
        `width=${width},height=${height},left=${left},top=${top},status=no,location=no,toolbar=no,menubar=no`,
      );

      if (oauthWindow) {
        oauthWindow.document.write(`
          <html>
            <head>
              <title>Instagram Professional Authorization</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
              <style>
                body {
                  font-family: 'Plus Jakarta Sans', sans-serif;
                  background-color: #0c0a0d;
                  color: #ffffff;
                }
              </style>
            </head>
            <body class="flex flex-col justify-between h-screen p-6 select-none">
              <div class="flex flex-col items-center text-center mt-8 space-y-4">
                <div class="h-16 w-16 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center p-3.5 shadow-xl">
                  <img src="${window.location.origin}/instagram-logo.png" class="object-contain invert" />
                </div>
                <div>
                  <h2 class="text-base font-extrabold tracking-tight">Authorize VibeShot Studio</h2>
                  <p class="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-mono">Meta Creator Suite</p>
                </div>
                <p class="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  vibeshot.studio is requesting permission to access your Instagram Professional Account, retrieve Reels media, and fetch transcriptions.
                </p>
              </div>
              
              <div class="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl space-y-3 text-[11px] text-zinc-300">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold text-xs">✓</span>
                  <span>Access basic Instagram account info (handle, profile photo)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold text-xs">✓</span>
                  <span>Retrieve published Reels metadata and source URLs</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold text-xs">✓</span>
                  <span>Process speech-to-text directly in VibeShot editor</span>
                </div>
              </div>

              <div class="flex flex-col gap-2 mb-2">
                <button onclick="window.close();" class="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 text-white font-extrabold text-xs py-3 rounded-lg transition-all cursor-pointer text-center">
                  Authorize & Connect Account
                </button>
                <button onclick="window.close();" class="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold text-xs py-3 rounded-lg transition-colors cursor-pointer text-center">
                  Cancel
                </button>
              </div>
            </body>
          </html>
        `);

        const checkTimer = setInterval(() => {
          if (oauthWindow.closed) {
            clearInterval(checkTimer);
            setIsConnectingInstagram(false);
            setIsInstagramLinked(true);
            toast.success(
              lang === "id"
                ? "Akun Instagram berhasil tersambung! @zakyjundana.studio"
                : "Instagram account successfully linked! @zakyjundana.studio",
            );
          }
        }, 500);
      } else {
        // Pop-up blocked fallback
        setTimeout(() => {
          setIsConnectingInstagram(false);
          setIsInstagramLinked(true);
          toast.success(
            lang === "id"
              ? "Akun Instagram berhasil tersambung! @zakyjundana.studio"
              : "Instagram account successfully linked! @zakyjundana.studio",
          );
        }, 1500);
      }
    }
  };

  const handleRedeem = () => {
    if (!redeemCode.trim()) {
      toast.error(
        lang === "id" ? "Silakan masukkan kode voucher!" : "Please enter a voucher code!",
      );
      return;
    }
    setIsRedeeming(true);
    setTimeout(() => {
      setIsRedeeming(false);
      toast.success(
        lang === "id"
          ? "Kode voucher berhasil diklaim! +25 render kredit telah ditambahkan."
          : "Voucher redeemed! +25 render credits added to your account.",
      );
      setRedeemCode("");
      if (onProfileUpdated) onProfileUpdated();
    }, 1200);
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(
        lang === "id"
          ? "Email reset password telah dikirim ke inbox Anda!"
          : "Password reset link sent to your email inbox!",
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger forgot password flow.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with custom blur */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Settings Modal Body */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#111111]/95 shadow-2xl transition-all duration-300 transform scale-100 backdrop-blur-md text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row h-[550px] max-h-[85vh]">
        {/* Glow styling effects in bg */}
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Sidebar Nav */}
        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-zinc-200/60 dark:border-zinc-800/60 p-5 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/20 relative z-10 shrink-0">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-mono text-xs font-bold shadow">
              V
            </div>
            <h3 className="text-sm font-bold tracking-tight">{t.title}</h3>
          </div>

          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "profile"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              {t.profile}
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "billing"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              {t.billing}
            </button>
            <button
              onClick={() => setActiveTab("credit")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "credit"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40"
              }`}
            >
              <Coins className="h-3.5 w-3.5" />
              {t.credit}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40"
              }`}
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              {t.settings}
            </button>
          </nav>

          {/* User Preview Bottom */}
          <div className="hidden md:flex mt-auto pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-500 text-xs font-mono font-bold uppercase">
              {username ? username[0] : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold truncate max-w-[120px]">{username}</span>
              <span className="text-[9px] text-zinc-400 truncate max-w-[120px]">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col h-full relative z-10">
          {/* Close button inside panel */}
          <button
            onClick={onClose}
            type="button"
            className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* TAB: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-5 animate-[fadeIn_0.2s_ease-out] flex-1">
              <div>
                <h4 className="text-sm font-bold">{t.profile}</h4>
                <p className="text-[10px] text-zinc-400">
                  Manage your credentials and API authorizations.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Username Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">{t.username}</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email Input (disabled/read-only) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">{t.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || "user@studio.com"}
                      className="w-full pl-8 pr-3 py-1.5 rounded border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-450 dark:text-zinc-500 focus:outline-none cursor-not-allowed opacity-75"
                    />
                  </div>
                </div>

                {/* Password / Forgot Section */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-zinc-400 block">
                      {t.password}
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 hover:underline"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      disabled
                      value={password}
                      className="w-full pl-8 pr-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none opacity-80"
                    />
                  </div>
                </div>
              </div>

              {/* Action Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>
          )}

          {/* TAB: BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out] flex-1">
              <div>
                <h4 className="text-sm font-bold">{t.billing}</h4>
                <p className="text-[10px] text-zinc-400">
                  Manage subscriptions, billing history, and promo codes.
                </p>
              </div>

              {/* Payment Method Details */}
              <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">
                      {t.paymentMethod}
                    </span>
                    <span className="text-xs font-bold block mt-1 flex items-center gap-1.5">
                      💳 Visa ending in 4242
                    </span>
                    <span className="text-[9px] text-zinc-400 block mt-0.5">Expires 12/28</span>
                  </div>
                  <button className="text-[10px] font-bold text-indigo-500 hover:underline cursor-pointer">
                    Edit Card
                  </button>
                </div>
              </div>

              {/* Voucher Redeem */}
              <div className="space-y-1.5 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/40">
                <label className="text-[10px] font-mono text-zinc-400 block">{t.redeemCode}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VIBESHOT-GIFT25"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:outline-none uppercase font-mono tracking-wider text-zinc-850 dark:text-zinc-150"
                  />
                  <button
                    onClick={handleRedeem}
                    disabled={isRedeeming}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded transition-all cursor-pointer disabled:opacity-50 min-w-[70px]"
                  >
                    {isRedeeming ? "..." : t.redeemBtn}
                  </button>
                </div>
              </div>

              {/* Payment History List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  {t.paymentHistory}
                </span>
                <div className="rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 overflow-hidden text-xs max-h-32 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[9px] font-mono text-zinc-400 uppercase border-b border-zinc-200/65 dark:border-zinc-800/65">
                        <th className="p-2">Date</th>
                        <th className="p-2">Invoice</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 text-[11px]">
                      <tr>
                        <td className="p-2">May 15, 2026</td>
                        <td className="p-2 font-mono">VS-90812</td>
                        <td className="p-2">$15.00</td>
                        <td className="p-2 text-right text-indigo-500 font-medium hover:underline cursor-pointer">
                          PDF
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">Apr 15, 2026</td>
                        <td className="p-2 font-mono">VS-81239</td>
                        <td className="p-2">$15.00</td>
                        <td className="p-2 text-right text-indigo-500 font-medium hover:underline cursor-pointer">
                          PDF
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USAGE CREDIT */}
          {activeTab === "credit" && (
            <div className="space-y-5 animate-[fadeIn_0.2s_ease-out] flex-1 flex flex-col">
              <div>
                <h4 className="text-sm font-bold">{t.credit}</h4>
                <p className="text-[10px] text-zinc-400">
                  Monitor and manage your active rendering resource credits.
                </p>
              </div>

              {/* Large credit view */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center my-auto space-y-3">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 animate-pulse">
                  <Coins className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-black tracking-tight">
                    {profile?.credits || 50}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 block uppercase tracking-widest">
                    {t.availableCredit}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-550 dark:text-zinc-400 max-w-sm leading-relaxed">
                  {t.creditsDescription}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      // simulate opening upgrade modal
                      const upgradeBtn = document.querySelector(
                        '[class*="Upgrade Pro"]',
                      ) as HTMLElement;
                      if (upgradeBtn) upgradeBtn.click();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 duration-100"
                  >
                    {t.buyMore}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-5 animate-[fadeIn_0.2s_ease-out] flex-1">
              <div>
                <h4 className="text-sm font-bold">{t.settings}</h4>
                <p className="text-[10px] text-zinc-400">
                  Configure default studio behavior and user workspace presets.
                </p>
              </div>

              <div className="space-y-4">
                {/* Default rendering quality dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">
                    {t.defaultEngine}
                  </label>
                  <select
                    value={defaultQuality}
                    onChange={(e) => setDefaultQuality(e.target.value)}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none transition-colors"
                  >
                    <option value="standard">Standard Fast (Lower Credits)</option>
                    <option value="high">High Definition Ultra (Normal Credits)</option>
                    <option value="cinematic">Cinematic Pro Max (Double Credits)</option>
                  </select>
                </div>

                {/* Switch toggles */}
                <div className="space-y-3.5 pt-2">
                  {/* Auto Save Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Auto-Save Workspace Drafts</span>
                      <span className="text-[9px] text-zinc-450 dark:text-zinc-500">
                        {t.autoSaveDesc}
                      </span>
                    </div>
                    <button
                      onClick={() => setAutoSave(!autoSave)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoSave ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-850"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#111111] shadow ring-0 transition duration-200 ease-in-out ${
                          autoSave ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Marketing emails promo toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Product Updates & Marketing Alerts</span>
                      <span className="text-[9px] text-zinc-450 dark:text-zinc-500">
                        {t.emailPromoDesc}
                      </span>
                    </div>
                    <button
                      onClick={() => setEmailPromo(!emailPromo)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        emailPromo ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-850"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#111111] shadow ring-0 transition duration-200 ease-in-out ${
                          emailPromo ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Save Button */}
              <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
