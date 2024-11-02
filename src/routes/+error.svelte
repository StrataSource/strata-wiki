<script>
    import { page } from "$app/stores";
    import Btn from "$lib/components/Btn.svelte";
    import Container from "$lib/components/Container.svelte";
</script>

<div class="wrapper">
    <div>
        <div class="status">
            {$page.status}
        </div>

        <div class="message">
            {$page.error?.message || "Something went wrong"}
        </div>

        <Btn href="/">Return home</Btn>
    </div>
</div>

<style>
    .wrapper {
        background-color: #111;

        position: fixed;
        top: 0;
        left: 0;
        z-index: 999;

        height: 100vh;
        width: 100vw;

        display: flex;
        align-items: center;
        justify-content: center;

        text-align: center;
    }

    .status {
        font-size: min(50vh, 50vw);
        line-height: 1;

        opacity: 0.25;

        user-select: none;
    }

    .message {
        font-size: 2rem;

        transform: translateY(calc(min(50vh, 50vw) / -2 - 50%));
        text-shadow: black 0 0 0.5em;
    }
</style>
