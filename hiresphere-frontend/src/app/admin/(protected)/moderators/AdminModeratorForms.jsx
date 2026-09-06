"use client";

import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteAdminModerator } from "@/lib/actions/admin";
import { toast } from "@heroui/react";
import { Plus } from "@gravity-ui/icons";

export default function AdminModeratorForms() {
  const router = useRouter();
  const [addEmail, setAddEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addEmail.trim()) {
      toast.danger("Email required");
      return;
    }
    setLoading(true);
    try {
      await inviteAdminModerator(addEmail.trim());
      toast.success("Moderator added");
      setAddEmail("");
      router.refresh();
    } catch (err) {
      toast.danger("Failed to add moderator", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-3">
      <Input
        label="Add Moderator"
        size="sm"
        placeholder="user@example.com"
        value={addEmail}
        onChange={(e) => setAddEmail(e.target.value)}
        className="w-full"
      />
      <Button
        type="submit"
        color="primary"
        disabled={loading}
      >
        {!loading && <Plus className="size-4" />}
        Add
      </Button>
    </form>
  );
}
