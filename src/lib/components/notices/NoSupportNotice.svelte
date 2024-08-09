<script>
    import { mdiBlockHelper } from "@mdi/js";
    import Notice from "../Notice.svelte";
    import { currentGame, gameMeta } from "$lib/stores";
</script>

<Notice type="caution" icon={mdiBlockHelper} title="Feature unsupported">
    {$gameMeta[$currentGame].name} doesn't support this feature.
</Notice>
