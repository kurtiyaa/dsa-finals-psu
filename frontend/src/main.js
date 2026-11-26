import "./styles/base.css";
import "./styles/tokens.css";
import * as landing from "./features/landing/landing.js";
import * as notFound from "./features/not-found/not-found.js";
import { start } from "./shared/router.js";

start(document.querySelector("#root"), { "/": landing, "*": notFound });
