<template>
    <div class="resource-form">
        <div :style="{ textAlign: 'right' }" v-if="!hideActionButton">
            <el-button type="primary" @click="onClickSaveButton">
                {{ $t('planning.buttons.save') }}
            </el-button>
            <el-button type="danger" @click="onClickCancelButton">
                {{ $t('planning.buttons.cancel') }}
            </el-button>
        </div>
        <div class="row">
            <div class="col-6">
                <BaseInputText
                    v-model:value="form.name"
                    :label="$t('planning.resource.resourceList.name')"
                    :placeholder="$t('planning.resource.placeholder.name')"
                    :error="translateYupError(form.errors.name as string)"
                    :is-required="true"
                />
            </div>
            <div class="col-6">
                <BaseTreeSelect
                    :tree="resourceTree"
                    :label="$t('planning.resource.resourceList.parentId')"
                    :placeholder="$t('planning.resource.placeholder.parentId')"
                    v-model:value="form.parentId"
                    :error="translateYupError(form.errors.parentId as string)"
                />
            </div>
            <div class="col-6">
                <BaseSingleSelect
                    v-model:value="type"
                    :options="resourceTypeOptions"
                    :label="$t('planning.resource.resourceList.type')"
                    :placeholder="$t('planning.resource.placeholder.type')"
                    :error="translateYupError(form.errors.type as string)"
                    :is-required="true"
                />
            </div>
            <div class="col-6">
                <BaseSingleSelect
                    v-model:value="form.unit"
                    :options="resourceUnitOption"
                    :label="$t('planning.resource.resourceList.resourceUnit')"
                    :placeholder="$t('planning.resource.placeholder.resourceUnit')"
                    :error="translateYupError(form.errors.unit as string)"
                    :is-required="true"
                />
            </div>
            <div class="col-6">
                <BaseSingleSelect
                    v-model:value="form.calendar"
                    :label="$t('planning.gantt.columns.calendar')"
                    :placeholder="$t('planning.task.form.placeholders.calendar')"
                    :isRequired="true"
                    :error="translateYupError(form.errors.calendar as string)"
                    :options="calendarOptions"
                    filterable
                />
            </div>
            <div class="col-6">
                <BaseMultipleSelect
                    v-model:value="form.fileIds"
                    v-if="form.type !== resourceType.HUMAN_RESOURCE"
                    :label="$t('planning.resource.resourceList.files')"
                    :placeholder="$t('planning.resource.placeholder.files')"
                    :error="translateYupError(form.errors.fileIds as string)"
                    :options="fileOptions"
                    :filterable="true"
                />
            </div>
            <div class="col-12">
                <BaseInputTextarea
                    v-model:value="form.description"
                    :label="$t('planning.resource.resourceList.description')"
                    :placeholder="$t('planning.resource.placeholder.description')"
                    :error="translateYupError(form.errors.description as string)"
                    :is-required="false"
                />
            </div>
        </div>

        <div class="row">
            <label class="col-10">Workload and capacity</label>
            <div class="col-2 d-flex justify-content-end">
                <el-button type="success" @click="handleAddWorkloadAndCapacity">
                    {{ $t('planning.buttons.add') }}
                </el-button>
            </div>
        </div>

        <div class="row" v-for="(field, index) in form.workloadAndCapacity" :key="index">
            <div class="col-4">
                <BaseDatePicker
                    v-model:value="field.effectiveDate"
                    :label="$t('planning.resource.resourceList.effectiveDate')"
                    :placeholder="$t('planning.resource.placeholder.effectiveDate')"
                    :valueFormat="null"
                    :error="translateYupError((form.errors as any)[`workloadAndCapacity[${index}].effectiveDate`])"
                />
            </div>
            <div class="col-3">
                <BaseInputNumber
                    v-model:value="field.unitPerPeriod"
                    :castEmptyToNull="true"
                    :label="$t('planning.resource.resourceList.unit')"
                    :placeholder="$t('planning.resource.placeholder.unit')"
                    :error="translateYupError((form.errors as any)[`workloadAndCapacity[${index}].unitPerPeriod`])"
                />
            </div>
            <div class="col-3">
                <BaseInputNumber
                    v-model:value="field.pricePerUnit"
                    :castEmptyToNull="true"
                    :label="$t('planning.resource.resourceList.price')"
                    :placeholder="$t('planning.resource.placeholder.price')"
                    :error="translateYupError((form.errors as any)[`workloadAndCapacity[${index}].pricePerUnit`])"
                />
            </div>
            <div class="col-2 d-flex justify-content-end align-items-center">
                <el-button
                    size="small"
                    type="danger"
                    @click="handleDeleteWorkloadAndCapacity(index)"
                    >{{ $t('planning.buttons.delete') }}</el-button
                >
            </div>
        </div>

        <BaseTableLayout
            v-if="
                selectedResource?.fileIds?.length &&
                form.type !== resourceType.HUMAN_RESOURCE
            "
            :data="selectedResource?.fileIds"
            :totalItems="selectedResource?.fileIds?.length"
            :isShowPagination="false"
        >
            <template #table-columns>
                <el-table-column
                    :label="$t('planning.resource.fileList.name')"
                    min-width="250"
                >
                    <template #default="scope">
                        {{ scope.row.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('planning.resource.fileList.createdBy')"
                    prop="fullName"
                    min-width="210"
                >
                    <template #default="scope">
                        {{ scope.row.user?.firstName || '' }}
                        {{ scope.row.user?.lastName || '' }}
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
</template>

<script lang="ts">
import { parseLanguageSelectOptions } from '@/common/helpers';
import { mixins, Options, setup } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { innitResource, setupResourceForm } from '../../compositions/resourceForm';
import {
    ResourceTypeOptions,
    ResourceOtherUnitType,
    ResourceMaterialUnitType,
    ResourceType,
    AssignToExistingResourceOption,
} from '../../constants';
import { projectPlanningModule } from '../../store';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { ElLoading } from 'element-plus';
import { projectModule } from '@/features/project/store';
import { viewer3DFileExtensions } from '@/features/abs/constants';
import { absModule } from '@/features/abs/store';
import { calendarModule } from '@/features/calendar/store';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import { cloneDeep } from 'lodash';

@Options({ components: {} })
export default class ResourceDetail extends mixins(Planning4DMixin) {
    @Prop({ default: false }) hideActionButton!: boolean;
    @Prop({ default: '' })
    assignToExistingResourceOption!: AssignToExistingResourceOption;
    form = setup(() => setupResourceForm());

    taskTreeSelectProps = {
        label: 'label',
        children: 'children',
        isLeaf: 'isLeaf',
    };

    get type(): ResourceType | null {
        return this.form.type as ResourceType | null;
    }

    set type(value: ResourceType | null) {
        if (
            (this.form.type === ResourceType.MATERIAL &&
                value !== ResourceType.MATERIAL) ||
            (this.form.type !== ResourceType.MATERIAL &&
                value === ResourceType.MATERIAL) ||
            !value
        ) {
            this.form.setFieldValue('unit', '');
        }
        this.form.setFieldValue('type', value as string);
    }

    get resourceTree() {
        return projectPlanningModule.resourceTree;
    }

    get selectedResourceNodeId() {
        return projectPlanningModule.selectedResourceNodeId;
    }

    get resourceTypeOptions() {
        if (projectPlanningModule.isShowImportResourcePopup) {
            return parseLanguageSelectOptions(
                ResourceTypeOptions.filter(
                    (option) => option.value !== ResourceType.HUMAN_RESOURCE,
                ),
            );
        }
        return parseLanguageSelectOptions(ResourceTypeOptions);
    }

    get resourceUnitOption() {
        if (!this.form.type) {
            return null;
        }
        if (this.form.type === this.resourceType.MATERIAL) {
            return Object.values(ResourceMaterialUnitType).map((item) => ({
                label: this.$t(`planning.resource.resourceUit.material.${item}`),
                value: item,
            }));
        } else {
            return Object.values(ResourceOtherUnitType).map((item) => ({
                label: this.$t(`planning.resource.resourceUit.other.${item}`),
                value: item,
            }));
        }
    }

    get fileOptions() {
        return projectPlanningModule.projectFileList.map((file) => ({
            label: file.name,
            value: file._id,
        }));
    }

    get selectedResource() {
        return projectPlanningModule.selectedResource;
    }

    async created() {
        const loading = ElLoading.service({ target: '.resource-form' });
        await projectPlanningModule.getProjectFileList({
            projectId: projectModule.selectedProjectId || '',
            type: viewer3DFileExtensions,
        });
        if (projectPlanningModule.selectedResource?._id) {
            const response = await projectPlanningService.getResourceDetail(
                projectPlanningModule.selectedResource._id,
            );
            if (response.success) {
                this.form.resetForm({
                    values: {
                        name: response.data?.name || '',
                        type: response.data?.type || '',
                        unit: response.data?.unit || '',
                        fileIds: response.data?.fileIds || [],
                        description: response.data?.description || '',
                        parentId: response.data?.parentId || '',
                        calendar: response.data?.calendar || '',
                        workloadAndCapacity: response.data.workloadAndCapacity || [],
                        assignToExistingResourceOption: this
                            .assignToExistingResourceOption?.length
                            ? this.assignToExistingResourceOption
                            : null,
                        sessionToken: webViewer3DModule.sessionToken || '',
                    },
                });
            }
        }
        if (absModule.selectedFileIds.length) {
            this.setFileIds(absModule.selectedFileIds);
        }
        loading.close();
    }

    setFileIds(fileIds: string[]) {
        this.form.setFieldValue('fileIds', fileIds);
    }

    handleDeleteWorkloadAndCapacity(index: number) {
        this.form.workloadAndCapacity.splice(index, 1);
    }

    handleAddWorkloadAndCapacity() {
        const workloadAndCapacityClone = cloneDeep(this.form.workloadAndCapacity);
        this.form.setFieldValue('workloadAndCapacity', [
            ...workloadAndCapacityClone,
            { effectiveDate: null, unitPerPeriod: NaN, pricePerUnit: NaN },
        ]);
    }

    async onClickSaveButton() {
        projectPlanningModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        projectPlanningModule.setIsDisableSaveButton(false);
    }

    async onClickCancelButton() {
        projectPlanningModule.setSelectedResource(null);
        projectPlanningModule.setIsShowResourceDetailForm(false);
        this.form.resetForm({ values: { ...innitResource } });
    }

    get calendarOptions() {
        return calendarModule.calendarList.map((calendar) => ({
            label: calendar.name,
            value: calendar._id,
        }));
    }

    @Watch('selectedResource')
    resetForm() {
        this.form.resetForm({
            values: {
                name: this.selectedResource?.name || '',
                type: this.selectedResource?.type || '',
                unit: this.selectedResource?.unit || '',
                fileIds: this.selectedResource?.fileIds || [],
                description: this.selectedResource?.description || '',
                parentId: this.selectedResource?.parentId || '',
                calendar: this.selectedResource?.calendar || '',
                workloadAndCapacity: this.selectedResource?.workloadAndCapacity || [],
                assignToExistingResourceOption: this.assignToExistingResourceOption,
                sessionToken: webViewer3DModule.sessionToken || '',
            },
        });
    }

    @Watch('selectedResourceNodeId', { immediate: true })
    onChangeSelectedResourceNodeId(selectedResourceNodeId: string) {
        if (selectedResourceNodeId) {
            this.form.setFieldValue('parentId', selectedResourceNodeId);
        } else {
            this.form.setFieldValue('parentId', null);
        }
    }

    @Watch('assignToExistingResourceOption', { immediate: true })
    onChangeAssignToExistingResourceOption(
        assignToExistingResourceOption: AssignToExistingResourceOption,
    ) {
        if (assignToExistingResourceOption.length) {
            this.form.setFieldValue(
                'assignToExistingResourceOption',
                assignToExistingResourceOption,
            );
        }
    }
}
</script>
<style scoped>
:deep(.capacity-table .el-table__header-wrapper) {
    display: none !important;
}

label {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 27px;
}
</style>
