// Checked on the phone so login works offline. Only the SHA-256 hash is stored.
const HASH = "47be17e09472c3cfa6e51072d57e5c352cf9fec03faacb7c15a6adf977235cca";

export async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export async function checkPassword(pw: string) {
  return (await sha256(pw)) === HASH;
}
