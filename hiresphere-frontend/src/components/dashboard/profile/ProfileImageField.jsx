"use client";

import { updateProfileImage } from "@/lib/actions/profile";
import { uploadImage } from "@/lib/api/imgbb";
import { authClient } from "@/lib/auth-client";
import { Pencil, TrashBin } from "@gravity-ui/icons";
import { toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

function getInitials(name) {
  const parts = (name ?? "").trim().split(/\s+/) ?? [];
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "U";
}

export default function ProfileImageField({ name, image }) {
  const inputRef = useRef(null);
  const router = useRouter();
  const [current, setCurrent] = useState(image || "");
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file);
      const url = result?.data?.url ?? result?.data?.display_url;
      if (url) {
        await updateProfileImage(url); // Updates backend
        await authClient.updateUser({ image: url }); // Immediately updates global session
        setCurrent(url);
        router.refresh();
        toast.success("Profile image updated");
      }
    } catch (err) {
      toast.warning(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(e) {
    e.stopPropagation();
    setUploading(true);
    try {
      await updateProfileImage("");
      await authClient.updateUser({ image: "" });
      setCurrent("");
      router.refresh();
      toast.success("Profile image removed");
    } catch (err) {
      toast.warning("Could not remove image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative group">
        <button
          id="profile-image"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload profile photo"
          className="group relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-full border border-default-200 bg-default-100 shadow-sm transition-colors hover:border-primary disabled:opacity-50"
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
                <Pencil className="size-5 text-white" />
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-default-500 group-hover:text-foreground">
              {getInitials(name)}
            </div>
          )}
        </button>

        {current && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="absolute -right-1 -top-1 rounded-full bg-danger p-1.5 text-white shadow-lg transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Remove photo"
          >
            <TrashBin className="size-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}
