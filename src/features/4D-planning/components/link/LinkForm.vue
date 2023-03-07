<template>
    <el-dialog
        :title="title"
        v-model="openForm"
        width="30%"
        @close="closedPopup"
        @open="openPopup"
    >
        <div class="col-md-12">
            <BaseSingleSelect
                :options="linkTypeOptions"
                :label="$t('planning.linkForm.properties.type')"
                :placeholder="$t('planning.linkForm.placeholder.type')"
                v-model:value="form.linkType"
                :filterable="true"
                :clearable="true"
                :isRequired="true"
                name="linkType"
                :error="translateYupError(form.errors.linkType as string)"
            />
            <BaseInputNumber
                v-model:value="form.taskLag"
                :label="$t('planning.linkForm.properties.delay')"
                :placeholder="$t('planning.linkForm.placeholder.delay')"
                :error="translateYupError(form.errors.taskLag as string)"
                :castEmptyToNull="true"
                :isRequired="true"
                name="taskLag"
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
import { mixins, Options, setup } from 'vue-class-component';
import { setupLinkForm } from '../../compositions/linkForm';
import { LinkDependency, LinkType } from '../../constants';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningModule } from '../../store';

@Options({
    components: {},
})
export default class LinkForm extends mixins(Planning4DMixin) {
    form = setup(() => setupLinkForm());

    get isEdit() {
        return projectPlanningModule.linkFormPopupParam.edit || false;
    }

    get title() {
        if (this.isEdit) {
            return projectPlanningModule.linkFormPopupParam.dependency ===
                LinkDependency.PREDECESSOR
                ? this.$t('planning.linkForm.title.editPredecessor')
                : this.$t('planning.linkForm.title.editSuccessor');
        }
        return projectPlanningModule.linkFormPopupParam.dependency ===
            LinkDependency.PREDECESSOR
            ? this.$t('planning.linkForm.title.addPredecessor')
            : this.$t('planning.linkForm.title.addSuccessor');
    }

    openPopup() {
        if (this.isEdit) {
            const linkEdit = projectPlanningModule.linkFormPopupParam.taskLinkToList[0];

            this.form.setValues({
                taskLag: linkEdit?.taskLag,
                linkType: linkEdit?.type,
            });
        } else {
            this.form.resetForm();
        }
    }

    closedPopup() {
        projectPlanningModule.setLinkFormPopupParam({
            dependency: null,
            taskLinkToList: [],
            show: false,
        });
    }

    async onClickSaveButton() {
        if (this.isEdit) {
            await this.form.onEditLinkItem();
            this.closedPopup();
        }
        const success = await this.form.onAddLinksItem();
        if (success) {
            this.$emit(
                'added-links',
                projectPlanningModule.linkFormPopupParam.dependency,
            );
            this.closedPopup();
        }
    }

    onClickCancelButton() {
        this.closedPopup();
    }

    get linkTypeOptions() {
        return Object.values(LinkType).map((item) => ({
            label: this.$t(`planning.linkForm.linkType.${item}`),
            value: item,
        }));
    }

    get openForm() {
        return projectPlanningModule.linkFormPopupParam.show;
    }
}
</script>

<style lang="scss" scoped></style>
