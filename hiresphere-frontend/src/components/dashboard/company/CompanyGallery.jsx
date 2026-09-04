"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@heroui/react";
import {
  ArrowRightArrowLeft,
  CircleChevronLeft,
  CircleChevronRight,
  Xmark,
} from "@gravity-ui/icons";

export default function CompanyGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const hasImages = safeImages.length > 0;

  const goPrev = useCallback(() => {
    setActiveIndex((current) =>
      current === 0 ? safeImages.length - 1 : current - 1,
    );
  }, [safeImages.length]);

  const goNext = useCallback(() => {
    setActiveIndex((current) =>
      current === safeImages.length - 1 ? 0 : current + 1,
    );
  }, [safeImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    function onKey(e) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, goPrev, goNext]);

  if (!hasImages) return null;

  return (
    <>
      <Card className="overflow-hidden rounded-2xl border border-default bg-content1">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Gallery</h2>
            <p className="text-xs text-muted-foreground">
              {safeImages.length} {safeImages.length === 1 ? "image" : "images"}
            </p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <ArrowRightArrowLeft className="size-3" />
            <span>Use arrows to navigate</span>
          </div>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0c0d10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={safeImages[activeIndex]}
            alt={`Gallery ${activeIndex + 1}`}
            className="size-full object-cover transition-opacity duration-300"
            key={activeIndex}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 sm:px-4">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/60"
            >
              <CircleChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/60"
            >
              <CircleChevronRight className="size-6" />
            </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {activeIndex + 1} / {safeImages.length}
          </div>

          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/80 group-hover:opacity-100"
          >
            Expand
          </button>
        </div>

        {safeImages.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto p-3 sm:p-4">
            {safeImages.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:size-20 ${
                  index === activeIndex
                    ? "border-indigo-500 ring-2 ring-indigo-500/30"
                    : "border-white/10 opacity-60 hover:opacity-100"
                }`}
                aria-label={`Show image ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </Card>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-foreground transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <Xmark className="size-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-white/10 text-foreground transition-all hover:scale-110 hover:bg-white/20"
            aria-label="Previous image"
          >
            <CircleChevronLeft className="size-7" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-white/10 text-foreground transition-all hover:scale-110 hover:bg-white/20"
            aria-label="Next image"
          >
            <CircleChevronRight className="size-7" />
          </button>

          <div
            className="relative max-h-[90vh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={safeImages[activeIndex]}
              alt={`Gallery ${activeIndex + 1}`}
              classNames={{ wrapper: "w-auto max-h-[90vh]", img: "max-h-[90vh] w-auto rounded-2xl object-contain shadow-2xl" }}
              radius="lg"
              key={activeIndex}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {activeIndex + 1} / {safeImages.length}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
