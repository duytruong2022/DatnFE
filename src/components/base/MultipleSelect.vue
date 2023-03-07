<template>
    <div class="form-group flex-column">
        <label v-if="label" class="fw-bold text-start mb-2"
            >{{ label }} <span v-if="isRequired" class="mark-required">*</span></label
        >
        <el-select
            v-model="selectedValue"
            :placeholder="selectedValue?.length > 0 ? '' : placeholder"
            :filterable="filterable"
            :clearable="clearable"
            multiple
            :disabled="isDisabled"
            :collapse-tags="collapseTags"
            popper-class="select-options"
            ref="multipleSelect"
            fit-input-width
            :default-first-option="defaultFirstOption"
            @change="onChange"
        >
            <template v-for="option in options" :key="option.value">
                <el-option
                    class="select-options"
                    :label="option.label"
                    :value="option.value"
                    :id="`option_${option.value}`"
                    :style="optionStyle"
                />
            </template>
        </el-select>
        <div class="validation-error text-start" :class="{ 'd-block': error }">
            {{ error }}
        </div>
    </div>
</template>

<script lang="ts">
import { Model, Prop, Vue } from 'vue-property-decorator';

export default class MultipleSelect extends Vue {
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
    @Prop({ default: false }) readonly defaultFirstOption!: boolean;

    @Model('value', { type: Array as () => string[] | number[] })
    readonly selectedValue!: string[] | number[];

    optionStyle: Record<string, string> = {
        whiteSpace: 'normal',
        overflow: 'visible',
        textOverflow: 'unset',
        height: 'auto',
    };

    onChange(value: string): void {
        this.$emit('change', value);
    }
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

:deep(.el-select .el-select__tags-text) {
    overflow-y: initial;
    overflow-x: clip;
}

:deep(.el-input__wrapper) {
    border-radius: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    --el-input-hover-border-color: var(--el-border-color);
}
label {
    font-size: 15px;
}
</style>
