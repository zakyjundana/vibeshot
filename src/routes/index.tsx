import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Sparkles, Image as ImageIcon, FileText } from "lucide-react";

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

const seedShots = (n: number): Shot[] =>
  Array.from({ length: n }, (_, i) => ({
    id: crypto.randomUUID(),
    angle: i === 0 ? "Close-up" : i === 1 ? "Medium Shot" : "Wide Shot",
    location: i === 0 ? "Bedroom" : "Living Room",
    action: "",
    audio: "",
  }));

function VibeShotDashboard() {
  const [productName, setProductName] = useState("");
  const [usp, setUsp] = useState("");
  const [trend, setTrend] = useState(TRENDS[0]);
  const [tone, setTone] = useState<Tone>("Comedic");
  const [shotCount, setShotCount] = useState(4);
  const [shots, setShots] = useState<Shot[]>(() => seedShots(4));

  const title = useMemo(
    () =>
      productName.trim()
        ? `${productName.trim()} — ${trend} (${tone})`
        : "Untitled Content Plan",
    [productName, trend, tone],
  );

  const premise = useMemo(() => {
    if (!productName && !usp)
      return "Your content premise will appear here. Fill in the product name and core USP on the left, pick a TikTok trend and tone, then generate a brief. The premise will weave the product's unique selling point into a short, scroll-stopping narrative built around the chosen trend — opening hook, mid-roll tension, and a satisfying payoff that ties back to the product.";
    return `A ${tone.toLowerCase()} short-form video built around the "${trend}" trend, introducing ${productName || "the product"} through a relatable opening hook. The story leans into ${usp || "the product's core benefit"}, escalating through a moment of tension or curiosity before delivering a satisfying payoff. The final beat ties the product back to the viewer's daily life — engineered for completion rate, saves, and shares.`;
  }, [productName, usp, trend, tone]);

  const handleGenerate = () => {
    setShots(seedShots(Math.max(1, Math.min(20, shotCount))));
  };

  const updateShot = (id: string, key: keyof Omit<Shot, "id">, value: string) => {
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const addShot = () =>
    setShots((prev) => [
      ...prev,
      { id: crypto.randomUUID(), angle: "", location: "", action: "", audio: "" },
    ]);

  const removeShot = (id: string) =>
    setShots((prev) => prev.filter((s) => s.id !== id));

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

            <Field label="TikTok Trend">
              <select
                value={trend}
                onChange={(e) => setTrend(e.target.value)}
                className="input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[length:12px] bg-[right_0.85rem_center] bg-no-repeat pr-9"
              >
                {TRENDS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
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
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-accent-green px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-green-hover active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4" />
              Generate Production Brief
            </button>
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Draft
              </span>
            </div>

            {/* Premise */}
            <section className="mt-6 rounded-xl border border-hairline bg-white p-5 shadow-card">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Content Premise
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{premise}</p>
            </section>

            {/* Moodboard */}
            <section className="mt-6">
              <div className="flex items-end justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Visual Moodboard
                </h3>
                <span className="text-[11px] text-muted-foreground">4 references</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-[10px] uppercase tracking-wider">
                        Ref {i}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 opacity-0 backdrop-blur transition group-hover:opacity-100">
                      Drop image
                    </div>
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
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="w-14 border-b border-hairline px-4 py-2.5">#</th>
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
