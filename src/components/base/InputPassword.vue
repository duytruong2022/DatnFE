<template>
    <div class="form-group d-flex" :class="{ 'flex-column': !isHorizontal }">
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
            <el-input
                v-model="inputData"
                :placeholder="placeholder"
                :type="isShowPassword ? 'text' : 'password'"
                :readonly="isReadonly"
                :disabled="isDisabled"
            >
                <template #suffix>
                    <div
                        class="input-password-icon mr-3"
                        @click="isShowPassword = !isShowPassword"
                    >
                        <i v-if="isShowPassword" class="fa fa-eye fa-2" />
                        <i v-else class="fa fa-eye-slash fa-2" />
                    </div>
                </template>
            </el-input>
            <div class="validation-error text-start d-block">
                {{ error }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Model, Prop, Vue } from 'vue-property-decorator';

export default class InputPassword extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: false }) readonly isReadonly!: boolean;
    @Prop({ default: false }) readonly isDisabled!: boolean;
    @Prop({ default: false }) readonly isHorizontal!: boolean;

    isShowPassword = false;

    @Model('value', { type: [String, Number] })
    readonly inputData!: string;
}
</script>

<style lang="scss" scoped>
.input-password-icon {
    cursor: pointer;
}
.fa {
    font-size: 16px;
}
.mark-required {
    color: red;
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
