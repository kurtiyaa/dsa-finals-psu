import html from "./signin.html?raw";
import "./auth.css";
import { mountForm } from "./form.js";

export function mount(el) {
    mountForm(el, html, { path: "/auth/login", pending: "Signing in" });
}
