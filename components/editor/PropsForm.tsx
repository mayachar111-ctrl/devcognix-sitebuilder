"use client";
import { useState } from "react";
import { z } from "zod";
import SmartImage from "@/components/ui/SmartImage";
import Icon, { type AnyIcon } from "@/components/ui/Icon";

/**
 * Schema-driven props form: walks the zod schema of a section and renders
 * the right control for each field. No per-component form code needed —
 * new section types get an editor for free.
 */

type Json = unknown;

const LONG_KEYS = new Set(["subheadline", "subtitle", "description", "answer", "quote", "bio", "excerpt", "tagline", "caption", "successMessage"]);

const humanize = (k: string) =>
  k
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\bCta\b/, "button");

function unwrap(s: z.ZodTypeAny): z.ZodTypeAny {
  let cur = s;
  while (cur instanceof z.ZodOptional || cur instanceof z.ZodNullable || cur instanceof z.ZodDefault || cur instanceof z.ZodEffects) {
    cur = cur instanceof z.ZodEffects ? cur._def.schema : cur._def.innerType;
  }
  return cur;
}

function emptyFor(s: z.ZodTypeAny): Json {
  const t = unwrap(s);
  if (t instanceof z.ZodString) return "";
  if (t instanceof z.ZodNumber) return 0;
  if (t instanceof z.ZodBoolean) return false;
  if (t instanceof z.ZodEnum) return t._def.values[0];
  if (t instanceof z.ZodUnion) return emptyFor(t._def.options[0]);
  if (t instanceof z.ZodLiteral) return t._def.value;
  if (t instanceof z.ZodArray) return [];
  if (t instanceof z.ZodObject) {
    const out: Record<string, Json> = {};
    for (const [k, v] of Object.entries(t.shape as Record<string, z.ZodTypeAny>)) out[k] = emptyFor(v);
    return out;
  }
  return null;
}

const isImageShape = (t: z.ZodTypeAny) => t instanceof z.ZodObject && Object.keys(t.shape).join(",") === "src,alt";
const isLinkShape = (t: z.ZodTypeAny) => t instanceof z.ZodObject && Object.keys(t.shape).join(",") === "label,href";

const inputCls = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2 text-[12px] font-medium text-neutral-600">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] leading-snug text-neutral-400">{hint}</span> : null}
    </label>
  );
}

function Node({ k, schema, value, onChange, depth }: { k: string; schema: z.ZodTypeAny; value: Json; onChange: (v: Json) => void; depth: number }) {
  const t = unwrap(schema);
  const hint = schema.description ?? t.description;
  const label = humanize(k);

  if (t instanceof z.ZodString) {
    const v = typeof value === "string" ? value : "";
    const long = LONG_KEYS.has(k) || v.length > 70;
    if (/^(src|avatar|photo)$/.test(k)) {
      return (
        <Field label={label}>
          <div className="flex gap-2">
            <SmartImage src={v} alt="" className="h-9 w-9 shrink-0 rounded-md border border-neutral-200 object-cover" />
            <input className={inputCls} value={v} placeholder="https://…" onChange={(e) => onChange(e.target.value)} />
          </div>
        </Field>
      );
    }
    return (
      <Field label={label} hint={depth === 0 && hint && hint.length < 90 ? hint : undefined}>
        {long ? (
          <textarea rows={3} className={`${inputCls} resize-y`} value={v} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input className={inputCls} value={v} onChange={(e) => onChange(e.target.value)} />
        )}
      </Field>
    );
  }
  if (t instanceof z.ZodNumber) {
    return (
      <Field label={label}>
        <input type="number" step="any" className={inputCls} value={typeof value === "number" ? value : 0} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
      </Field>
    );
  }
  if (t instanceof z.ZodBoolean) {
    const on = Boolean(value);
    return (
      <button type="button" onClick={() => onChange(!on)} className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left">
        <span className="text-[12px] font-medium text-neutral-600">{label}</span>
        <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-blue-600" : "bg-neutral-300"}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
        </span>
      </button>
    );
  }
  if (t instanceof z.ZodEnum || (t instanceof z.ZodUnion && (t._def.options as z.ZodTypeAny[]).every((o) => o instanceof z.ZodLiteral))) {
    const opts: (string | number)[] = t instanceof z.ZodEnum ? t._def.values : (t._def.options as z.ZodLiteral<string | number>[]).map((o) => o._def.value);
    const isIcon = k === "icon";
    return (
      <Field label={label}>
        <div className="flex items-center gap-2">
          {isIcon ? (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neutral-200 text-neutral-700">
              <Icon name={String(value) as AnyIcon} className="h-4 w-4" />
            </span>
          ) : null}
          <select
            className={inputCls}
            value={String(value)}
            onChange={(e) => {
              const raw = e.target.value;
              onChange(typeof opts[0] === "number" ? Number(raw) : raw);
            }}
          >
            {opts.map((o) => (
              <option key={String(o)} value={String(o)}>
                {String(o)}
              </option>
            ))}
          </select>
        </div>
      </Field>
    );
  }
  if (t instanceof z.ZodObject) {
    const shape = t.shape as Record<string, z.ZodTypeAny>;
    const obj = (value && typeof value === "object" ? value : {}) as Record<string, Json>;
    const set = (key: string, v: Json) => onChange({ ...obj, [key]: v });
    if (isLinkShape(t)) {
      return (
        <Field label={label}>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Label" value={String(obj.label ?? "")} onChange={(e) => set("label", e.target.value)} />
            <input className={inputCls} placeholder="#anchor or URL" value={String(obj.href ?? "")} onChange={(e) => set("href", e.target.value)} />
          </div>
        </Field>
      );
    }
    if (isImageShape(t)) {
      return (
        <Field label={label}>
          <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-2">
            <SmartImage src={String(obj.src ?? "")} alt={String(obj.alt ?? "")} className="aspect-[16/9] w-full rounded-md object-cover" />
            <input className={inputCls} placeholder="Image URL" value={String(obj.src ?? "")} onChange={(e) => set("src", e.target.value)} />
            <input className={inputCls} placeholder="Alt text" value={String(obj.alt ?? "")} onChange={(e) => set("alt", e.target.value)} />
          </div>
        </Field>
      );
    }
    const body = (
      <div className="space-y-3">
        {Object.entries(shape).map(([key, sub]) => (
          <Node key={key} k={key} schema={sub} value={obj[key]} onChange={(v) => set(key, v)} depth={depth + 1} />
        ))}
      </div>
    );
    if (depth === 0) return body;
    return (
      <fieldset className="rounded-lg border border-neutral-200 p-3">
        <legend className="px-1 text-[12px] font-semibold text-neutral-700">{label}</legend>
        {body}
      </fieldset>
    );
  }
  if (t instanceof z.ZodArray) {
    return <ArrayNode k={k} item={t._def.type} value={Array.isArray(value) ? value : []} onChange={onChange} depth={depth} max={t._def.maxLength?.value} />;
  }
  return null;
}

function summary(v: Json, i: number): string {
  if (typeof v === "string") return v || `Item ${i + 1}`;
  if (v && typeof v === "object") {
    const o = v as Record<string, Json>;
    const s = o.title ?? o.name ?? o.question ?? o.label ?? o.alt ?? o.platform ?? o.quote;
    if (typeof s === "string" && s) return s;
  }
  return `Item ${i + 1}`;
}

function ArrayNode({ k, item, value, onChange, depth, max }: { k: string; item: z.ZodTypeAny; value: Json[]; onChange: (v: Json) => void; depth: number; max?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const inner = unwrap(item);
  const simple = inner instanceof z.ZodString || inner instanceof z.ZodNumber;
  const add = () => {
    const next = value.length ? JSON.parse(JSON.stringify(value[value.length - 1])) : emptyFor(item);
    onChange([...value, next]);
    setOpen(value.length);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const arr = [...value];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };
  const canAdd = max === undefined || value.length < max;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-neutral-600">
          {humanize(k)} <span className="text-neutral-400">({value.length})</span>
        </span>
        {canAdd && (
          <button type="button" onClick={add} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
            <Icon name="plus" className="h-3 w-3" strokeWidth={2.5} /> Add
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {value.map((v, i) =>
          simple ? (
            <div key={i} className="flex gap-1.5">
              <input className={inputCls} value={String(v ?? "")} onChange={(e) => onChange(value.map((x, j) => (j === i ? (inner instanceof z.ZodNumber ? Number(e.target.value) : e.target.value) : x)))} />
              <button type="button" onClick={() => remove(i)} className="rounded-md px-2 text-neutral-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove">
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div key={i} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className={`text-neutral-400 transition-transform ${open === i ? "rotate-90" : ""}`}>›</span>
                  <span className="truncate text-[12px] font-medium text-neutral-800">{summary(v, i)}</span>
                </button>
                <button type="button" onClick={() => move(i, -1)} className="rounded px-1.5 text-[11px] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800" aria-label="Move up">↑</button>
                <button type="button" onClick={() => move(i, 1)} className="rounded px-1.5 text-[11px] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800" aria-label="Move down">↓</button>
                <button type="button" onClick={() => remove(i)} className="rounded px-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove">
                  <Icon name="close" className="h-3 w-3" />
                </button>
              </div>
              {open === i && (
                <div className="border-t border-neutral-100 bg-neutral-50/60 p-3">
                  <Node k={`${k}-item`} schema={item} value={v} depth={0} onChange={(nv) => onChange(value.map((x, j) => (j === i ? nv : x)))} />
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export default function PropsForm({ schema, value, onChange }: { schema: z.ZodObject<z.ZodRawShape>; value: Record<string, Json>; onChange: (v: Record<string, Json>) => void }) {
  return <Node k="root" schema={schema} value={value} depth={0} onChange={(v) => onChange(v as Record<string, Json>)} />;
}
