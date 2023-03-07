<template>
    <el-dialog
        :title="title"
        v-model="openForm"
        width="30%"
        @open="openPopup"
        @close="closedPopup"
    >
        <div class="col-md-12">
            <BaseInputText
                v-model:value="form.name"
                :label="$t('planning.activityCode.label.name')"
                :placeholder="$t('planning.activityCode.placeholder.name')"
                :error="translateYupError(form.errors.name as string)"
                :isRequired="true"
            />
        </div>
        <div class="col-md-12">
            <BaseInputNumber
                v-model:value="form.maxLength"
                :label="$t('planning.activityCode.label.maxLength')"
                :placeholder="$t('planning.activityCode.placeholder.maxLength')"
                :isRequired="true"
                :error="translateYupError(form.errors.maxLength as string)"
            />
        </div>
        <div :style="{ textAlign: 'right' }">
            <el-button type="primary" @click="onClickSaveButton">{{
                $t('planning.buttons.save')
            }}</el-button>
            <el-button type="danger" @click="onClickCancelButton">{{
                $t('planning.buttons.cancel')
            }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { mixins, Options, setup } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { setupActivityCodeForm } from '../../compositions/activityCodeForm';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';

@Options({
    components: {},
})
export default class ActivityCodeFormPopup extends mixins(Planning4DMixin) {
    @Prop({ default: false }) readonly open!: boolean;

    form = setup(() => setupActivityCodeForm());

    get title() {
        if (projectPlanningModule.activityCodePopupParam.isCreate) {
            return this.$t('planning.activityCode.title.createActivityCode');
        } else {
            return this.$t('planning.activityCode.title.updateActivityCode');
        }
    }

    get openForm() {
        return this.open;
    }

    async openPopup() {
        const activityCodeIdSelected =
            projectPlanningModule.activityCodePopupParam.activityCodeIdSelected;
        if (activityCodeIdSelected) {
            const response = await projectPlanningService.getActivityCode(
                activityCodeIdSelected,
            );
            if (response.success) {
                this.form.setValues({
                    name: response.data.name,
                    maxLength: response.data.maxLength,
                });
            } else {
                showErrorNotificationFunction(response.message);
            }
        } else {
            this.form.resetForm({ values: this.form.initValues });
        }
    }

    closedPopup() {
        this.$emit('close-activity-code-form');
    }

    async onClickSaveButton() {
        const response = await this.form.onSubmit();
        if (response) {
            if (projectPlanningModule.activityCodePopupParam.isCreate) {
                showSuccessNotificationFunction(
                    this.$t('planning.activityCode.message.createActivityCodeSuccess'),
                );
            } else {
                this.$emit('updated-activity-code');
                showSuccessNotificationFunction(
                    this.$t('planning.activityCode.message.updateActivityCodeSuccess'),
                );
            }
            this.$emit('close-activity-code-form');
        }
    }

    onClickCancelButton() {
        this.closedPopup();
    }
}
</script>

<style lang="scss" scoped></style>
