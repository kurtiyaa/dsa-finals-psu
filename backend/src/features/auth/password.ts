import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number }) => Promise<Buffer>;

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;

export const hashPassword = async (password: string) => {
    const salt = randomBytes(SALT_BYTES);
    const hash = await scryptAsync(password, salt, KEYLEN, { N, r: R, p: P });
    return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${hash.toString("base64")}`;
};

export const verifyPassword = async (password: string, stored: string) => {
    const [scheme, n, r, p, salt, hash] = stored.split("$");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const expected = Buffer.from(hash, "base64");
    const params = { N: Number(n), r: Number(r), p: Number(p) };
    if (expected.length < 16 || !Object.values(params).every((value) => Number.isInteger(value) && value > 0)) return false;
    const derived = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length, params);
    return timingSafeEqual(derived, expected);
};

// AI HERE: startup round-trip self-check, move it to a runner once the backend has one.
if (!(await verifyPassword("self-check", await hashPassword("self-check")))) throw new Error("password hashing self-check failed");
