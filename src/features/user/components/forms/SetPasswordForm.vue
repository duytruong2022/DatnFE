<template>
    <BaseRightDrawer
        :title="$t('setPasswordForm.title.authentication')"
        size="50%"
        v-model:value="isShowResetPasswordForm"
        @onOpened="form.openUserForm"
        @onClosed="closePopup"
        customClass="set-password-form"
    >
        <template #body>
            <p class="user-email">
                {{ $t('setPasswordForm.email') }}: {{ selectedUser?.email }}
            </p>
            <div :style="{ textAlign: 'right' }">
                <el-button type="primary" @click="onClickSaveButton">
                    {{ $t('userForm.button.save') }}
                </el-button>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <BaseInputPassword
                        v-model:value="form.password"
                        :label="$t('setPasswordForm.password.label')"
                        :placeholder="$t('setPasswordForm.password.placeholder')"
                        :error="translateYupError(form.errors.password)"
                        :isRequired="true"
                        :isDisabled="form.assignRandomPassword"
                    />
                </div>
                <div class="col-md-12">
                    <BaseInputPassword
                        v-model:value="form.confirmPassword"
                        :label="$t('setPasswordForm.confirmPassword.label')"
                        :placeholder="$t('setPasswordForm.confirmPassword.placeholder')"
                        :error="translateYupError(form.errors.confirmPassword)"
                        :isRequired="true"
                        :isDisabled="form.assignRandomPassword"
                    />
                </div>
                <div class="col-md-12">
                    <el-checkbox
                        v-model="form.assignRandomPassword"
                        :label="$t('setPasswordForm.assignRandomPassword.label')"
                        size="large"
                    />
                </div>
                <div class="col-md-12">
                    <el-checkbox
                        :disabled="!isAssignRandomPassword"
                        v-model="form.needToChangePassword"
                        :label="$t('setPasswordForm.needToChangePassword.label')"
                        size="large"
                    />
                </div>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { userModule } from '../../store';
import { UtilMixins } from '@/mixins/utilMixins';
import { setupSetPasswordForm } from '../../composition/setPasswordForm';
import { Watch } from 'vue-property-decorator';

@Options({ components: {} })
export default class SetPasswordForm extends mixins(UtilMixins) {
    form = setup(() => setupSetPasswordForm());

    get selectedUser() {
        return userModule.selectedUser;
    }

    get isShowResetPasswordForm(): boolean {
        return userModule.isShowSetPasswordForm;
    }

    get isDisablePasswordFields(): boolean {
        return this.form.assignRandomPassword as boolean;
    }

    get isAssignRandomPassword(): boolean {
        return this.form.assignRandomPassword as unknown as boolean;
    }

    closePopup(): void {
        userModule.setIsShowSetPasswordForm(false);
        (this.form.resetForm as () => void)();
        userModule.setSelectedUser(null);
    }

    async onClickSaveButton(): Promise<void> {
        userModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        userModule.setIsDisableSaveButton(false);
    }

    @Watch('isDisablePasswordFields')
    onChangeIsDisablePasswordFields(isDisablePasswordFields: boolean) {
        if (isDisablePasswordFields) {
            this.form.password = '';
            this.form.confirmPassword = '';
        }
    }

    @Watch('isAssignRandomPassword')
    onChangeIsAssignRandomPassword(isAssignRandomPassword: boolean) {
        if (!isAssignRandomPassword) {
            this.form.needToChangePassword = true;
        }
    }
}
</script>
<style lang="scss" scoped>
.securityProfile {
    margin-top: 10px;
}
.user-email {
    font-size: 13px;
    font-weight: 600;
}
</style>
