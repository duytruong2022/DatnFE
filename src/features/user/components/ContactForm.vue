<template>
    <BaseRightDrawer
        :title="`${$t('user.title.contactUserTitle')} ${form.firstName} ${form.lastName}`"
        size="50%"
        v-model:value="isShowContactForm"
        @onOpened="form.openContactForm"
        @onClosed="closePopup"
        customClass="contact-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button
                    :disabled="isDisabledSaveButton"
                    type="primary"
                    @click="onClickSaveButton"
                >
                    {{ $t('userForm.button.send') }}
                </el-button>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <BaseInputText
                        v-model:value="form.email"
                        :label="$t('userForm.title.toEmail')"
                        :is-disabled="true"
                    />
                </div>
                <div class="col-md-6">
                    <BaseInputText
                        v-model:value="form.phoneNumber"
                        :label="$t('userForm.title.phoneNumber')"
                        :is-disabled="true"
                    />
                </div>
                <div class="col-md-12">
                    <BaseInputText
                        v-model:value="form.subject"
                        :label="$t('userForm.title.subject')"
                        :placeholder="$t('userForm.placeholder.subject')"
                        :error="translateYupError(form.errors.subject)"
                        :is-required="true"
                    />
                </div>
                <div class="col-md-12">
                    <BaseInputTextarea
                        v-model:value="form.description"
                        :label="$t('userForm.title.description')"
                        :placeholder="$t('userForm.placeholder.description')"
                        :error="translateYupError(form.errors.description)"
                        :is-required="true"
                    />
                </div>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, setup } from 'vue-class-component';
import { setupContactForm } from '../composition/contactForm';
import { UtilMixins } from '@/mixins/utilMixins';
import { userModule } from '../store';

export default class ContactForm extends mixins(UtilMixins) {
    form = setup(() => setupContactForm());

    get isDisabledSaveButton(): boolean {
        return userModule.isDisableSaveButton;
    }

    get isShowContactForm(): boolean {
        return userModule.isShowContactForm || false;
    }

    closePopup(): void {
        userModule.setIsShowContactForm(false);
        (this.form.resetForm as () => void)();
        userModule.setSelectedUser(null);
    }

    async onClickSaveButton(): Promise<void> {
        userModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        userModule.setIsDisableSaveButton(false);
    }
}
</script>

<style lang="scss" scoped>
.feedback-btn {
    margin-bottom: 20px;
}
</style>
