<template>
    <BaseRightDrawer
        :title="$t('changePasswordForm.title.changePassword')"
        size="50%"
        v-model:value="isShowChangePasswordForm"
        @onClosed="onClosesPopup"
        @opened="onOpenPopup"
        customClass="change-password-form"
    >
        <template #body>
            <div class="action-buttons">
                <el-button type="primary" @click="onClickSaveButton">
                    {{ $t('userForm.button.save') }}
                </el-button>
            </div>
            <el-alert
                v-if="needToChangePassword"
                :title="$t('changePasswordForm.message.changePassword')"
                type="warning"
            />
            <div class="row">
                <div class="col-md-12" v-if="isCurrentPasswordRequired">
                    <BaseInputPassword
                        v-model:value="form.currentPassword"
                        :label="$t('changePasswordForm.currentPassword.label')"
                        :placeholder="
                            $t('changePasswordForm.currentPassword.placeholder')
                        "
                        :error="translateYupError(form.errors.currentPassword)"
                        :isRequired="true"
                    />
                </div>
                <div class="col-md-12">
                    <BaseInputPassword
                        v-model:value="form.password"
                        :label="$t('changePasswordForm.password.label')"
                        :placeholder="$t('changePasswordForm.password.placeholder')"
                        :error="translateYupError(form.errors.password)"
                        :isRequired="true"
                    />
                </div>
                <div class="col-md-12">
                    <BaseInputPassword
                        v-model:value="form.confirmPassword"
                        :label="$t('changePasswordForm.confirmPassword.label')"
                        :placeholder="
                            $t('changePasswordForm.confirmPassword.placeholder')
                        "
                        :error="translateYupError(form.errors.confirmPassword)"
                        :isRequired="true"
                    />
                </div>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { setupChangePasswordForm } from '../../composition/changePasswordForm';
import { authModule } from '@/features/auth/store';
import { Watch } from 'vue-property-decorator';
@Options({ components: {} })
export default class ChangePasswordForm extends mixins(UtilMixins) {
    form = setup(() => setupChangePasswordForm());

    get isShowChangePasswordForm() {
        return this.needToChangePassword || authModule.isShowChangePasswordForm;
    }

    get needToChangePassword(): boolean {
        return authModule.profile?.needToChangePassword || false;
    }

    get isCurrentPasswordRequired(): boolean {
        return authModule.profile?.isCurrentPasswordRequired || false;
    }

    async onClickSaveButton(): Promise<void> {
        await this.form.onSubmit();
    }

    created() {
        this.form.isCurrentPasswordRequired = this.isCurrentPasswordRequired;
    }

    onClosesPopup(): void {
        this.form.resetForm();
        authModule.setIsShowChangePasswordForm(false);
    }

    onOpenPopup() {
        this.form.isCurrentPasswordRequired = this.isCurrentPasswordRequired;
    }

    @Watch('isCurrentPasswordRequired')
    onChangeIsCurrentPasswordRequired(isCurrentPasswordRequired: boolean) {
        this.form.isCurrentPasswordRequired = isCurrentPasswordRequired;
    }
}
</script>
<style lang="scss" scoped>
.action-buttons {
    text-align: right;
    margin-bottom: 8px;
}
</style>
