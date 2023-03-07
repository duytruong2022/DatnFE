<template>
    <div class="forgot-password-form-popup-wrapper">
        <el-dialog
            width="50%"
            v-model="isShowForgotPasswordFormPopUp"
            @closed="closePopup"
            @open="form.openPopup"
            custom-class="forgot-password-form-popup"
        >
            <template #title>
                <h3 class="mt-2 fw-bold">
                    {{ $t('forgotPassword.title') }}
                </h3>
            </template>
            <div class="row">
                <div class="col-md-12">
                    <BaseInputText
                        v-model:value="form.email"
                        :error="translateYupError(form.errors.email)"
                        :placeholder="$t('forgotPassword.email.placeholder')"
                        @onEnter="onEnter"
                    />
                </div>
            </div>
            <template #footer>
                <el-button
                    class="btn btn-action bg-sign-in w-10 my-4 mb-2"
                    @click="onForgotPasswordButton"
                >
                    {{ $t('forgotPassword.button.confirm') }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { setup } from 'vue-class-component';
import { setupForgotPasswordForm } from '../../composition/forgotPasswordForm';
import { UtilMixins } from '@/mixins/utilMixins';
import { authModule } from '../../store';

export default class ForgotPasswordFormPopup extends UtilMixins {
    form = setup(() => setupForgotPasswordForm());

    get isShowForgotPasswordFormPopUp(): boolean {
        return authModule.isShowForgotPasswordFormPopUp;
    }

    set isShowForgotPasswordFormPopUp(val: boolean) {
        authModule.setIsShowForgotPasswordFormPopUp(val);
    }

    async closePopup(): Promise<void> {
        authModule.setIsShowForgotPasswordFormPopUp(false);
        (this.form.resetForm as () => void)();
    }

    async onForgotPasswordButton(): Promise<void> {
        await this.form.onSubmit();
    }

    async onEnter(): Promise<void> {
        await this.form.onSubmit();
    }
}
</script>
<style lang="scss" scoped>
.sign-in-ldap-form-popup {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.text-left {
    text-align: left;
}

.btn-action {
    width: 100%;
    margin: 0px !important;
    border-radius: 10px;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    height: 40px;
    transition: all 0.15s ease-in;
    background-image: linear-gradient(310deg, #2152ff 0%, #21d4fd 100%);
    &:hover {
        color: #fff !important;
        transform: scale(1.02);
    }
}

.forgot-password-form-popup-wrapper {
    :deep(.el-dialog) {
        width: 400px;
        margin-top: 130px !important;
        .el-dialog__close {
            display: none;
        }
        .el-dialog__header {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-bottom: 0px;
        }
        .el-dialog__header {
            width: 100%;
        }
    }
}
</style>
