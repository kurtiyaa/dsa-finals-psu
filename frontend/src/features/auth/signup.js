import html from "./signup.html?raw";
import "./auth.css";
import { mountForm } from "./form.js";

export function mount(el) {
    mountForm(el, html, { path: "/auth/register", pending: "Creating account" });
}
