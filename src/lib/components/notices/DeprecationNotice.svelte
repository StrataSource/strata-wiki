<script>
    import { mdiDelete } from "@mdi/js";
    import Notice from "../Notice.svelte";
</script>

<Notice type="caution" icon={mdiDelete} title="Deprecated feature">
    This feature should no longer be used and either has been removed or will be
    removed in a future release.
</Notice>
