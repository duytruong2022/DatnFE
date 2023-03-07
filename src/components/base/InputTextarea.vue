<template>
    <div class="d-flex" :class="{ 'flex-column': !isHorizontal }">
        <label
            v-if="label"
            class="fw-bold text-start mb-2 d-flex align-items-center"
            :class="{ 'w-100': !isHorizontal, 'label mt-1': isHorizontal }"
        >
            {{ label }}
            <span v-if="isRequired" class="mark-required">*</span></label
        >

        <div
            class="position-relative"
            :class="{ 'w-100': !isHorizontal, input: isHorizontal }"
        >
            <el-input
                v-model="inputValue"
                :placeholder="placeholder"
                type="textarea"
                :autosize="{ minRows, maxRows }"
                :rows="rows"
                :maxlength="maxLength"
                :show-word-limit="showWordLimit"
            />
        </div>
        <div v-if="!isHorizontal" class="validation-error text-start mb-3">
            {{ error }}&nbsp;
        </div>
    </div>
    <div class="d-flex mb-3" v-if="isHorizontal">
        <div class="w-25"></div>
        <div class="w-75 validation-error text-start">{{ error }}&nbsp;</div>
    </div>
</template>

<script lang="ts">
import {
    TEXTAREA_MAX_LENGTH,
    TEXTAREA_MAX_ROW,
    TEXTAREA_DEFAULT_ROWS,
} from '@/common/constants';
import { Model, Prop, Vue } from 'vue-property-decorator';

export default class InputTextArea extends Vue {
    @Prop({ default: 'text' }) readonly type!: string;
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: false }) readonly isReadonly!: boolean;
    @Prop({ default: false }) readonly isDisabled!: boolean;
    @Prop({ default: TEXTAREA_DEFAULT_ROWS }) readonly rows!: number;
    @Prop({ default: TEXTAREA_DEFAULT_ROWS }) readonly minRows!: number;
    @Prop({ default: TEXTAREA_MAX_ROW }) readonly maxRows!: number;
    @Prop({ default: TEXTAREA_MAX_LENGTH }) readonly maxLength!: number;
    @Prop({ default: false }) readonly showWordLimit!: boolean;
    @Prop({ default: false }) readonly isHorizontal!: boolean;

    @Model('value', { type: [String, Number] })
    readonly inputValue!: string;
}
</script>

<style lang="scss" scoped>
.form-group {
    margin-bottom: 20px;
}
:deep(.el-textarea__inner) {
    border-radius: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    --el-input-hover-border-color: var(--el-border-color);
}
:deep(.el-textarea__inner:focus) {
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
</style>
