import html from "./landing.html?raw";
import "./style.css";

const TITLE = "DATA SPACE | Smart Record Management";
const DESCRIPTION = "DATA SPACE, a business record management system that organizes, sorts and retrieves information.";

export function mount(el) {
    el.innerHTML = html;
    document.title = TITLE;

    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(document.createElement("meta"));
    meta.setAttribute("name", "description");
    meta.setAttribute("content", DESCRIPTION);

    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
}
