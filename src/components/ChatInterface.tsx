import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Plus,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  ChevronDown,
  User,
  MessageSquare,
  Paperclip,
  X,
  Image as ImageIcon,
  UploadCloud,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  image?: string;
}

interface ExtractedParams {
  product?: string;
  usp?: string;
  visualStyle?: string;
  tone?: string;
  shotCount?: number;
  platform?: string;
  talent?: string;
  refUrl?: string;
  engineMode?: string;
  customUserDraft?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  extracted: ExtractedParams;
  brief_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatInterfaceProps {
  user: any;
  accessToken: string;
  lang: "id" | "en";
  workerUrl: string;
  onGenerateStoryboard: (params: ExtractedParams) => Promise<void>;
  isGeneratingStoryboard: boolean;
  onLoadBrief: (briefId: string) => Promise<void>;
  isDocked?: boolean;
  onBriefUpdated?: (brief: any) => void;
}

export function ChatInterface({
  user,
  accessToken,
  lang,
  workerUrl,
  onGenerateStoryboard,
  isGeneratingStoryboard,
  onLoadBrief,
  isDocked = false,
  onBriefUpdated,
}: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedParams>({});
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCustomDraft, setIsCustomDraft] = useState(false);
  const [customUserDraft, setCustomUserDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error(lang === "id" ? "File maksimal 4MB." : "Max file size is 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        toast.success(
          lang === "id"
            ? "Gambar referensi visual berhasil dilampirkan!"
            : "Visual reference image attached successfully!",
        );
      };
      reader.readAsDataURL(file);
    } else {
      toast.error(
        lang === "id" ? "Hanya mendukung file gambar!" : "Only image files are supported!",
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error(lang === "id" ? "File maksimal 4MB." : "Max file size is 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        toast.success(
          lang === "id"
            ? "Gambar referensi visual berhasil dilampirkan!"
            : "Visual reference image attached successfully!",
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat sessions from Supabase
  const loadSessions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (e: any) {
      console.error("Error loading chat sessions:", e);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Start a new session
  const handleNewSession = () => {
    const defaultGreeting: Message = {
      role: "assistant",
      content:
        lang === "id"
          ? "Yo! Gua Vibeshot — AI creative strategist lo.\nCeritain aja mau bikin konten apa: produk, brand, campaign, atau paste link referensi video. Gua yang urus sisanya. 🎬"
          : "Yo! I'm Vibeshot — your AI creative strategist.\nJust tell me what content you want to create: your product, brand, campaign, or paste a reference video link. I'll handle the rest. 🎬",
      timestamp: new Date().toISOString(),
    };

    setCurrentSession(null);
    setMessages([defaultGreeting]);
    setExtracted({});
    setReadyToGenerate(false);
    setConfirmMessage("");
    setInputValue("");
    setAttachedImage(null);
    setShowHistory(false);
  };

  // Run initial onboarding greeting on mount
  useEffect(() => {
    if (messages.length === 0) {
      handleNewSession();
    }
  }, [lang]);

  // Load a specific session
  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages || []);
    setExtracted(session.extracted || {});
    setReadyToGenerate(false);
    setConfirmMessage("");
    setShowHistory(false);

    // If the session already generated a brief, load it on the right
    if (session.brief_id) {
      onLoadBrief(session.brief_id);
    }
  };

  // Delete a session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId);

      if (error) throw error;

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success(lang === "id" ? "Sesi berhasil dihapus." : "Session deleted successfully.");

      if (currentSession?.id === sessionId) {
        handleNewSession();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Save current session to Supabase
  const saveSession = async (
    updatedMessages: Message[],
    updatedExtracted: ExtractedParams,
    newBriefId: string | null = null,
  ) => {
    if (!user) return null;

    // Auto-generate title from extracted product or first message
    let title = currentSession?.title || "";
    if (!title) {
      if (updatedExtracted.product) {
        title = `Campaign: ${updatedExtracted.product}`;
      } else {
        const firstUserMsg = updatedMessages.find((m) => m.role === "user");
        title = firstUserMsg ? firstUserMsg.content.substring(0, 30) + "..." : "New Creative Brief";
      }
    }

    const payload = {
      user_id: user.id,
      title,
      messages: updatedMessages,
      extracted: updatedExtracted,
      brief_id: newBriefId || currentSession?.brief_id || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (currentSession?.id) {
        // Update existing session
        const { data, error } = await supabase
          .from("chat_sessions")
          .update(payload)
          .eq("id", currentSession.id)
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          const updated = data[0] as ChatSession;
          setCurrentSession(updated);
          setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }
      } else {
        // Create new session
        const { data, error } = await supabase.from("chat_sessions").insert(payload).select();

        if (error) throw error;
        if (data && data.length > 0) {
          const created = data[0] as ChatSession;
          setCurrentSession(created);
          setSessions((prev) => [created, ...prev]);
        }
      }
    } catch (e: any) {
      console.error("Error saving chat session:", e);
    }
  };

  // Send a message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) setInputValue("");

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      image: attachedImage || undefined,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);
    setReadyToGenerate(false);

    // Keep reference and reset attachment state immediately for smooth UI transition
    const imagePayload = attachedImage;
    setAttachedImage(null);

    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "chat_turn",
          conversationHistory: messages,
          newMessage: text,
          attachedImage: imagePayload || undefined,
          currentBriefId: currentSession?.brief_id || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat turn failed.");

      const aiMessage: Message = {
        role: "assistant",
        content: data.reply || "",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...nextMessages, aiMessage];
      setMessages(finalMessages);

      const newExtracted = data.extractedParams || {};
      setExtracted(newExtracted);
      setReadyToGenerate(data.readyToGenerate || false);

      if (data.readyToGenerate) {
        setConfirmMessage(
          data.confirmMessage || "📋 Data lo udah lengkap. Mau langsung kita eksekusi sekarang? 🚀",
        );
      }

      // Live Storyboard Editing Callback
      if (data.updatedBrief && onBriefUpdated) {
        onBriefUpdated(data.updatedBrief);
      }

      // Save history to Supabase asynchronously
      await saveSession(
        finalMessages,
        newExtracted,
        data.updatedBrief ? currentSession?.brief_id : null,
      );
    } catch (err: any) {
      toast.error(err.message);
      // Append error message to chat so the UI stays interactive
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            lang === "id"
              ? "Aduh sorry Cok, ada gangguan koneksi nih. Coba kirim ulang pesan lo ya!"
              : "Oops, my bad. Had a connection hiccup. Can you retry sending that?",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute storyboard generation
  const handleExecuteGeneration = async () => {
    if (!extracted.product || !extracted.usp) {
      toast.error(
        lang === "id" ? "Data belum lengkap untuk di-generate!" : "Incomplete data for generation!",
      );
      return;
    }

    try {
      await onGenerateStoryboard(extracted);

      // Update the chat session with the newly generated brief link
      // Wait: in VibeShotPlatform, we'll return the new cloudBriefId.
      // So we can save the brief ID into Supabase chat session after generation completes!
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleExecuteCustomDraft = async () => {
    if (!customUserDraft.trim()) {
      toast.error(
        lang === "id"
          ? "Draf naskah kosong! Silakan tulis draf naskah Anda."
          : "Draft is empty! Please write your script draft first.",
      );
      return;
    }

    try {
      await onGenerateStoryboard({
        product: extracted.product || "Custom Draft Campaign",
        usp: extracted.usp || "Berdasarkan naskah draf kustom user",
        engineMode: "custom_draft",
        customUserDraft: customUserDraft,
      });

      setCustomUserDraft("");
      setIsCustomDraft(false);
      toast.success(
        lang === "id"
          ? "Sukses meracik storyboard dari draf Anda!"
          : "Successfully compiled storyboard from your custom draft!",
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Helper: Hook a session save when VibeShotPlatform updates the brief_id
  const handleSetBriefId = async (briefId: string) => {
    if (currentSession) {
      await saveSession(messages, extracted, briefId);
    }
  };

  // Exposed method so parent can link brief to session
  React.useEffect(() => {
    // If the parent updates workspace, we might need to sync.
  }, []);

  // Quick reply chips
  const quickReplies =
    lang === "id"
      ? [
          "Bikin iklan Suzuki Carry 2026 buat UMKM",
          "Promo Kopi Gula Aren Janji Jiwa, vibe cinematic lofi",
          "Skit komedi buat brand skincare lokal",
        ]
      : [
          "Create a Suzuki Carry 2026 ad for small businesses",
          "Coffee promo, cinematic lofi mood",
          "Comedy skit for a local skincare brand",
        ];

  if (isDocked) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex flex-col h-full bg-white dark:bg-[#111111] overflow-hidden"
      >
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Premium drag and drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-35 bg-indigo-650/15 dark:bg-indigo-500/20 backdrop-blur-md border-2 border-dashed border-indigo-500 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3 transition-all duration-300 pointer-events-none">
            <UploadCloud className="w-12 h-12 text-indigo-500 animate-bounce" />
            <div>
              <h4 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                {lang === "id" ? "Lepas Gambar di Sini! 📸" : "Drop Reference Image Here! 📸"}
              </h4>
              <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider font-bold">
                {lang === "id"
                  ? "Lampirkan ke payload brief Vibeshot"
                  : "Attach directly as creative reference"}
              </p>
            </div>
          </div>
        )}

        {/* Chat Session Header / Selector */}
        <div className="border-b border-zinc-200/70 dark:border-zinc-800/80 p-3 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between shrink-0">
          <div className="relative flex-1 mr-2">
            <button
              onClick={() =>
                user
                  ? setShowHistory(!showHistory)
                  : toast.info(
                      lang === "id"
                        ? "Silakan login untuk menyimpan histori brief!"
                        : "Please log in to save brief history!",
                    )
              }
              className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer select-none text-left"
            >
              <span className="truncate flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                {currentSession?.title || (lang === "id" ? "Sesi Brief Baru" : "New Session Brief")}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showHistory ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown History Overlay */}
            {showHistory && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#151515] p-2 shadow-xl animate-[fadeIn_0.15s_ease-out]">
                <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-zinc-150 dark:border-zinc-800 font-mono text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                  <span>{lang === "id" ? "Riwayat Briefing" : "Briefing History"}</span>
                  <button
                    onClick={handleNewSession}
                    className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-bold"
                  >
                    <Plus className="w-3 h-3" /> NEW
                  </button>
                </div>
                {sessions.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400 font-mono italic">
                    {lang === "id" ? "Belum ada riwayat." : "No history found."}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSession(s)}
                        className={`flex items-center justify-between w-full text-left px-2 py-2 rounded-lg text-xs cursor-pointer transition ${currentSession?.id === s.id ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-650 dark:text-indigo-300 font-medium" : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"}`}
                      >
                        <span className="truncate flex-1 pr-2">{s.title}</span>
                        <button
                          onClick={(e) => handleDeleteSession(e, s.id)}
                          className="text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleNewSession}
            title={lang === "id" ? "Sesi Baru" : "New Session"}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Parameter Extracted Progress Indicator */}
        <div className="bg-zinc-50 dark:bg-[#151515] border-b border-zinc-200/50 dark:border-zinc-800/50 px-4 py-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 shrink-0 text-[10px] font-mono">
          <span className="text-zinc-400 uppercase tracking-wider font-bold">Parameters:</span>
          <span
            className={`flex items-center gap-1 ${extracted.product ? "text-emerald-500 font-semibold" : "text-zinc-400 dark:text-zinc-600"}`}
          >
            Product {extracted.product ? "✓" : "✗"}
          </span>
          <span className="text-zinc-200 dark:text-zinc-850">|</span>
          <span
            className={`flex items-center gap-1 ${extracted.usp ? "text-emerald-500 font-semibold" : "text-zinc-400 dark:text-zinc-600"}`}
          >
            USP {extracted.usp ? "✓" : "✗"}
          </span>
          <span className="text-zinc-200 dark:text-zinc-850">|</span>
          <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">
            {extracted.platform || "TikTok/Reels"}
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm border ${m.role === "user" ? "bg-indigo-500 border-indigo-650 text-white" : "bg-zinc-950 dark:bg-zinc-100 border-zinc-850 text-white dark:text-zinc-950"}`}
              >
                {m.role === "user" ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <span className="font-mono text-[10px] font-extrabold">V</span>
                )}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col gap-1.5">
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${m.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none"}`}
                >
                  {m.image && (
                    <div className="relative aspect-[9/16] w-32 overflow-hidden rounded-lg border border-white/10 shadow-md mb-2">
                      <img src={m.image} className="h-full w-full object-cover object-center" />
                    </div>
                  )}
                  {m.content}
                </div>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 px-1">
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Spinner Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%] animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center border border-zinc-850 shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl rounded-tl-none text-[11px] text-zinc-400 font-mono italic">
                  Vibeshot is analyzing your brief...
                </div>
              </div>
            </div>
          )}

          {/* Visual Extracted / Confirmation Panel */}
          {readyToGenerate && !isGeneratingStoryboard && (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-4 space-y-3.5 shadow-sm animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Cetak Biru Siap Dieksekusi!</span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {confirmMessage}
              </p>

              <div className="bg-white/60 dark:bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-150 dark:border-zinc-850 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Product:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {extracted.product}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Platform:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300">
                    {extracted.platform || "TikTok/Reels (default)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">Shots:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300">
                    {extracted.shotCount || 6} Shots
                  </span>
                </div>
              </div>

              <button
                onClick={handleExecuteGeneration}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-bold shadow-md hover:shadow-indigo-550/20 active:scale-98 transition duration-150 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Eksekusi Cetak Biru Konten 🚀
              </button>
            </div>
          )}

          {isGeneratingStoryboard && (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/20 p-4 flex flex-col items-center justify-center text-center space-y-3.5 shadow-sm">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              <div>
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Meracik Runtutan Storyboard...
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                  Menyusun spesifikasi camera movement, VO copywriting, dan tech budget hack.
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attached Image Preview Card */}
        {attachedImage && (
          <div className="px-3 pt-2 bg-white dark:bg-[#111111] shrink-0 border-t border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="relative inline-flex items-center gap-2 p-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-lg shadow-sm animate-[fadeIn_0.2s_ease-out]">
              <img
                src={attachedImage}
                className="w-10 h-10 object-cover rounded-md border border-zinc-150 dark:border-zinc-800"
              />
              <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                reference_visual.png
              </span>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1 text-zinc-450 hover:text-red-500 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="border-t border-zinc-200/80 dark:border-zinc-800 p-3 bg-white dark:bg-[#111111] shrink-0 space-y-2">
          {/* Custom Draft Mode Toggle */}
          <div className="flex items-center justify-between px-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            <span className="font-bold uppercase tracking-wider">✍️ Custom Draft Mode</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCustomDraft}
                onChange={(e) => setIsCustomDraft(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 dark:after:bg-zinc-400 peer-checked:after:bg-indigo-500 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500/10"></div>
            </label>
          </div>

          {isCustomDraft ? (
            <div className="space-y-2 animate-[fadeIn_0.2s_ease-out]">
              <textarea
                rows={4}
                value={customUserDraft}
                onChange={(e) => setCustomUserDraft(e.target.value)}
                placeholder={
                  lang === "id"
                    ? "Tulis naskah step-by-step draf Anda di sini (misal:\nScene 1: Close up kopi tumpah...\nScene 2: Orang kaget...)"
                    : "Write your step-by-step script draft here (e.g.:\nScene 1: Close up spilled coffee...\nScene 2: Person shocked...)"
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:outline-none transition-all shadow-inner font-sans resize-none"
              />
              <button
                type="button"
                onClick={handleExecuteCustomDraft}
                disabled={!customUserDraft.trim() || isGeneratingStoryboard}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-bold shadow-md hover:shadow-indigo-550/20 active:scale-98 transition duration-150 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                {lang === "id" ? "Eksekusi Draf Kasar 🚀" : "Compile Draft Storyboard 🚀"}
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* File attachment paperclip button */}
              <button
                type="button"
                title={lang === "id" ? "Lampirkan gambar referensi" : "Attach reference image"}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 p-2 text-zinc-450 hover:text-indigo-500 hover:border-indigo-500/50 transition cursor-pointer active:scale-95 duration-100 shrink-0"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading || isGeneratingStoryboard}
                placeholder={
                  lang === "id"
                    ? "Tulis brief lo di sini santai aja..."
                    : "Chat your campaign brief here..."
                }
                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 pl-3.5 pr-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={
                  (!inputValue.trim() && !attachedImage) || isLoading || isGeneratingStoryboard
                }
                className="rounded-xl bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 p-2 text-white dark:text-zinc-900 transition disabled:opacity-30 cursor-pointer active:scale-95 duration-100 shrink-0 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // OTHERWISE: FULL CANVAS IMMERSIVE MODE (hasResult === false)
  const isLandingMode = messages.length <= 1;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex flex-col h-full bg-transparent overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Premium drag and drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-35 bg-indigo-650/10 dark:bg-indigo-500/10 backdrop-blur-xl border-2 border-dashed border-indigo-500 rounded-3xl flex flex-col items-center justify-center text-center p-6 space-y-3 transition-all duration-300 pointer-events-none">
          <UploadCloud className="w-16 h-16 text-indigo-500 animate-bounce" />
          <div>
            <h4 className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              {lang === "id" ? "Lepas Gambar di Sini! 📸" : "Drop Reference Image Here! 📸"}
            </h4>
            <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider font-bold">
              {lang === "id"
                ? "Analisis gaya visual multimodal otomatis"
                : "Multimodal visual intelligence analysis"}
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="px-6 py-4 flex items-center justify-between shrink-0 relative z-20">
        <div className="relative">
          <button
            onClick={() =>
              user
                ? setShowHistory(!showHistory)
                : toast.info(
                    lang === "id"
                      ? "Silakan login untuk menyimpan histori brief!"
                      : "Please log in to save brief history!",
                  )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition backdrop-blur-md cursor-pointer select-none"
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === "id" ? "Riwayat Studio" : "Studio History"}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showHistory ? "rotate-180" : ""}`}
            />
          </button>

          {showHistory && (
            <div className="absolute top-full left-0 z-30 mt-1.5 w-64 max-h-60 overflow-y-auto rounded-2xl border border-zinc-250/60 dark:border-zinc-800/80 bg-white/95 dark:bg-[#151515]/95 p-2 shadow-2xl backdrop-blur-lg animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-zinc-150 dark:border-zinc-800 font-mono text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                <span>{lang === "id" ? "Riwayat Briefing" : "Briefing History"}</span>
                <button
                  onClick={handleNewSession}
                  className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-bold"
                >
                  <Plus className="w-3 h-3" /> NEW
                </button>
              </div>
              {sessions.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 font-mono italic">
                  {lang === "id" ? "Belum ada riwayat." : "No history found."}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s)}
                      className={`flex items-center justify-between w-full text-left px-2 py-2 rounded-lg text-xs cursor-pointer transition ${currentSession?.id === s.id ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-650 dark:text-indigo-300 font-medium" : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"}`}
                    >
                      <span className="truncate flex-1 pr-2">{s.title}</span>
                      <button
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        className="text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!isLandingMode && (
          <button
            onClick={handleNewSession}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-550 transition backdrop-blur-md cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === "id" ? "Brief Baru" : "New Brief"}</span>
          </button>
        )}
      </div>

      {/* Main Immersive Canvas Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-between items-center relative z-10">
        {isLandingMode ? (
          /* ONBOARDING EMPTY LANDING STATE */
          <div className="my-auto w-full max-w-4xl flex flex-col items-center justify-center space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Top Creative Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 dark:border-indigo-400/20 bg-indigo-500/5 dark:bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-tight text-indigo-600 dark:text-indigo-300 shadow-[0_4px_12px_rgba(99,102,241,0.08)] pointer-events-none">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              <span>✨ Intelligence Creative Hub</span>
            </div>

            {/* Serif Styled Header */}
            <h1 className="text-4xl md:text-[52px] font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.08] text-center max-w-3xl">
              Research. Write.{" "}
              <span
                className="font-serif italic font-normal text-indigo-650 dark:text-indigo-400 pr-1"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                Create.
              </span>
              <br />
              All in One AI Storyboard.
            </h1>

            {/* Subtitle */}
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base text-center max-w-xl leading-relaxed">
              Unlock the full potential of video ideas with a single platform designed to power your
              narrative, copywriting, and visual storyboard workflows.
            </p>

            {/* Try CTA trigger */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setInputValue(
                    lang === "id"
                      ? "Bikin iklan kopi susu gula aren dengan vibe cinematic lofi..."
                      : "Create a cinematic lofi iced coffee commercial...",
                  );
                  toast.success(
                    lang === "id" ? "Ide dimasukkan ke search box!" : "Idea filled in search box!",
                  );
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-650/10 hover:bg-indigo-650/15 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-400/20 text-indigo-650 dark:text-indigo-300 text-xs font-bold px-4 py-2 hover:scale-105 active:scale-95 duration-150 cursor-pointer transition-all"
              >
                <span>Try This Idea</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE IMMERSIVE CHAT LOG */
          <div className="w-full max-w-3xl flex-1 flex flex-col space-y-6 pt-4 justify-end pb-24">
            <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-280px)] pr-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${m.role === "user" ? "bg-indigo-600 border-indigo-650 text-white" : "bg-zinc-950 dark:bg-zinc-100 border-zinc-850 text-white dark:text-zinc-950"}`}
                  >
                    {m.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <span className="font-mono text-xs font-extrabold">V</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-xs leading-relaxed whitespace-pre-wrap shadow-md ${m.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none backdrop-blur-sm"}`}
                    >
                      {m.image && (
                        <div className="relative aspect-[9/16] w-36 overflow-hidden rounded-xl border border-white/10 shadow-md mb-2.5">
                          <img src={m.image} className="h-full w-full object-cover object-center" />
                        </div>
                      )}
                      {m.content}
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 px-1">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 mr-auto max-w-[85%] animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center border border-zinc-850 shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="p-4 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl rounded-tl-none text-[11px] text-zinc-400 font-mono italic backdrop-blur-sm">
                      Vibeshot is analyzing your brief...
                    </div>
                  </div>
                </div>
              )}

              {readyToGenerate && !isGeneratingStoryboard && (
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-5 space-y-4 shadow-xl backdrop-blur-md animate-[fadeIn_0.3s_ease-out] w-full max-w-2xl">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-indigo-650 dark:text-indigo-400">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Cetak Biru Siap Dieksekusi!</span>
                  </div>

                  <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap font-medium">
                    {confirmMessage}
                  </p>

                  <div className="bg-white/60 dark:bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-200/40 dark:border-zinc-850 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-mono">Product:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-100">
                        {extracted.product}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-mono">Platform:</span>
                      <span className="font-semibold text-zinc-850 dark:text-zinc-200">
                        {extracted.platform || "TikTok/Reels (default)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 font-mono">Shots:</span>
                      <span className="font-semibold text-zinc-850 dark:text-zinc-200">
                        {extracted.shotCount || 6} Shots
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteGeneration}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-bold shadow-lg hover:shadow-indigo-500/30 active:scale-98 transition duration-150 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Eksekusi Cetak Biru Konten 🚀
                  </button>
                </div>
              )}

              {isGeneratingStoryboard && (
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/10 dark:bg-indigo-950/10 p-5 flex flex-col items-center justify-center text-center space-y-3.5 shadow-md backdrop-blur-md">
                  <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Meracik Runtutan Storyboard...
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      Menyusun spesifikasi camera movement, VO copywriting, dan tech budget hack.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAPSULE SEARCH INPUT BAR */}
        <div
          className={`w-full max-w-2xl relative z-20 ${isLandingMode ? "" : "fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6"} space-y-3`}
        >
          {/* Custom Draft Mode Toggle */}
          <div className="flex items-center justify-between px-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              ✍️ Custom Draft Mode
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCustomDraft}
                onChange={(e) => setIsCustomDraft(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 dark:after:bg-zinc-400 peer-checked:after:bg-indigo-500 after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-500/10"></div>
            </label>
          </div>

          {isCustomDraft ? (
            <div className="rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-950/80 backdrop-blur-xl p-4 space-y-3 shadow-2xl animate-[fadeIn_0.2s_ease-out] w-full">
              <textarea
                rows={5}
                value={customUserDraft}
                onChange={(e) => setCustomUserDraft(e.target.value)}
                placeholder={
                  lang === "id"
                    ? "Tulis naskah step-by-step draf Anda di sini (misal:\nScene 1: Close up kopi tumpah...\nScene 2: Orang kaget...)"
                    : "Write your step-by-step script draft here (e.g.:\nScene 1: Close up spilled coffee...\nScene 2: Person shocked...)"
                }
                className="w-full rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/40 p-3.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-450 dark:placeholder:text-zinc-600 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:outline-none transition-all shadow-inner font-sans resize-none"
              />
              <button
                type="button"
                onClick={handleExecuteCustomDraft}
                disabled={!customUserDraft.trim() || isGeneratingStoryboard}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white py-3 text-xs font-bold shadow-lg hover:shadow-indigo-550/30 active:scale-98 transition duration-150 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                {lang === "id" ? "Eksekusi Draf Kasar 🚀" : "Compile Draft Storyboard 🚀"}
              </button>
            </div>
          ) : (
            <>
              {attachedImage && (
                <div className="px-4 py-2 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-md shrink-0 border-t border-dashed border-zinc-250 dark:border-zinc-850 rounded-t-2xl max-w-xs ml-4">
                  <div className="relative inline-flex items-center gap-2 p-1 bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 rounded-lg shadow-sm">
                    <img
                      src={attachedImage}
                      className="w-8 h-8 object-cover rounded-md border border-zinc-200 dark:border-zinc-800"
                    />
                    <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                      visual_ref.png
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="p-0.5 text-zinc-450 hover:text-red-500 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center bg-white/75 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/80 rounded-full py-2.5 pl-3.5 pr-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-300"
              >
                {/* Spinning Polychromatic Spark Icon */}
                <div className="pl-1 shrink-0 select-none">
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ animationDuration: "8s" }}
                  >
                    <defs>
                      <linearGradient id="spark-gradient-full" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"
                      fill="url(#spark-gradient-full)"
                    />
                  </svg>
                </div>

                {/* Input Element */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading || isGeneratingStoryboard}
                  placeholder={
                    lang === "id"
                      ? "Tulis ide kasar video / brand lo di sini..."
                      : "Tell me your viral brand video idea..."
                  }
                  className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none pl-3.5 pr-2 text-xs sm:text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-555 h-8 font-medium"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Image Upload Clip */}
                  <button
                    type="button"
                    title={lang === "id" ? "Lampirkan gambar referensi" : "Attach reference image"}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 p-2 text-zinc-450 hover:text-indigo-500 transition cursor-pointer active:scale-95"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>

                  {/* Action Circle Blue Send Button */}
                  <button
                    type="submit"
                    disabled={
                      (!inputValue.trim() && !attachedImage) || isLoading || isGeneratingStoryboard
                    }
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 transition disabled:opacity-30 cursor-pointer active:scale-95 duration-100 shadow-md hover:shadow-indigo-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* BOTTOM MONOCHROME PARTNER LOGO STRIP */}
        {isLandingMode && (
          <div className="w-full max-w-4xl text-center pt-8 pb-4 shrink-0 relative z-20 pointer-events-none select-none">
            <span className="block text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest mb-4">
              Supported Formats & AI Technologies
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-mono font-extrabold tracking-widest text-zinc-400 dark:text-zinc-600 opacity-60">
              <span>TIKTOK</span>
              <span className="text-zinc-200 dark:text-zinc-800 font-normal">/</span>
              <span>INSTAGRAM REELS</span>
              <span className="text-zinc-200 dark:text-zinc-800 font-normal">/</span>
              <span>YOUTUBE SHORTS</span>
              <span className="text-zinc-200 dark:text-zinc-800 font-normal">/</span>
              <span>SUPABASE</span>
              <span className="text-zinc-200 dark:text-zinc-800 font-normal">/</span>
              <span>FAL.AI</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
