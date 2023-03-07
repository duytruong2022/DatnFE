<template>
    <div class="form-group flex-column">
        <label v-if="label" class="fw-bold text-start mb-2"
            >{{ label }} <span v-if="isRequired" class="mark-required">*</span></label
        >
        <el-tree-select
            v-model="selectedValue"
            :placeholder="selectedValue?.length > 0 ? '' : placeholder"
            :filterable="filterable"
            :clearable="clearable"
            multiple
            :data="options"
            :disabled="isDisabled"
            :collapse-tags="collapseTags"
            popper-class="select-options"
            ref="multipleTreeSelect"
        />
        <div class="validation-error text-start" :class="{ 'd-block': error }">
            {{ error }}
        </div>
    </div>
</template>

<script lang="ts">
import { Model, Prop, Vue } from 'vue-property-decorator';

export default class MultipleTreeSelect extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: '' }) readonly rules!: string | Record<string, unknown>;
    @Prop({ default: false }) readonly isReadonly!: boolean;
    @Prop({ default: false }) readonly isDisabled!: boolean;
    @Prop({ default: true }) readonly collapseTags!: boolean;
    @Prop({ default: false }) readonly filterable!: boolean;
    @Prop({ default: () => [] }) readonly options!: Record<string, unknown>[];
    @Prop({ default: true }) readonly clearable!: boolean;

    @Model('value', { type: Array as () => string[] | number[] })
    readonly selectedValue!: string[] | number[];
}
</script>

<style lang="scss" scoped>
.form-group label {
    text-align: initial;
    width: 100%;
    font-weight: bold;
    margin-bottom: 6px;
}
.el-select {
    width: 100% !important;
}

:deep(.select-options) {
    margin: 0 2px;
    margin-bottom: 0px !important;
    text-align: left;
}
:deep(.el-input) {
    margin: 0 2px;

    .el-icon-arrow-up:before {
        content: '\e78f';
    }
}
:deep(.popper__arrow) {
    display: none !important;
}
.mark-required {
    color: red;
}
:deep(.el-select-dropdown__list) {
    padding: 0px !important;
}
:deep(.el-select__input) {
    cursor: pointer !important;
}
:deep(.el-select__tags) {
    max-width: unset !important;
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
    --el-input-hover-border-color: var(--el-border-color);
}
label {
    font-size: 15px;
}
.select-options {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 320px;
    padding-right: 20px;
}
</style>
