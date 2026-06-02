import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Database,
  Terminal,
  ShieldAlert,
  Sparkles,
  Copy,
  Coins,
  RefreshCw,
  Wallet,
  CheckCircle2,
  Lock,
  Globe,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

export const Route = createFileRoute("/web3-hub")({
  component: Web3IntelligenceHub,
});

function Web3IntelligenceHub() {
  const { publicKey, connected, wallet } = useWallet();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bson" | "mayar">("bson");

  // Mock Web3 Analytics Data
  const [analytics, setAnalytics] = useState({
    trackedCampaigns: 42,
    totalWalletEngagements: 1420,
    couponsDistributed: 280,
    averageGasSavedSol: "0.45 SOL",
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setAnalytics({
        trackedCampaigns: 42 + Math.floor(Math.random() * 3),
        totalWalletEngagements: 1420 + Math.floor(Math.random() * 50),
        couponsDistributed: 280 + Math.floor(Math.random() * 10),
        averageGasSavedSol: (0.45 + Math.random() * 0.05).toFixed(2) + " SOL",
      });
      setIsRefreshing(false);
      toast.success("Web3 Campaign Metrics updated!");
    }, 800);
  };

  const bsonSchemaStr = `{
  "_id": {
    "$oid": "665c82eb0000000000000001"
  },
  "user_id": {
    "$oid": "507f1f77bcf86cd799439011"
  },
  "title": "Suzuki Carry 2026 UMKM Campaign",
  "premise": "Iklan komedi membawa Carry pick-up melewati pasar becek tanpa tergelincir",
  "visual_style": "real-life cinematic",
  "master_identity": {
    "talent": "Supir carry setengah baya mengenakan handuk leher",
    "product": "Suzuki Carry pick-up putih mengkilap beroda kokoh"
  },
  "shotlist": [
    {
      "angle": "Wide low-angle tracking shot",
      "location": "Pasar tradisional becek di pagi hari",
      "tech_budget_hack": "Gunakan semprotan air selang manual untuk menciptakan efek becek mengkilap di aspal",
      "action": "Suzuki Carry melaju dengan tenang membelah genangan air di pasar",
      "audio": "VO (Jakarta-slang): 'UMKM tangguh butuh armada yang gak banyak cincong!'",
      "imagePrompt": "Cinematic wide angle, white Suzuki Carry pickup truck driving gracefully through wet muddy market road, sunrise dramatic lighting, 9:16 portrait"
    }
  ],
  "moodboard": [
    "https://images.pollinations.ai/p/cinematic%20suzuki%20carry%20pickup...?"
  ],
  "created_at": {
    "$date": "2026-06-03T05:40:00.000Z"
  }
}`;

  const mayarSchemaStr = `{
  "subscription_tier": "premium",
  "granted_credits": 300,
  "mayar_transaction": {
    "id": "mayar_tx_908312739",
    "amount": 150000,
    "payment_type": "qris",
    "status": "settlement",
    "metadata": {
      "user_id": "507f1f77bcf86cd799439011"
    }
  },
  "billing_cycle": {
    "type": "one_time_upgrade",
    "currency": "IDR",
    "auto_renew": false
  }
}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    toast.success(`${label} schema copied to clipboard!`);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans p-6 md:p-12 relative overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Decorative Cyber Gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-5%] w-[55vw] h-[55vw] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-purple-500/5 blur-[110px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-6">
          <div className="space-y-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-2 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Back to Studio Workspace
            </Link>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Coins className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
                Web3 Intelligence Hub
              </h1>
            </div>
            <p className="text-xs text-zinc-450">
              Agent-based MongoDB BSON adapters, Solana wallet validators & local Mayar billing
              schemas.
            </p>
          </div>

          {/* Wallet Status Area */}
          <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 shadow-md backdrop-blur-md shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-650/15 border border-indigo-500/20 text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-extrabold">
                Solana Identity Verification
              </div>
              {connected && publicKey ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-emerald-400 max-w-[120px] truncate select-all">
                    {publicKey.toBase58()}
                  </span>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold">
                    ({wallet?.adapter.name})
                  </span>
                </div>
              ) : (
                <div className="text-xs text-zinc-400 italic">Not Connected (Asinkron Sandbox)</div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Web3 Analytics Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block">
                  Tracked Briefs
                </span>
                <span className="text-2xl font-bold tracking-tight text-white block mt-1">
                  {analytics.trackedCampaigns}
                </span>
              </div>

              <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500" />
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block">
                  Wallet Engagements
                </span>
                <span className="text-2xl font-bold tracking-tight text-white block mt-1">
                  {analytics.totalWalletEngagements}
                </span>
              </div>

              <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block">
                  Coupons Distributed
                </span>
                <span className="text-2xl font-bold tracking-tight text-white block mt-1">
                  {analytics.couponsDistributed}
                </span>
              </div>

              <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block">
                  Solana Gas Saved
                </span>
                <span className="text-2xl font-bold tracking-tight text-white block mt-1">
                  {analytics.averageGasSavedSol}
                </span>
              </div>
            </div>

            {/* MCP Schema Console Card */}
            <div className="bg-[#121215] border border-zinc-800/60 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-zinc-800/60 pb-4 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>Integration Schemas & Grounding</span>
                </div>
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setActiveTab("bson")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === "bson" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
                  >
                    MongoDB BSON
                  </button>
                  <button
                    onClick={() => setActiveTab("mayar")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === "mayar" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
                  >
                    Mayar Subscription
                  </button>
                </div>
              </div>

              {activeTab === "bson" ? (
                <div className="space-y-4">
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    Format adapter MongoDB BSON digunakan untuk menjembatani query dari **MongoDB
                    MCP Server** dengan **Google Cloud Agent Builder**. Format ini mengubah UUID
                    normal menjadi representasi BSON `$oid` dan mencantumkan timestamp `$date`.
                  </div>
                  <div className="relative group">
                    <button
                      onClick={() => handleCopy(bsonSchemaStr, "BSON Document")}
                      className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition border border-zinc-750 text-zinc-400 hover:text-zinc-250 cursor-pointer"
                    >
                      {copiedSection === "BSON Document" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <pre className="bg-[#050507] text-[10.5px] font-mono p-4 rounded-lg border border-zinc-850 overflow-x-auto text-indigo-350 max-h-[380px] leading-relaxed">
                      {bsonSchemaStr}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    Struktur JSON data billing dari webhook **API Mayar** lokal Indonesia. Ketika
                    pembayaran terkonfirmasi, webhook dialihkan asinkron untuk memperbarui profile
                    user menjadi premium tier dan menambahkan 300 credits render visual secara
                    instan.
                  </div>
                  <div className="relative group">
                    <button
                      onClick={() => handleCopy(mayarSchemaStr, "Mayar Subscription")}
                      className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition border border-zinc-750 text-zinc-400 hover:text-zinc-250 cursor-pointer"
                    >
                      {copiedSection === "Mayar Subscription" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <pre className="bg-[#050507] text-[10.5px] font-mono p-4 rounded-lg border border-zinc-850 overflow-x-auto text-emerald-400 max-h-[380px] leading-relaxed">
                      {mayarSchemaStr}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Web3 Security Auditing & Anti-Bot Side Panel */}
          <div className="space-y-6">
            {/* GCP Budget Card */}
            <div className="bg-[#121215] border border-zinc-800/60 rounded-xl p-5 shadow-lg space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-white">
                <Lock className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase tracking-wider border-b border-zinc-800/60 pb-3">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>GCP API Budget Guard</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Total Credit Limit:</span>
                  <span className="font-bold text-white font-mono">Rp 8.000.000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Services Guarded:</span>
                  <span className="text-zinc-300 font-mono text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    Vertex AI & Cloud Run
                  </span>
                </div>
                <div className="w-full bg-zinc-850 h-[6px] rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[25%]" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Budget guard diaktifkan otomatis melalui skrip deployment{" "}
                  <code className="text-zinc-350">setup-gcp-budget.sh</code>. Memicu Pub/Sub alerts
                  dan shutdown di bawah Rp8 Juta untuk mencegah kebocoran kredit.
                </p>
              </div>
            </div>

            {/* Anti-Bot Actions & Real-Time Monitoring */}
            <div className="bg-[#121215] border border-zinc-800/60 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>On-Chain Verification Logger</span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1 hover:bg-zinc-800 rounded transition border border-zinc-750 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-normal">
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>ACTION</span>
                    <span>STATUS</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-350 truncate max-w-[150px]">
                      Pendo track: shared_brief_viewed
                    </span>
                    <span className="text-emerald-400">Success</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-350 truncate max-w-[150px]">
                      Verify signature: 3a2BcdF...
                    </span>
                    <span className="text-emerald-400">Confirmed</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-350">Novus.ai Telemetry: pageview</span>
                    <span className="text-emerald-400">Success</span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Semua analitik, track event Pendo, dan telemetri disuntikkan secara asinkron dari
                  tag <code className="text-zinc-350">&lt;head&gt;</code> layout utama tanpa
                  memblokir proses render halaman utama.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Footer Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-zinc-800/80 pt-6 gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-550 font-mono">
            <Globe className="w-3.5 h-3.5" />
            <span>vibeshot.studio — Web3 Integration Hub v1.0.0</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-550">Grounding Source:</span>
            <span className="font-mono text-indigo-400 font-bold bg-[#121215] border border-zinc-800 px-2 py-0.5 rounded text-[10px]">
              PROJECT_CONTEXT.md
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
