<template>
    <el-dialog
        :title="$t('planning.linkForm.title.linkDetail')"
        v-model="linkDetailFormPopupParam.show"
        width="40%"
        @close="closedPopup"
        @open="openedPopup"
    >
        <div class="row">
            <div class="col-6">
                <BaseInputText
                    :label="$t('planning.linkForm.properties.source')"
                    v-model:value="sourceName"
                    :isDisabled="true"
                />
            </div>
            <div class="col-6">
                <BaseInputText
                    :label="$t('planning.linkForm.properties.target')"
                    v-model:value="targetName"
                    :isDisabled="true"
                />
            </div>
            <div class="col-6">
                <BaseSingleSelect
                    :isDisabled="true"
                    :options="linkTypeOptions"
                    :label="$t('planning.linkForm.properties.type')"
                    v-model:value="form.linkType"
                    :filterable="true"
                    :clearable="true"
                    :error="translateYupError(form.errors.linkType as string)"
                />
            </div>
            <div class="col-6">
                <BaseInputNumber
                    v-model:value="form.taskLag"
                    :label="$t('planning.linkForm.properties.delay')"
                    :placeholder="$t('planning.linkForm.placeholder.delay')"
                    :error="translateYupError(form.errors.taskLag as string)"
                    :castEmptyToNull="true"
                    :isRequired="true"
                />
            </div>
        </div>
        <div :style="{ textAlign: 'right' }">
            <el-button type="primary" @click="onClickSaveButton">{{
                $t('planning.buttons.save')
            }}</el-button>
            <el-button type="danger" @click="onClickDeleteButton">{{
                $t('planning.buttons.delete')
            }}</el-button>
            <el-button @click="onClickCancelButton">{{
                $t('planning.buttons.cancel')
            }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { showConfirmPopUpFunction } from '@/common/helpers';
import { mixins, Options, setup } from 'vue-class-component';
import { setupLinkForm } from '../../compositions/linkForm';
import { LinkType } from '../../constants';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningModule } from '../../store';

@Options({
    components: {},
})
export default class LinkDetailFormPopup extends mixins(Planning4DMixin) {
    form = setup(() => setupLinkForm());

    get linkTypeOptions() {
        return Object.values(LinkType).map((item) => ({
            label: this.$t(`planning.linkForm.linkType.${item}`),
            value: item,
        }));
    }

    closedPopup() {
        projectPlanningModule.setLinkDetailPopupFormParam({
            show: false,
            linkSelected: null,
        });
    }

    get linkDetailFormPopupParam() {
        return projectPlanningModule.linkDetailFormPopupParam;
    }

    openedPopup() {
        const link = this.linkDetailFormPopupParam.linkSelected;
        this.form.setValues({
            linkType: link?.type,
            taskLag: link?.lag || 0,
        });
    }

    async onClickSaveButton() {
        const response = await this.form.onUpdateLink();
        if (response) {
            this.$emit('updated-link', response.data);
            this.closedPopup();
        }
    }

    onClickCancelButton() {
        this.closedPopup();
    }

    async onClickDeleteButton() {
        const isConfirm = await showConfirmPopUpFunction(
            this.$t('planning.linkForm.messages.confirmDeleteLink'),
            this.$t('planning.linkForm.title.deleteLink'),
        );
        if (!isConfirm) {
            return;
        }
        this.$emit('delete-link', this.linkDetailFormPopupParam.linkSelected?._id);
        this.closedPopup();
    }

    get sourceName() {
        const tasks = projectPlanningModule.planning?.tasks;
        const source = tasks?.find((task) => {
            return task._id === this.linkDetailFormPopupParam.linkSelected?.source;
        });
        return source?.name || '';
    }

    get targetName() {
        const tasks = projectPlanningModule.planning?.tasks;
        const source = tasks?.find((task) => {
            return task._id === this.linkDetailFormPopupParam.linkSelected?.target;
        });
        return source?.name || '';
    }
}
</script>

<style lang="scss" scoped></style>
