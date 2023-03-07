<template>
    <BaseRightDrawer
        :title="
            form.isCreate
                ? $t('projectGroup.groupForm.title.create')
                : $t('projectGroup.groupForm.title.update')
        "
        @onClosed="closePopup"
        @onOpened="form.openPopup"
        size="50%"
        v-model:value="isShowGroupForm"
        customClass="group-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button @click="onClickCancel">{{
                    $t('projectGroup.groupForm.button.cancel')
                }}</el-button>
                <el-button @click="onClickSaveButton" type="primary">{{
                    $t('projectGroup.groupForm.button.save')
                }}</el-button>
            </div>

            <div>
                <BaseInputText
                    class="mb-4"
                    v-model:value="form.name"
                    :label="$t('projectGroup.groupForm.name.label')"
                    :placeholder="$t('projectGroup.groupForm.name.placeholder')"
                    :error="translateYupError(form.errors.name)"
                    :is-required="true"
                />
                <BaseSingleSelect
                    class="mb-4"
                    :filterable="true"
                    v-model:value="form.projectProfileId"
                    :error="translateYupError(form.errors.projectProfileId)"
                    :options="projectProfileOptions"
                    :clearable="true"
                    :label="$t('projectGroup.groupForm.projectProfile.label')"
                    :placeholder="$t('projectGroup.groupForm.projectProfile.placeholder')"
                />
                <BaseInputTextarea
                    class="mb-4"
                    v-model:value="form.description"
                    :label="$t('projectGroup.groupForm.description.label')"
                    :placeholder="$t('projectGroup.groupForm.description.placeholder')"
                    :error="translateYupError(form.errors.description)"
                    :is-required="true"
                />
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { ElLoading } from 'element-plus';
import { mixins, setup } from 'vue-class-component';
import { setupProjectGroupForm } from '../composition/projectGroupForm';
import { projectGroupModule } from '../store';
import { ProjectGroupMixin } from '../mixins/ProjectGroupMixin';

export default class GroupForm extends mixins(ProjectGroupMixin) {
    form = setup(() => setupProjectGroupForm());

    get isDisabledSaveButton(): boolean {
        return projectGroupModule.isDisableSaveButton;
    }

    get isShowGroupForm(): boolean {
        return projectGroupModule.isShowGroupPopUp || false;
    }

    set isShowGroupForm(val: boolean) {
        projectGroupModule.setIsShowGroupForm(val);
    }

    onClickCancel(): void {
        projectGroupModule.setIsShowGroupForm(false);
    }

    async closePopup(): Promise<void> {
        projectGroupModule.setIsShowGroupForm(false);
        projectGroupModule.setSelectedGroup(null);
        (this.form.resetForm as () => void)();
    }

    async onClickSaveButton(): Promise<void> {
        projectGroupModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        projectGroupModule.setIsDisableSaveButton(false);
    }

    async initData() {
        const loading = ElLoading.service({ target: '.page-wrapper' });
        await this.getProjectProfileList();
        loading.close();
    }

    async created() {
        this.initData();
    }
}
</script>
