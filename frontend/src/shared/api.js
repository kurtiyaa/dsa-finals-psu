export async function getJson(path) {
    const response = await fetch(`/api${path}`, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`GET /api${path} returned ${response.status}`);
    return response.json();
}

export async function postJson(path, body) {
    const response = await fetch(`/api${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(payload.error ?? "Something went wrong");
        error.status = response.status;
        error.field = payload.field;
        throw error;
    }
    return payload;
}
