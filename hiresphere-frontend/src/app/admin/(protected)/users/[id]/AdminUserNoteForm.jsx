"use client";

import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addAdminUserNote } from "@/lib/actions/admin";

export default function AdminUserNoteForm({ id }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="flex flex-wrap items-end gap-2 rounded-xl border p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
          await addAdminUserNote(id, { text: text.trim() });
          toast.success("Note added");
          setText("");
          router.refresh();
        } catch (err) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="min-w-64 flex-1 space-y-1">
        <label className="text-sm font-medium" htmlFor="note">
          Internal note (mods + admins)
        </label>
        <input
          id="note"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        Add note
      </Button>
    </form>
  );
}
