import { promises as fs } from "fs";
import { error } from "@sveltejs/kit";
import { parseMarkdown } from "./markdown.server";
import { reportLint } from "$lib/linter.server";
import { getGames, fileExists } from "$lib/content.server.js";

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

const cache: { [id: string]: { [commandName: string]: ExpandedCommand } } = {};
const unknownCache: { [id: string]: { [game: string]: boolean } } = {};

async function parseJSON(p: string) {
    if (p && cache[p]) {
        return cache[p];
    }

    console.log("Indexing Commands for", p, "This might take a while...");

    const games = await getGames();

    cache[p] = {};
    unknownCache[p] = {};

    for (const game of Object.keys(games)) {
        if (!await fileExists(`../docs/${p}/commands_${game}.json`)) {
            reportLint(
                "caution",
                `commands_${game}`,
                `${game} is missing a command/cvar dump!`,
                `${p}`
            );
            unknownCache[p][game] = true;
            continue;
        }

        const raw: Command[] = JSON.parse(
            await fs.readFile(`../docs/${p}/commands_${game}.json`, { encoding: 'utf8' })
        );

        for (const c of raw) {
            if (c.name.startsWith("-") || c.name.startsWith("_")) {
                continue;
            }

            if (!cache[p][c.name]) {
                cache[p][c.name] = { games: [game], ...c };
            }

            if (!cache[p][c.name].games.includes(game)) {
                cache[p][c.name].games.push(game);
            }
        }
    }

    console.log("Done indexing Commands for", p, "!");

    return cache[p];
}

export async function parseCommand(p: string, name: string) {
    const all = await parseJSON(p);

    const out: string[] = [];

    const command = all[name];

    if (!command) {
        error(404, "Page not found");
    }

    out.push(`# ${command.name}`);

    if (command.flags.includes("cl")) {
        out.push(`🟦 Executable on Client`);
    } else if (command.flags.includes("sv")) {
        out.push(`🟩 Executable on Server`);
    } else {
        out.push(`🟪 Executable on Client and Server`);
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
                "> This is a cheat command and can only be used when [`sv_cheats`](./sv_cheats) is set to `1`."
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

    if (await fileExists(`../docs/${p}/${name}.md`)) {
        out.push(await fs.readFile(`../docs/${p}/${name}.md`, { encoding: 'utf8' }));
    }

    return parseMarkdown(out.join("\n\n"), `${p}/${name}`);
}

export async function getCommandTopic(p: string) {
    const res: MenuArticle[] = [];

    const all = await parseJSON(p);

    for (const c of Object.values(all)) {
        res.push({
            id: c.name,
            meta: {
                title: c.name,
                features: [
                    ...Object.keys(unknownCache[p]).map(
                        (v) => `UNKNOWN_${v.toUpperCase()}`
                    ),
                    ...c.games.map((v: string) => v.toUpperCase()),
                ],
            },
        });
    }

    return res;
}

export async function getCommandPageMeta(p: string, name: string): Promise<ArticleMeta> {
    const all = await parseJSON(p);

    const c = all[name];

    return {
        id: name,
        title: name,
        disablePageActions: true,
        features: [
            ...Object.keys(unknownCache[p]).map(
                (v) => `UNKNOWN_${v.toUpperCase()}`
            ),
            ...c.games.map((v) => v.toUpperCase()),
        ],
    };
}
