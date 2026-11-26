import { getJson, postJson } from "./api.js";

let cached;

export async function readSession() {
    if (cached) return cached;
    const user = await getJson("/auth/me")
        .then((payload) => payload?.user ?? null)
        .catch(() => null);
    if (user) cached = user;
    return user;
}

export async function signOut() {
    cached = null;
    await postJson("/auth/logout").catch(() => null);
    location.replace("/");
}
