"use client";
import { FONT_PAIRS, RADII, STYLES, type Theme } from "@/lib/schema";
import { FONT_STACKS, contrastRatio } from "@/lib/theme";

const PRESETS: { name: string; palette: Theme["palette"] }[] = [
  { name: "Indigo", palette: { primary: "#4F46E5", accent: "#EC4899", background: "#FFFFFF", surface: "#F6F6FB", text: "#0F1020", muted: "#5B5D72", border: "#E4E4EE" } },
  { name: "Forest", palette: { primary: "#166534", accent: "#CA8A04", background: "#FBFAF5", surface: "#F0EEE4", text: "#14211A", muted: "#56645B", border: "#E2DFD2" } },
  { name: "Ember", palette: { primary: "#DC4A1F", accent: "#F2B33D", background: "#FFF9F4", surface: "#FBEDE2", text: "#2A160D", muted: "#7A5B4B", border: "#F0DCCB" } },
  { name: "Midnight", palette: { primary: "#8B7CFF", accent: "#2DD4BF", background: "#0C0D14", surface: "#151724", text: "#EEF0FA", muted: "#9AA0B8", border: "#262A3D" } },
  { name: "Ocean", palette: { primary: "#0369A1", accent: "#06B6D4", background: "#F8FBFD", surface: "#EAF3F8", text: "#0B1F2E", muted: "#4D6475", border: "#D6E5EE" } },
];

const label = "mb-1.5 block text-[12px] font-medium text-neutral-600";

export default function ThemePanel({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  const set = <K extends keyof Theme>(k: K, v: Theme[K]) => onChange({ ...theme, [k]: v });
  const setColor = (k: keyof Theme["palette"], v: string) => onChange({ ...theme, palette: { ...theme.palette, [k]: v } });
  const ratio = contrastRatio(theme.palette.text, theme.palette.background);
  return (
    <div className="space-y-6">
      <div>
        <span className={label}>Palette presets</span>
        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((p) => (
            <button key={p.name} title={p.name} onClick={() => set("palette", p.palette)} className="group overflow-hidden rounded-lg border border-neutral-200 hover:border-blue-500">
              <div className="flex h-8">
                <span className="flex-1" style={{ background: p.palette.background }} />
                <span className="flex-1" style={{ background: p.palette.primary }} />
                <span className="flex-1" style={{ background: p.palette.accent }} />
              </div>
              <span className="block py-1 text-[10px] text-neutral-500">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className={label}>Colours</span>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(theme.palette) as (keyof Theme["palette"])[]).map((k) => (
            <label key={k} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5">
              <input type="color" value={theme.palette[k]} onChange={(e) => setColor(k, e.target.value.toUpperCase())} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0" />
              <span className="min-w-0">
                <span className="block text-[11px] font-medium capitalize text-neutral-700">{k}</span>
                <span className="block font-mono text-[10px] text-neutral-400">{theme.palette[k]}</span>
              </span>
            </label>
          ))}
        </div>
        <p className={`mt-2 text-[11px] ${ratio < 4.5 ? "text-red-600" : "text-neutral-400"}`}>
          Text contrast {ratio.toFixed(1)}:1 {ratio < 4.5 ? "— too low for comfortable reading (aim for 4.5+)" : "✓"}
        </p>
      </div>
      <div>
        <span className={label}>Fonts</span>
        <select className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px]" value={theme.fontPair} onChange={(e) => set("fontPair", e.target.value as Theme["fontPair"])}>
          {FONT_PAIRS.map((f) => (
            <option key={f} value={f}>{FONT_STACKS[f].label}</option>
          ))}
        </select>
      </div>
      <div>
        <span className={label}>Corner radius</span>
        <div className="grid grid-cols-5 gap-1 rounded-lg bg-neutral-100 p-1">
          {RADII.map((r) => (
            <button key={r} onClick={() => set("radius", r)} className={`rounded-md py-1.5 text-[11px] font-medium capitalize ${theme.radius === r ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>{r}</button>
          ))}
        </div>
      </div>
      <div>
        <span className={label}>Card style</span>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1">
          {STYLES.map((s) => (
            <button key={s} onClick={() => set("style", s)} className={`rounded-md py-1.5 text-[12px] font-medium capitalize ${theme.style === s ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
