<template>
    <BaseRightDrawer
        :title="$t('planning.assignResource.title.assignResource')"
        size="50%"
        v-model:value="isShowAssignResourceForm"
        @onOpen="openAssignResourceForm"
        @onClosed="closePopup"
        customClass="pbs-group-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button
                    type="primary"
                    @click="onClickSaveButton"
                    :disabled="isDisableSaveButton"
                >
                    {{ $t('planning.buttons.save') }}
                </el-button>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <BaseMultipleSelect
                        v-model:value="form.resourceIds"
                        :options="resourceOptions"
                        :label="$t('planning.assignResource.label.resource')"
                        :placeholder="$t('planning.assignResource.placeholder.resource')"
                        :error="
                            translateYupError(form.errors.resourceIds)
                                ? translateYupError(form.errors.resourceIds)
                                : resourceIdsError
                        "
                        :filterable="true"
                    />
                </div>
                <div class="col-md-12">
                    <BaseMultipleSelect
                        v-model:value="form.appearanceProfileIds"
                        :options="appearanceProfileOption"
                        :label="$t('planning.assignResource.label.appearanceProfileIds')"
                        :placeholder="
                            $t('planning.assignResource.placeholder.appearanceProfileIds')
                        "
                        :error="translateYupError(form.errors.appearanceProfileIds)"
                        :filterable="true"
                    />
                </div>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { Watch } from 'vue-property-decorator';
import { mixins, Options, setup } from 'vue-class-component';
import { setupAssignResource } from '../../compositions/assignResourceForm';
import { projectPlanningModule } from '../../store';
import localStorageAuthService from '@/common/authStorage';
import { projectModule } from '@/features/project/store';

@Options({ components: {} })
export default class AssignResourceForm extends mixins(UtilMixins) {
    form = setup(() => setupAssignResource());
    isFirstChangeResourceIds = true;
    isFirstChangeResourceGroupIds = true;
    resourceIdsError = '';
    resourceGroupIdsError = '';

    get selectedTaskIds() {
        return projectPlanningModule.selectedTaskIdList;
    }

    get resourceOptions() {
        return projectPlanningModule.resourceList.map((resource) => ({
            label: resource.name,
            value: resource._id,
        }));
    }

    get resourceGroupOptions() {
        return projectPlanningModule.resourceGroupList.map((resourceGroup) => ({
            label: resourceGroup.name,
            value: resourceGroup._id,
        }));
    }

    get resourceIds(): string[] {
        return this.form.resourceIds as string[];
    }

    get isShowAssignResourceForm() {
        return projectPlanningModule.isShowAssignResourceForm;
    }

    get isDisableSaveButton() {
        return projectPlanningModule.isDisabledSaveButton;
    }

    get planningPath() {
        return localStorageAuthService.getPlanningPermissions().path;
    }

    get appearanceProfileOption() {
        return projectPlanningModule.appearanceProfileList.map((profile) => ({
            label: profile.name,
            value: profile._id,
        }));
    }

    closePopup(): void {
        projectPlanningModule.setIsShowAssignResourceForm(false);
        (this.form.resetForm as () => void)();
    }

    async onClickSaveButton(): Promise<void> {
        if (!this.resourceIds.length) {
            this.resourceIdsError = this.$t(
                'planning.assignResource.message.resourceRequired',
            );
            this.resourceGroupIdsError = this.$t(
                'planning.assignResource.message.resourceGroupRequired',
            );
            projectPlanningModule.setIsDisableSaveButton(true);
            return;
        }
        this.form.taskIds = this.selectedTaskIds;
        projectPlanningModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        projectPlanningModule.setIsDisableSaveButton(false);
        this.$emit('assign-resource-success');
    }

    openAssignResourceForm() {
        projectPlanningModule.getResourceList({
            planningId: projectPlanningModule.planning?._id || '',
            projectId: projectModule.selectedProjectId || '',
            path: this.planningPath || '',
        });
        projectPlanningModule.getResourceGroupList({
            planningId: projectPlanningModule.planning?._id || '',
            projectId: projectModule.selectedProjectId || '',
            path: this.planningPath || '',
        });
        projectPlanningModule.getAppearanceProfileList({
            planningId: projectPlanningModule.planning?._id || '',
        });
        projectPlanningModule.setIsDisableSaveButton(false);
        this.isFirstChangeResourceIds = true;
        this.isFirstChangeResourceGroupIds = true;
        this.resourceIdsError = '';
        this.resourceGroupIdsError = '';
        this.form.openAssignResourceForm();
    }

    @Watch('resourceIds')
    validateResourceIds() {
        if (!this.isFirstChangeResourceIds) {
            this.resourceIdsError = '';
            this.resourceGroupIdsError = '';
            projectPlanningModule.setIsDisableSaveButton(false);
            if (!this.resourceIds.length) {
                this.resourceIdsError = this.$t(
                    'planning.assignResource.message.resourceRequired',
                );
                this.resourceGroupIdsError = this.$t(
                    'planning.assignResource.message.resourceGroupRequired',
                );
                projectPlanningModule.setIsDisableSaveButton(true);
            }
        } else {
            this.isFirstChangeResourceIds = false;
        }
    }
}
</script>
