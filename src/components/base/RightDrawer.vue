<template>
    <el-drawer
        v-model="open"
        :before-close="
            () => {
                handleClose();
                handleClosed();
            }
        "
        :modal="false"
        :size="size"
        :destroy-on-close="isDestroyOnClose"
        :custom-class="customClass"
        @close="handleClose"
        @closed="handleClosed"
        @opened="handleOpened"
        @open="handleOpen"
    >
        <template #title>
            <div class="fw-bold">{{ title }}</div>
        </template>
        <slot name="body"></slot>
    </el-drawer>
</template>

<script lang="ts">
import { Model, Prop, Vue } from 'vue-property-decorator';

export default class RightDrawer extends Vue {
    @Model('value', { type: Boolean, default: false })
    readonly open!: boolean;
    @Prop({
        type: String,
        default: '',
    })
    readonly title!: string;
    @Prop({
        type: String,
        default: '50%',
    })
    readonly size!: string | number;
    @Prop({
        type: Boolean,
        default: true,
    })
    readonly isDestroyOnClose!: boolean;
    @Prop({
        type: String,
        default: '',
    })
    readonly customClass!: string;

    handleClose() {
        this.$emit('on-close');
    }

    handleClosed() {
        this.$emit('on-closed');
    }

    handleOpened() {
        this.$emit('on-opened');
    }

    handleOpen() {
        this.$emit('on-open');
    }

    beforeUnmount() {
        this.$emit('before-unmount');
    }
}
</script>
