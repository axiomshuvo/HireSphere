"use client";

import { updateProfileName } from "@/lib/actions/profile";
import { Check, Pencil } from "@gravity-ui/icons";
import { Button, Input, toast } from "@heroui/react";
import { useState, useTransition } from "react";

export default function ProfileForm({ initialName, email, role }) {
  const [name, setName] = useState(String(initialName ?? ""));
  const [savedName, setSavedName] = useState(String(initialName ?? ""));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = String(name).trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    if (trimmed === savedName) {
      toast.info("No changes to save");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await updateProfileName(trimmed);
        setSavedName(trimmed);
        toast.success("Profile updated");
      } catch (err) {
        const message = err?.message ?? "Could not save profile";
        setError(message);
        toast.warning("Could not save profile", { description: message });
      }
    });
  };

  const dirty = String(name).trim() !== savedName;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="profile-name"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Display name
          </label>
          <Input
            id="profile-name"
            name="name"
            value={String(name)}
            onChange={(e) => {
              setName(String(e.target.value));
              setError("");
            }}
            placeholder="Your name"
            autoComplete="name"
            className="w-full"
          />
          {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Email
          </label>
          <Input
            id="profile-email"
            value={String(email)}
            readOnly
            className="w-full"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Email is tied to your login and cannot be changed from here.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="profile-role"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Role
        </label>
        <Input
          id="profile-role"
          value={String(role)}
          readOnly
          className="w-full capitalize"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Role is set at signup and cannot be changed from here.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isDisabled={isPending || !dirty}
          className="cursor-pointer"
        >
          {isPending ? (
            "Saving…"
          ) : dirty ? (
            <>
              <Pencil className="size-4" />
              Save changes
            </>
          ) : (
            <>
              <Check className="size-4" />
              Up to date
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
