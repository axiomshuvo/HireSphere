"use client";

import { useRef, useState } from "react";
import { Button, toast } from "@heroui/react";
import { Pencil, TrashBin } from "@gravity-ui/icons";
import { uploadImage } from "@/lib/api/imgbb";
import { updateProfileImage } from "@/lib/actions/profile";

function getInitials(name) {
  const parts = (name ?? "").trim().split(/\s+/) ?? [];
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "U";
}

export default function ProfileImageField({ name, image }) {
  const inputRef = useRef(null);
  const [current, setCurrent] = useState(image || "");
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file);
      const url = result?.data?.url ?? result?.data?.display_url;
      if (url) {
        await updateProfileImage(url);
        setCurrent(url);
        toast.success("Profile image updated");
      }
    } catch (err) {
      toast.warning(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    try {
      await updateProfileImage("");
      setCurrent("");
      toast.success("Profile image removed");
    } catch (err) {
      toast.warning("Could not remove image");
    }
  }

  return (
    <div>
      <label
        htmlFor="profile-image"
        className="mb-1 block text-xs font-medium text-muted-foreground"
      >
        Profile photo
      </label>
      <div className="flex items-center gap-4">
        <button
          id="profile-image"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload profile photo"
          className="group relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-white/15 bg-[#1b1c1e] transition-colors hover:border-indigo-500/50 disabled:opacity-50"
        >
          {current ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current}
                alt={name}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Pencil className="size-4 text-white" />
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base font-semibold text-muted-foreground group-hover:text-white">
              {getInitials(name)}
            </div>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={uploading}
          className="hidden"
        />
        <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WebP up to 5MB. Click the avatar to change.
          </p>
          {current && (
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              onPress={handleRemove}
              isDisabled={uploading}
              className="cursor-pointer"
            >
              <TrashBin className="size-3" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
