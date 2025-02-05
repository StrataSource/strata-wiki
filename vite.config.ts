import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import pagefind from "vite-plugin-pagefind";

export default defineConfig({
    plugins: [pagefind(), sveltekit()],
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler", // or 'modern'
            },
        },
    },
});
