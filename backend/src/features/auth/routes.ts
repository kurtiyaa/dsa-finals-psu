import { randomBytes } from "node:crypto";
import type { Context } from "hono";
import { Hono } from "hono";
import { pool } from "../../shared/db.js";
import { hashPassword, verifyPassword } from "./password.js";
import { clearSessionCookie, createSession, deleteSession, findUserByToken, type SessionUser, sessionToken, setSessionCookie } from "./session.js";

export const auth = new Hono();

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const decoyPasswordHash = hashPassword(randomBytes(32).toString("base64url"));

const readJsonObject = async (c: Context) => {
    try {
        const body = await c.req.json();
        return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
    } catch {
        return null;
    }
};

const readEmail = (raw: unknown) => {
    if (typeof raw !== "string") return null;
    const email = raw.trim().toLowerCase();
    return email.length <= 254 && EMAIL_SHAPE.test(email) ? email : null;
};

const readPassword = (raw: unknown) => (typeof raw === "string" && raw.length >= 8 && raw.length <= 72 ? raw : null);

const bodyError = (c: Context) => c.json({ error: "Body must be a JSON object" }, 400);
const emailError = (c: Context) => c.json({ error: "Enter a valid email address", field: "email" }, 400);
const passwordError = (c: Context) => c.json({ error: "Password must be 8 to 72 characters", field: "password" }, 400);

auth.post("/auth/register", async (c) => {
    const body = await readJsonObject(c);
    if (!body) return bodyError(c);
    const email = readEmail(body.email);
    if (!email) return emailError(c);
    const password = readPassword(body.password);
    if (!password) return passwordError(c);

    const passwordHash = await hashPassword(password);
    const { rows } = await pool.query<SessionUser>("insert into users (email, password_hash) values ($1, $2) on conflict (email) do nothing returning id, email", [email, passwordHash]);
    const user = rows[0];
    if (!user) return c.json({ error: "That email is already registered", field: "email" }, 409);

    setSessionCookie(c, await createSession(user.id));
    return c.json({ user }, 201);
});

auth.post("/auth/login", async (c) => {
    const body = await readJsonObject(c);
    if (!body) return bodyError(c);
    const email = readEmail(body.email);
    if (!email) return emailError(c);
    const password = readPassword(body.password);
    if (!password) return passwordError(c);

    const { rows } = await pool.query<SessionUser & { password_hash: string }>("select id, email, password_hash from users where email = $1", [email]);
    const user = rows[0];
    const passwordMatches = await verifyPassword(password, user?.password_hash ?? (await decoyPasswordHash));
    if (!user || !passwordMatches) return c.json({ error: "Email or password is incorrect" }, 401);

    setSessionCookie(c, await createSession(user.id));
    return c.json({ user: { id: user.id, email: user.email } }, 200);
});

auth.post("/auth/logout", async (c) => {
    const token = sessionToken(c);
    if (token) await deleteSession(token);
    clearSessionCookie(c);
    return c.body(null, 204);
});

auth.get("/auth/me", async (c) => {
    const token = sessionToken(c);
    const user = token ? await findUserByToken(token) : null;
    if (!user) return c.json({ error: "Not signed in" }, 401);
    return c.json({ user }, 200);
});
