"use client";

import { uploadImage, uploadImages } from "@/lib/api/imgbb";
import { CirclePlus, Picture, TrashBin } from "@gravity-ui/icons";
import { useRef, useState } from "react";

const MAX_GALLERY_SLOTS = 6;

export default function ImageUploader({ value, onChange, multiple = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    setError("");
    setUploading(true);
    try {
      if (multiple) {
        const remaining = MAX_GALLERY_SLOTS - (value?.length ?? 0);
        if (remaining <= 0) {
          throw new Error(`Gallery is full (max ${MAX_GALLERY_SLOTS} images)`);
        }
        const files = Array.from(fileList).slice(0, remaining);
        const urls = await uploadImages(files);
        const next = Array.isArray(value) ? [...value, ...urls] : urls;
        onChange?.(next);
      } else {
        const result = await uploadImage(fileList[0]);
        const url = result?.data?.url ?? result?.data?.display_url;
        onChange?.(url);
      }
    } catch (err) {
      setError(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleChange(e) {
    handleFiles(e.target.files);
  }

  function handleRemove(index) {
    if (!multiple) {
      onChange?.("");
      return;
    }
    const list = Array.isArray(value) ? [...value] : [];
    list.splice(index, 1);
    onChange?.(list);
  }

  function pickFiles() {
    inputRef.current?.click();
  }

  if (multiple) {
    const items = Array.isArray(value) ? value : [];
    const slotsLeft = MAX_GALLERY_SLOTS - items.length;

    return (
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {items.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#1b1c1e]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <TrashBin className="size-3" />
              </button>
            </div>
          ))}

          {slotsLeft > 0 ? (
            <button
              type="button"
              onClick={pickFiles}
              disabled={uploading}
              className="group flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-default-200 bg-default-100 text-muted-foreground transition-colors hover:border-indigo-500/50 hover:text-foreground disabled:opacity-50"
            >
              <CirclePlus className="size-6 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-medium uppercase tracking-wide">
                {uploading ? "Uploading…" : "Add image"}
              </span>
            </button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          {items.length}/{MAX_GALLERY_SLOTS} images · PNG, JPG up to 5MB each
        </p>

        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={uploading}
        className="hidden"
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={pickFiles}
          disabled={uploading}
          className="group relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/15 bg-[#1b1c1e] text-muted-foreground transition-colors hover:border-indigo-500/50 disabled:opacity-50"
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Logo" className="size-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-[10px] font-medium uppercase tracking-wide text-foreground">
                  Replace
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-foreground">
              <Picture className="size-6" />
              <span className="text-[10px] font-medium uppercase tracking-wide">
                {uploading ? "Uploading…" : "Upload"}
              </span>
            </div>
          )}
        </button>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Company logo</p>
          <p>PNG, JPG, WebP up to 5MB</p>
          {value ? (
            <button
              type="button"
              onClick={() => onChange?.("")}
              className="mt-1 inline-flex w-fit items-center gap-1 text-red-400 transition-colors hover:text-red-300"
            >
              <TrashBin className="size-3" />
              Remove
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
