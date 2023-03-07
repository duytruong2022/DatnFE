<template>
    <div class="d-flex" :class="{ 'flex-column': !isHorizontal }">
        <label
            v-if="label"
            class="fw-bold text-start mb-2"
            :class="{ 'w-100': !isHorizontal, 'label mt-1': isHorizontal }"
        >
            {{ label }}
            <span v-if="isRequired" class="mark-required">*</span></label
        >
        <div
            class="position-relative"
            :class="{ 'w-100': !isHorizontal, input: isHorizontal }"
        >
            <el-tree-select
                v-model="selectedValue"
                :data="tree"
                :render-after-expand="false"
                :placeholder="selectedValue ? '' : placeholder"
            />
            <div v-if="!isHorizontal" class="validation-error text-start mb-3">
                {{ error }}&nbsp;
            </div>
        </div>
    </div>
    <div class="d-flex mb-3" v-if="isHorizontal">
        <div class="w-25"></div>
        <div class="w-75 validation-error text-start">{{ error }}&nbsp;</div>
    </div>
</template>

<script lang="ts">
import { ITreeNode } from '@/common/interfaces';
import { Model, Prop, Vue } from 'vue-property-decorator';

export default class SingleSelect extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: false }) readonly isHorizontal!: boolean;
    @Prop({ default: [] }) readonly tree!: ITreeNode;

    @Model('value', { type: [String, Number] })
    readonly selectedValue!: string | number;

    onChange(value: string): void {
        this.$emit('change', value);
    }
}
</script>

<style lang="scss" scoped>
:deep(.el-select) {
    width: 100% !important;
    .select-trigger {
        width: 100% !important;
    }
}
:deep(.select-options) {
    margin: 0 2px;
    text-align: left;
    left: 0px !important;
}
:deep(.el-input) {
    margin: 0 2px;
    .el-icon-arrow-up:before {
        content: '\e78f';
    }
}
:deep(.el-select .el-input__wrapper.is-focus, .el-select
        .el-input.is-focus
        .el-input__wrapper) {
    border-color: var(--el-color-primary) !important;
    outline: 0 !important;
    box-shadow: 0 0 0 2px var(--el-color-primary) !important;
}

:deep(.el-input__wrapper) {
    border-radius: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    --el-input-hover-border-color: var(--el-color-primary);
}

.mark-required {
    color: red;
}
.label {
    word-break: break-word;
    width: 25%;
}
.input {
    width: 75%;
}
label {
    font-size: 15px;
}
.custom-tree-node {
    display: flex !important;
}
</style>
