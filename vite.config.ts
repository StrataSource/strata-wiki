import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { pagefind } from "vite-plugin-pagefind";

export default defineConfig({
    plugins: [
        //@ts-expect-error They haven't updated their types yet
        pagefind({
            outputDirectory: "build",
            assetsDirectory: "static",
            developStrategy: "lazy",
        }),
        sveltekit(),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler", // or 'modern'
            },
        },
    },
});
