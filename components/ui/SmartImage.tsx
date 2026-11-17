"use client";
import { useState, type ImgHTMLAttributes } from "react";

/** Inline SVG placeholder used when an image URL is empty or fails. */
function placeholder(label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#c7c9d9'/><stop offset='1' stop-color='#8e91a8'/></linearGradient></defs><rect width='800' height='600' fill='url(#g)'/><g fill='none' stroke='#ffffff' stroke-opacity='.75' stroke-width='14'><rect x='300' y='220' width='200' height='160' rx='18'/><circle cx='360' cy='275' r='18'/><path d='M310 370l60-60 40 40 30-30 50 50'/></g><text x='400' y='440' font-family='sans-serif' font-size='26' text-anchor='middle' fill='#ffffff' fill-opacity='.85'>${label
    .replace(/[<>&'"]/g, "")
    .slice(0, 40)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src?: string; alt: string };

export default function SmartImage({ src, alt, className, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  const real = src && src.trim() && !failed ? src : placeholder(alt || "Image");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      key={src}
      src={real}
      alt={alt}
      loading={rest.loading ?? "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
