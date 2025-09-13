import fs from "fs";
import { error } from "@sveltejs/kit";
import { parseMarkdown } from "./markdown.server";
import { reportLint } from "$lib/linter.server";
import { getGames } from "$lib/content.server";

interface Command {
    name: string;
    type: "command" | "cvar";
    help: string;
    /**
     * a = (Archived) Saved into config.cfg
     *
     * sp = (Singleplayer-only) Cannot be changed by clients on a multiplayer server
     *
     * sv = (Server) Added by the server
     *
     * cheat = (Cheat) Cheat command, requires sv_cheats 1
     *
     * user = (Userinfo) Internal use only
     *
     * notify = Notifies players when changed
     *
     * prot = (Protected) Server cvar, but doesn't send the data. Used for passwords and such
     *
     * print = (Printable-only) Value cannot contain unprintable chars
     *
     * log = (Unlogged) Don't log changes to log files
     *
     * numeric = Always a number
     *
     * rep = (Replicated) Value synced between client and server
     *
     * demo = Record this when starting a demo
     *
     * norecord = Don't record this into demo files
     *
     * server_can_execute = Server can execute this via entities or similar
     *
     * clientcmd_can_execute = Client can execute this via entities or similar
     *
     * cl = Registered by client dll
     *
     * ss = (Split-screen) Each splitscreen player has their own version of this variable
     *
     * ss_added = Internal use only
     */
    flags: (
        | "a"
        | "sp"
        | "sv"
        | "cheat"
        | "user"
        | "notify"
        | "prot"
        | "print"
        | "log"
        | "numeric"
        | "rep"
        | "demo"
        | "norecord"
        | "server_can_execute"
        | "clientcmd_can_execute"
        | "cl"
        | "ss"
        | "ss_added"
    )[];
}

interface ExpandedCommand extends Command {
    games: string[];
}

let cache: { [commandName: string]: ExpandedCommand } = {};
let unknownCache: { [game: string]: boolean } = {};

function parseJSON() {

    const games = getGames();

    cache = {};
    unknownCache = {};

    for (const game of Object.keys(games)) {
        const dumpPath = `../dumps/commands_${game}.json`;
        if (!fs.existsSync(dumpPath)) {
            reportLint(
                "caution",
                `commands_${game}`,
                `${game} is missing a command/cvar dump!`,
                ""
            );
            unknownCache[game] = true;
            continue;
        }

        const raw: Command[] = JSON.parse(
            fs.readFileSync(dumpPath, "utf-8")
        );

        for (const c of raw) {
            if (c.name.startsWith("-") || c.name.startsWith("_")) {
                continue;
            }

            if (!cache[c.name]) {
                cache[c.name] = { games: [game], ...c };
            }

            if (!cache[c.name].games.includes(game)) {
                cache[c.name].games.push(game);
            }
        }
    }

    return cache;
}

function parseCommand(p: string, name: string) {
    const out: string[] = [];

    const command = cache[name];

    if (!command) {
        error(404, "Page not found");
    }

    out.push(`# ${command.name}`);


    const server = command.flags.includes("sv");
    const client = command.flags.includes("cl");
    const replicated = command.flags.includes("rep");

    // I think there's something wrong with the dump, but we're missing server and client for replicated. We'll consider them shared
    if (replicated) {
        out.push(`🟩 Replicated from Server to Client`);
    } else if (server && client) {
        out.push(`🟪 Executable on Client and Server`);
    } else if (client) {
        out.push(`🟥 Executable on Client only`);
    } else if (server) {
        out.push(`🟦 Executable on Server only`);
    }

    let sample = `${command.name} ${command.type == "cvar" ? "<value>" : ""}`;
    if (command.name.startsWith("+")) {
        sample = `bind [key] ${command.name}`;
    }

    out.push("```\n" + sample + "\n```");

    if (command.name.startsWith("+")) {
        out.push(
            `Binds the \`${command.name.slice(
                1
            )}\` action to a key of your choice.`
        );

        if (command.help != "") {
            out.push(command.help);
        }
    } else {
        out.push(
            command.help == "" ? "*No description provided*" : command.help
        );
    }

    if (command.flags.includes("cheat")) {
        out.push(
            "> [!WARNING]\n" +
                "> This is a cheat command and can only be used when [`sv_cheats`](../variable/sv_cheats) is set to `1`."
        );
    }

    if (command.flags.includes("sp")) {
        out.push(
            "> [!WARNING]\n" + "> This command does not work in multiplayer."
        );
    }

    if (command.flags.includes("a")) {
        out.push(
            "> [!NOTE]\n" +
                "> The value is saved and will be restored on next startup."
        );
    }

    if (command.flags.includes("notify")) {
        out.push(
            "> [!NOTE]\n" +
                "> The execution of this command will notify all users in the server."
        );
    }

    if (command.flags.includes("print")) {
        out.push(
            "> [!NOTE]\n" +
                "> The value isn't allowed to contain non-printable characters."
        );
    }

    if (command.flags.includes("rep")) {
        out.push(
            "> [!NOTE]\n" +
                "> The value is synced between the server and all clients."
        );
    }

    if (command.flags.includes("prot")) {
        out.push(
            "> [!NOTE]\n" +
                "> This value is protected and will not be sent to the clients."
        );
    }

    if (command.flags.includes("norecord")) {
        out.push("> [!NOTE]\n" + "> This will not be recorded in demos.");
    }

    if (command.flags.includes("demo")) {
        out.push(
            "> [!NOTE]\n" + "> This value will recorded when a demo is started."
        );
    }

    if (command.flags.includes("log")) {
        out.push(
            "> [!NOTE]\n" +
                "> The execution of this command will not be logged."
        );
    }

    if (command.flags.includes("ss")) {
        out.push(
            "> [!NOTE]\n" +
                "> When running in split screen, each player has their own value."
        );
    }

    if (fs.existsSync(`../docs/${p}/${name}.md`)) {
        out.push(fs.readFileSync(`../docs/${p}/${name}.md`, "utf-8"));
    }

    return parseMarkdown(out.join("\n\n"), `${p}/${name}`);
}

function getCommandMeta(isVariables: boolean, c: ExpandedCommand): ArticleMeta {

    // I think there's something wrong with the dump, but we'll consider replicated shared
    const server = c.flags.includes("sv");
    const client = c.flags.includes("cl");
    const replicated = c.flags.includes("rep");

    return {
        title: c.name,
        type: isVariables ? "convar" : "concommand",
        disablePageActions: true,
        features: [
            ...Object.keys(unknownCache).map(
                (v) => `UNKNOWN_${v.toUpperCase()}`
            ),
            ...c.games.map((v) => v.toUpperCase()),
        ],
        scope: (replicated || server && client) ? "shared" : ( server ? "server" : (client ? "client" : undefined))
    };
}

function getCommandIndex(isVariables: boolean, p: string): PageGeneratorIndex {
    const index: PageGeneratorIndex = {topics: [], articles: []};

    for (const c of Object.values(cache)) {
        if(isVariables != (c.type == "cvar")) {
            continue;
        }

        index.articles.push({
            id: c.name,
            meta: getCommandMeta(isVariables, c)
        });
    }

    return index;
}

export const generatorConCommand: PageGenerator = {
    init: parseJSON,
    getPageContent: parseCommand,
    getIndex: (path: string) => { return getCommandIndex(false, path); },
};

export const generatorConVar: PageGenerator = {
    init: () => {},
    getPageContent: parseCommand,
    getIndex: (path: string) => { return getCommandIndex(true, path); },
};
