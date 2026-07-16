"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera, SwitchCamera, Download, X, Trash2, ImagePlus,
  CalendarClock, AlertCircle, Aperture,
} from "lucide-react";
import { clsx } from "clsx";
import { FILM_PRESETS, DEFAULT_PRESET_ID, type FilmPreset } from "@/lib/filmPresets";
import { renderFilm } from "@/lib/filmRender";

interface Shot {
  id: string;
  url: string;
  preset: string;
}

// SVG feTurbulence noise, used as a live grain overlay on the viewfinder.
const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>`,
  );

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [dateStamp, setDateStamp] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [viewer, setViewer] = useState<Shot | null>(null);

  const preset = useMemo<FilmPreset>(
    () => FILM_PRESETS.find((p) => p.id === presetId) ?? FILM_PRESETS[0],
    [presetId],
  );
  const mirror = facing === "user";

  // ── camera lifecycle ──
  const startCamera = useCallback(async () => {
    setError(null);
    setReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("อุปกรณ์นี้ไม่รองรับกล้อง หรือหน้าเว็บไม่ได้เปิดผ่าน HTTPS");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setReady(true);
    } catch (e) {
      const name = (e as DOMException)?.name;
      setError(
        name === "NotAllowedError"
          ? "ไม่ได้รับอนุญาตให้ใช้กล้อง — โปรดอนุญาตในเบราว์เซอร์แล้วลองใหม่"
          : name === "NotFoundError"
            ? "ไม่พบกล้องบนอุปกรณ์นี้ — ลองอัปโหลดรูปแทนได้"
            : "เปิดกล้องไม่สำเร็จ ลองใหม่อีกครั้ง",
      );
    }
  }, [facing]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  // revoke object URLs on unmount
  useEffect(() => {
    return () => {
      shots.forEach((s) => URL.revokeObjectURL(s.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addShot = useCallback(
    (canvas: HTMLCanvasElement) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          setShots((prev) => [{ id: `${url}`, url, preset: preset.name }, ...prev].slice(0, 30));
        },
        "image/jpeg",
        0.92,
      );
    },
    [preset.name],
  );

  // ── capture from live video ──
  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = captureRef.current;
    if (!video || !canvas || !ready) return;
    const sw = video.videoWidth;
    const sh = video.videoHeight;
    if (!sw || !sh) return;
    renderFilm(canvas, video, sw, sh, { preset, dateStamp, mirror });
    addShot(canvas);
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
  }, [ready, preset, dateStamp, mirror, addShot]);

  // ── apply film look to an uploaded image (fallback when no camera) ──
  const onUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => {
        const canvas = captureRef.current;
        if (!canvas) return;
        renderFilm(canvas, img, img.naturalWidth, img.naturalHeight, {
          preset,
          dateStamp,
          mirror: false,
        });
        addShot(canvas);
      };
      img.src = URL.createObjectURL(file);
      e.target.value = "";
    },
    [preset, dateStamp, addShot],
  );

  const download = useCallback((shot: Shot) => {
    const a = document.createElement("a");
    a.href = shot.url;
    a.download = `film-${shot.preset.replace(/\s+/g, "")}-${shot.id.slice(-6)}.jpg`;
    a.click();
  }, []);

  const removeShot = useCallback((shot: Shot) => {
    URL.revokeObjectURL(shot.url);
    setShots((prev) => prev.filter((s) => s.id !== shot.id));
    setViewer((v) => (v?.id === shot.id ? null : v));
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
      {/* header */}
      <div className="flex items-center gap-3 mb-6 pl-12 lg:pl-0">
        <div className="w-10 h-10 rounded-xl bg-black border border-bear-gold/30 flex items-center justify-center">
          <Aperture className="w-5 h-5 text-bear-gold" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient-gold leading-tight">Film Camera</h1>
          <p className="text-xs text-bear-subtle">กล้องฟิล์มดิจิทัล — {preset.name}</p>
        </div>
      </div>

      {/* viewfinder */}
      <div className="glass-strong rounded-3xl p-3 sm:p-4">
        <div className="relative aspect-[3/4] sm:aspect-[3/2] w-full overflow-hidden rounded-2xl bg-black">
          {/* live video with base grade */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={clsx(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
              ready ? "opacity-100" : "opacity-0",
              mirror && "-scale-x-100",
            )}
            style={{ filter: preset.filter === "none" ? undefined : preset.filter }}
          />

          {/* live overlays */}
          {ready && (
            <>
              {preset.fade && (
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-lighten"
                  style={{ background: preset.fade.color, opacity: preset.fade.alpha }}
                />
              )}
              {preset.tint && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: preset.tint.color,
                    opacity: preset.tint.alpha,
                    mixBlendMode: preset.tint.mode as React.CSSProperties["mixBlendMode"],
                  }}
                />
              )}
              {preset.grain > 0 && (
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("${GRAIN_SVG}")`,
                    backgroundSize: "160px 160px",
                    opacity: Math.min(0.6, preset.grain * 2.2),
                  }}
                />
              )}
              {preset.leak && (
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                  style={{
                    background: `radial-gradient(120% 80% at 92% 8%, ${preset.leak}, ${preset.leak}55 40%, transparent 70%)`,
                    opacity: 0.5,
                  }}
                />
              )}
              {preset.vignette > 0 && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,${preset.vignette}) 100%)`,
                  }}
                />
              )}
              {dateStamp && (
                <div
                  className="pointer-events-none absolute bottom-3 right-4 font-mono font-bold tracking-wider"
                  style={{
                    color: "#ff8c1a",
                    textShadow: "0 0 8px rgba(255,140,0,0.9)",
                    fontSize: "clamp(13px, 2.4vw, 20px)",
                  }}
                >
                  {`'${String(new Date().getFullYear()).slice(2)} ${String(
                    new Date().getMonth() + 1,
                  ).padStart(2, "0")} ${String(new Date().getDate()).padStart(2, "0")}`}
                </div>
              )}
              {/* corner frame marks */}
              <div className="pointer-events-none absolute inset-3 rounded-xl border border-white/15" />
            </>
          )}

          {/* shutter flash */}
          <div
            className={clsx(
              "pointer-events-none absolute inset-0 bg-white transition-opacity",
              flash ? "opacity-80 duration-75" : "opacity-0 duration-150",
            )}
          />

          {/* loading / error states */}
          {!ready && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-bear-subtle">
              <Aperture className="w-8 h-8 animate-spin-slow text-bear-gold" />
              <p className="text-sm">กำลังเปิดกล้อง…</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertCircle className="w-8 h-8 text-bear-warning" />
              <p className="text-sm text-bear-text">{error}</p>
              <div className="flex gap-2">
                <button
                  onClick={startCamera}
                  className="rounded-xl bg-white/8 px-4 py-2 text-sm font-medium hover:bg-white/12 transition-colors"
                >
                  ลองอีกครั้ง
                </button>
                <label className="cursor-pointer rounded-xl bg-bear-gold/20 px-4 py-2 text-sm font-medium text-bear-gold hover:bg-bear-gold/30 transition-colors">
                  อัปโหลดรูป
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* controls */}
        <div className="mt-4 flex items-center justify-between gap-4">
          {/* left: date + upload toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDateStamp((v) => !v)}
              title="วันที่บนรูป"
              className={clsx(
                "flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                dateStamp
                  ? "border-bear-gold/40 bg-bear-gold/15 text-bear-gold"
                  : "border-white/10 bg-white/4 text-bear-subtle hover:text-white",
              )}
            >
              <CalendarClock size={19} />
            </button>
            <label
              title="อัปโหลดรูปมาแต่งฟิล์ม"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/4 text-bear-subtle transition-colors hover:text-white"
            >
              <ImagePlus size={19} />
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
          </div>

          {/* center: shutter */}
          <button
            onClick={capture}
            disabled={!ready}
            aria-label="ถ่ายรูป"
            className={clsx(
              "group relative flex h-[74px] w-[74px] items-center justify-center rounded-full border-4 transition-all active:scale-95",
              ready
                ? "border-white/70 hover:border-bear-gold"
                : "border-white/20 opacity-50",
            )}
          >
            <span
              className={clsx(
                "h-[58px] w-[58px] rounded-full transition-colors",
                ready ? "bg-white group-hover:bg-bear-gold-light" : "bg-white/30",
              )}
            />
            <Camera className="absolute h-6 w-6 text-black/70" />
          </button>

          {/* right: flip camera */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
              title="สลับกล้องหน้า/หลัง"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4 text-bear-subtle transition-colors hover:text-white"
            >
              <SwitchCamera size={19} />
            </button>
            {/* spacer to visually balance the left group */}
            <div className="h-11 w-11" aria-hidden />
          </div>
        </div>
      </div>

      {/* film-stock picker */}
      <div className="mt-5">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-bear-subtle">
          ฟิล์ม / Film Stock
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {FILM_PRESETS.map((p) => {
            const active = p.id === presetId;
            return (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                className={clsx(
                  "flex shrink-0 flex-col items-start gap-1 rounded-2xl border px-3.5 py-2.5 text-left transition-all",
                  active
                    ? "border-bear-gold/50 bg-bear-gold/10"
                    : "border-white/8 bg-white/3 hover:border-white/20",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full ring-1 ring-white/20"
                    style={{ background: p.swatch }}
                  />
                  <span className={clsx("text-sm font-semibold", active ? "text-white" : "text-bear-text")}>
                    {p.name}
                  </span>
                </span>
                <span className="text-[11px] text-bear-subtle">{p.vibe}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* roll / gallery */}
      {shots.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-bear-subtle">
              ม้วนฟิล์ม · {shots.length}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {shots.map((s) => (
              <button
                key={s.id}
                onClick={() => setViewer(s)}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/8 bg-black"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.url}
                  alt={s.preset}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-left text-[10px] font-medium text-white/90">
                  {s.preset}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* hidden capture canvas */}
      <canvas ref={captureRef} className="hidden" />

      {/* fullscreen viewer */}
      {viewer && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setViewer(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={viewer.url}
            alt={viewer.preset}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[75vh] max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl"
          />
          <div className="mt-4 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => download(viewer)}
              className="flex items-center gap-2 rounded-xl bg-bear-gold/20 px-5 py-2.5 text-sm font-semibold text-bear-gold transition-colors hover:bg-bear-gold/30"
            >
              <Download size={17} /> บันทึกรูป
            </button>
            <button
              onClick={() => removeShot(viewer)}
              className="flex items-center gap-2 rounded-xl bg-white/8 px-5 py-2.5 text-sm font-medium text-bear-text transition-colors hover:bg-bear-danger/20 hover:text-bear-danger"
            >
              <Trash2 size={17} /> ลบ
            </button>
          </div>
          <button
            onClick={() => setViewer(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-white transition-colors hover:bg-white/16"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
