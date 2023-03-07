<template>
    <div
        class="d-flex"
        :class="{ 'flex-column': !isHorizontal, [className]: !!className }"
    >
        <label
            v-if="label"
            class="text-start mb-2 d-flex align-items-center"
            :class="{
                'w-100': !isHorizontal,
                'label mt-1': isHorizontal,
                'fw-bold': isBold,
            }"
        >
            {{ label }}
            <span v-if="isRequired" class="mark-required">*</span></label
        >
        <div
            class="position-relative"
            :class="{ 'w-100': !isHorizontal, input: isHorizontal }"
        >
            <el-input
                v-model="inputData"
                :placeholder="placeholder"
                type="text"
                :readonly="isReadonly"
                :disabled="isDisabled"
                :error="true"
                :size="size"
                :maxlength="maxLength"
                :clearable="isClearable"
                @blur="onBlur"
                @keyup="onKeyup"
                @clear="onClear"
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
import { INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import { KEY_CODE } from '@/features/auth/constants';
import { Model, Prop, Vue } from 'vue-property-decorator';
export default class InputText extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly name!: string;
    @Prop({ default: 'default' }) readonly size!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: false }) readonly isReadonly!: boolean;
    @Prop({ default: false }) readonly isDisabled!: boolean;
    @Prop({ default: INPUT_TEXT_MAX_LENGTH }) readonly maxLength!: number;
    @Prop({ default: false }) readonly isHorizontal!: boolean;
    @Prop({ default: false }) readonly isClearable!: boolean;
    @Prop({ default: '' }) readonly className!: string;
    @Prop({ default: true }) readonly isBold!: boolean;

    @Model('value', { type: [String] })
    readonly inputData!: string;

    onBlur() {
        this.$emit('blur');
    }

    onKeyup(event: KeyboardEvent) {
        if (event.key === KEY_CODE.ENTER) {
            this.$emit('onEnter');
        }
        this.$emit('keyup');
    }

    onClear() {
        this.$emit('clear');
    }
}
</script>

<style lang="scss" scoped>
/** Remove Arrows/Spinners */
/* Chrome, Safari, Edge, Opera */
:deep(.el-input__inner::-webkit-outer-spin-button),
:deep(.el-input__inner::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
}
:deep(.el-input__wrapper) {
    border-radius: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    --el-input-hover-border-color: var(--el-border-color);
}
:deep(.el-input__wrapper.is-focus) {
    border-color: var(--el-color-primary);
    outline: 0;
    box-shadow: 0 0 0 2px var(--el-color-primary);
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

.validation-error {
    line-height: 1.3;
}
</style>
