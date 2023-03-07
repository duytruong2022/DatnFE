<template>
    <BaseRightDrawer
        :title="$t('notification.form.title')"
        @onClosed="onClosed"
        size="50%"
        v-model:value="isShowRejectNotificationForm"
        customClass="reject-notification-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button @click="form.onSubmit" type="primary">{{
                    $t('notification.form.button.save')
                }}</el-button>
            </div>
            <div>
                <BaseInputTextarea
                    v-model:value="form.rejectReason"
                    :label="$t('notification.form.rejectReason.label')"
                    :placeholder="$t('notification.form.rejectReason.placeholder')"
                    :error="translateYupError(form.errors.rejectReason)"
                    :isRequired="true"
                />
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { Options, setup } from 'vue-class-component';
import { setupRejectNotificationForm } from '../composition/rejectForm';
import { notificationModule } from '../store';

@Options({
    components: {},
})
export default class RejectNotificationForm extends UtilMixins {
    form = setup(() => setupRejectNotificationForm());

    get isShowRejectNotificationForm(): boolean {
        return notificationModule.isShowRejectNotificationForm;
    }

    set isShowRejectNotificationForm(value: boolean) {
        notificationModule.setIsShowRejectNotificationForm(value);
    }

    onClosed() {
        notificationModule.setIsShowRejectNotificationForm(false);
        notificationModule.setSelectedNotification(null);
        this.form.resetForm();
    }

    onClickCancel() {
        notificationModule.setIsShowRejectNotificationForm(false);
    }
}
</script>

<style></style>
