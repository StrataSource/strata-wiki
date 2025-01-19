<script>
    import { mdiHelpCircleOutline } from "@mdi/js";
    import Notice from "../Notice.svelte";
    import { currentGame, gameMeta } from "$lib/stores";

    export let name = $gameMeta[$currentGame].name;
</script>

<Notice
    type="warning"
    icon={mdiHelpCircleOutline}
    title="Feature support unknown"
>
    Due to technical limitations, feature support information for {name} is unavailable
    for this section.
</Notice>
