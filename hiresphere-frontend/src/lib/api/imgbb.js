const API_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY;
const ENDPOINT = "https://api.imgbb.com/1/upload";
const MAX_BYTES = 5 * 1024 * 1024;

function validate(file) {
  if (!file) throw new Error("No file provided");
  if (!file.type.startsWith("image/")) {
    throw new Error("Please pick an image file");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 5 MB");
  }
}

export async function uploadImage(file) {
  if (!API_KEY) throw new Error("imgbb API key is not configured");
  validate(file);

  const form = new FormData();
  form.append("key", API_KEY);
  form.append("image", file);

  const res = await fetch(ENDPOINT, { method: "POST", body: form });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "imgbb upload failed");
  }

  const data = await res.json();
  if (!data?.success || !data?.data?.url) {
    throw new Error("imgbb response did not include an image URL");
  }

  return data;
}

export async function uploadImages(files) {
  if (!API_KEY) throw new Error("imgbb API key is not configured");
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("No files provided");
  }

  const urls = [];
  for (const file of files) {
    validate(file);
    const form = new FormData();
    form.append("key", API_KEY);
    form.append("image", file);

    const res = await fetch(ENDPOINT, { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? "imgbb upload failed");
    }
    const data = await res.json();
    if (!data?.success || !data?.data?.url) {
      throw new Error("imgbb response did not include an image URL");
    }
    urls.push(data.data.url ?? data.data.display_url);
  }

  return urls;
}
