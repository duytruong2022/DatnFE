<template>
    <BaseRightDrawer
        :title="$t('planning.assignResourceGroup.title.assignResourceGroup')"
        size="50%"
        v-model:value="isShowAssignResourceGroupForm"
        @onOpen="openAssignResourceGroupForm"
        @onClosed="closePopup"
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
                        v-model:value="form.resourceGroupIds"
                        :options="resourceGroupOptions"
                        :label="$t('planning.assignResourceGroup.label.resourceGroup')"
                        :placeholder="
                            $t('planning.assignResourceGroup.placeholder.resourceGroup')
                        "
                        :error="
                            translateYupError(form.errors.resourceGroupIds)
                                ? translateYupError(form.errors.resourceGroupIds)
                                : resourceGroupIdsError
                        "
                        :filterable="true"
                    />
                </div>
                <div class="col-md-12">
                    <BaseMultipleSelect
                        v-model:value="form.appearanceProfileIds"
                        :options="appearanceProfileOption"
                        :label="
                            $t('planning.assignResourceGroup.label.appearanceProfileIds')
                        "
                        :placeholder="
                            $t(
                                'planning.assignResourceGroup.placeholder.appearanceProfileIds',
                            )
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
import { setupAssignResourceGroup } from '../../compositions/assignResourceGroupForm';
import { projectPlanningModule } from '../../store';
import localStorageAuthService from '@/common/authStorage';
import { projectModule } from '@/features/project/store';

@Options({ components: {} })
export default class AssignResourceGroupForm extends mixins(UtilMixins) {
    form = setup(() => setupAssignResourceGroup());
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

    get resourceGroupIds(): string[] {
        return this.form.resourceGroupIds as string[];
    }

    get isShowAssignResourceGroupForm() {
        return projectPlanningModule.isShowAssignResourceGroupForm;
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
        projectPlanningModule.setIsShowAssignResourceGroupForm(false);
        (this.form.resetForm as () => void)();
    }

    async onClickSaveButton(): Promise<void> {
        if (!this.resourceGroupIds.length) {
            this.resourceIdsError = this.$t(
                'planning.assignResourceGroup.message.resourceRequired',
            );
            this.resourceGroupIdsError = this.$t(
                'planning.assignResourceGroup.message.resourceGroupRequired',
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

    openAssignResourceGroupForm() {
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
        this.form.openAssignResourceGroupForm();
    }

    @Watch('resourceGroupIds')
    validateResourceGroupIds() {
        if (!this.isFirstChangeResourceGroupIds) {
            this.resourceIdsError = '';
            this.resourceGroupIdsError = '';
            projectPlanningModule.setIsDisableSaveButton(false);
            if (!this.resourceGroupIds.length) {
                this.resourceIdsError = this.$t('pbsGroup.message.groupRequired');
                this.resourceGroupIdsError = this.$t('pbsGroup.message.groupRequired');
                projectPlanningModule.setIsDisableSaveButton(true);
            }
        } else {
            this.isFirstChangeResourceGroupIds = false;
        }
    }
}
</script>
