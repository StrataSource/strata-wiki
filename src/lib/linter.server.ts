import { building } from "$app/environment";
import fs from "fs";

export interface LintIssue {
    level: "note" | "warning" | "caution";
    message: string;
    links: string[];
}

const lintStore: { issues: { [id: string]: LintIssue }; timestamp: number } = {
    issues: {},
    timestamp: Date.now(),
};

let flushTimeout: NodeJS.Timeout;

export function flushLint() {
    clearTimeout(flushTimeout);

    flushTimeout = setTimeout(() => {
        if (building) {
            fs.writeFileSync("static/report.json", JSON.stringify(lintStore));
            console.log("Flushed lint");
        }
    }, 200);
}

export function reportLint(
    level: "note" | "warning" | "caution",
    id: string,
    message: string,
    link: string
) {
    switch (level) {
        case "caution":
            console.error("❗", message);
            break;
        case "warning":
            console.warn("🔶", message);
            break;
        case "note":
            console.info("🔹", message);
            break;

        default:
            break;
    }

    if (lintStore.issues[id]) {
        lintStore.issues[id].links.push(link);
    } else {
        lintStore.issues[id] = {
            level: level,
            message: message,
            links: [link],
        };
    }
}
