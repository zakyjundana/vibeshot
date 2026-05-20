import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Sparkles, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
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
  imagePrompt?: string; // Menampung teks prompt asli dari backend
}

const TRENDS = [
  "POV Storytime",
  "Day in the Life",
  "Get Ready With Me",
  "Before vs After",
  "Silent Review",
  "Tutorial / How-to",
  "Unboxing ASMR",
];

const TONES: Tone[] = ["Comedic", "Emotional", "Educational", "Dramatic"];

const DEFAULT_WORKER_URL = "https://vibeshot-backend-ai.zakyjundana.workers.dev/";

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
    imagePrompt: String(r?.imagePrompt ?? ""), // Normalisasi teks prompt gambar
  }));
}

function normalizeMoodboard(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .map((r: any) => (typeof r === "string" ? r : r?.url ?? r?.image ?? r?.src ?? ""))
    .filter(Boolean);
}

function VibeShotDashboard() {
  const workerUrl = DEFAULT_WORKER_URL;
  const [productName, setProductName] = useState("");
  const [usp, setUsp] = useState("");
  const [trend, setTrend] = useState("");
  const [tone, setTone] = useState<Tone>("Comedic");
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
    return productName.trim()
      ? `${productName.trim()} — ${trend} (${tone})`
      : "Untitled Content Plan";
  }, [titleOverride, productName, trend, tone]);

  const premise = useMemo(() => {
    if (premiseOverride) return premiseOverride;
    if (!productName && !usp)
      return "Your content premise will appear here. Fill in the product name and core USP on the left, pick a TikTok trend and tone, then generate a brief. The premise will weave the product's unique selling point into a short, scroll-stopping narrative built around the chosen trend — opening hook, mid-roll tension, and a satisfying payoff that ties back to the product.";
    return `A ${tone.toLowerCase()} short-form video built around the "${trend}" trend, introducing ${productName || "the product"} through a relatable opening hook. The story leans into ${usp || "the product's core benefit"}, escalating through a moment of tension or curiosity before delivering a satisfying payoff. The final beat ties the product back to the viewer's daily life — engineered for completion rate, saves, and shares.`;
  }, [premiseOverride, productName, usp, trend, tone]);

  const handleGenerate = async () => {
    if (!workerUrl.trim()) {
      setErrorMsg("Worker URL is required.");
      toast.error("Worker URL is required.");
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
    };

    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const rawBody = await res.text();
      let parsedBody: any = null;
      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        // not JSON
      }

      if (!res.ok) {
        const detail =
          (parsedBody &&
            (parsedBody.error ||
              parsedBody.message ||
              parsedBody.detail ||
              (typeof parsedBody === "string" ? parsedBody : null))) ||
          rawBody ||
          `${res.status} ${res.statusText}`;
        throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
      }

      const data: any = parsedBody ?? {};

      const nextShots =
        normalizeShots(data?.shotlist ?? data?.shots ?? data?.shotList) ??
        seedShots(Math.max(1, Math.min(20, shotCount)));
      const nextMoodboard = normalizeMoodboard(data?.moodboard ?? data?.moodBoard ?? data?.images) ?? [];
      const nextPremise =
        typeof data?.premise === "string"
          ? data.premise
          : typeof data?.contentPremise === "string"
            ? data.contentPremise
            : null;
      const nextTitle = typeof data?.title === "string" ? data.title : null;

      setShots(nextShots);
      setMoodboard(nextMoodboard);
      setPremiseOverride(nextPremise);
      setTitleOverride(nextTitle);
      setHasResult(true);
      toast.success("Production brief generated!");
    } catch (err: any) {
      const msg = err?.message ?? "Failed to generate brief.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateShot = (id: string, key: keyof Omit<Shot, "id">, value: string) => {
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const addShot = () =>
    setShots((prev) => [
      ...prev,
      { id: crypto.randomUUID(), angle: "", location: "", action: "", audio: "", image: "", imagePrompt: "" },
    ]);

  const removeShot = (id: string) =>
    setShots((prev) => prev.filter((s) => s.id !== id));

  const moodboardTiles = moodboard.length > 0 ? moodboard : [null, null, null, null];

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-hairline bg-white/80 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">VibeShot AI</span>
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Creative Strategist
          </span>
        </div>
        <div className="text-xs text-muted-foreground">v0.1 · Production Brief Studio</div>
      </header>

      <div className="grid min-h-[calc(100vh-49px)] grid-cols-1 lg:grid-cols-[440px_1fr]">
        {/* LEFT — Input Panel */}
        <aside className="border-r border-hairline bg-white p-6 lg:sticky lg:top-[49px] lg:h-[calc(100vh-49px)] lg:overflow-y-auto">
          <h1 className="text-base font-semibold tracking-tight">Brief Inputs</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Feed the strategist. Output renders on the right in real-time.
          </p>

          <div className="mt-6 space-y-5">

            <Field label="Product Name">
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Lumio Glow Serum"
                className="input"
              />
            </Field>

            <Field label="Core USP">
              <textarea
                value={usp}
                onChange={(e) => setUsp(e.target.value)}
                rows={4}
                placeholder="What makes this product unforgettable in one sentence?"
                className="input resize-none"
              />
            </Field>

            <Field label="Trend">
              <input
                type="text"
                value={trend}
                onChange={(e) => setTrend(e.target.value)}
                placeholder="Contoh: POV Storytime, ASMR Unboxing, atau tempel link video TikTok/Reels di sini"
                className="input"
              />
            </Field>

            <Field label="Content Tone">
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                      tone === t
                        ? "border-foreground bg-foreground text-white"
                        : "border-hairline bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Number of Shots">
              <input
                type="number"
                min={1}
                max={20}
                value={shotCount}
                onChange={(e) => setShotCount(parseInt(e.target.value || "1", 10))}
                className="input w-28"
              />
            </Field>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-accent-green px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-green-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Production Brief
                </>
              )}
            </button>

            {errorMsg && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMsg}
              </p>
            )}
          </div>
        </aside>

        {/* RIGHT — Live Preview Board */}
        <main className="bg-canvas p-6 lg:p-10">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Content Plan
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  {title}
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                  hasResult
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    hasResult ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {hasResult ? "Generated" : "Draft"}
              </span>
            </div>

            {/* Premise */}
            <section className="mt-6 rounded-xl border border-hairline bg-white p-5 shadow-card">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Content Premise
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {premise}
              </p>
            </section>

            {/* Moodboard */}
            <section className="mt-6">
              <div className="flex items-end justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Visual Moodboard
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {moodboardTiles.length} references
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {moodboardTiles.map((src, i) => (
                  <div
                    key={i}
                    className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={`Moodboard reference ${i + 1}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400">
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-[10px] uppercase tracking-wider">
                          Ref {i + 1}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Shotlist */}
            <section className="mt-6 overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Interactive Shotlist
                </h3>
                <button
                  onClick={addShot}
                  className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Add row
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="w-14 border-b border-hairline px-4 py-2.5">#</th>
                      <th className="w-24 border-b border-hairline px-3 py-2.5">Visual</th>
                      <th className="w-64 border-b border-hairline px-3 py-2.5">AI Image Prompt Text</th> {/* KOLOM BARU */}
                      <th className="w-40 border-b border-hairline px-3 py-2.5">
                        Camera Angle
                      </th>
                      <th className="w-40 border-b border-hairline px-3 py-2.5">
                        Location
                      </th>
                      <th className="border-b border-hairline px-3 py-2.5">
                        Action / Visual
                      </th>
                      <th className="border-b border-hairline px-3 py-2.5">
                        Audio / VO
                      </th>
                      <th className="w-10 border-b border-hairline px-2 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {shots.map((s, idx) => (
                      <tr
                        key={s.id}
                        className="group border-b border-hairline last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-2 align-top text-xs font-mono font-medium text-slate-400">
                          {String(idx + 1).padStart(2, "0")}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {s.image ? (
                            <img 
                              src={s.image} 
                              alt={`Shot ${idx + 1}`} 
                              className="h-12 w-20 rounded object-cover border border-hairline bg-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-12 w-20 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
                              No Visual
                            </div>
                          )}
                        </td>
                        {/* INPUT FIELD BARU UNTUK EDIT/COPY PROMPT GAMBAR AI */}
                        <Cell
                          value={s.imagePrompt || ""}
                          placeholder="AI Image Prompt text will appear here..."
                          onChange={(v) => updateShot(s.id, "imagePrompt", v)}
                        />
                        <Cell
                          value={s.angle}
                          placeholder="Close-up"
                          onChange={(v) => updateShot(s.id, "angle", v)}
                        />
                        <Cell
                          value={s.location}
                          placeholder="Bedroom"
                          onChange={(v) => updateShot(s.id, "location", v)}
                        />
                        <Cell
                          value={s.action}
                          placeholder="Describe the visual…"
                          onChange={(v) => updateShot(s.id, "action", v)}
                        />
                        <Cell
                          value={s.audio}
                          placeholder="VO, SFX, music cue…"
                          onChange={(v) => updateShot(s.id, "audio", v)}
                        />
                        <td className="px-2 py-2 text-right align-top">
                          <button
                            onClick={() => removeShot(s.id)}
                            className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                            aria-label="Delete row"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="mt-6 text-center text-[11px] text-muted-foreground">
              Auto-saved · last edited just now
            </div>
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

function Cell({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <td className="px-3 py-1 align-top">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-slate-300 focus:bg-white focus:outline-none"
      />
    </td>
  );
}
