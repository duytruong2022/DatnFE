<template>
    <BaseRightDrawer
        @onClosed="onCloseImportForm"
        @onOpened="onOpenImportForm"
        v-model:value="isShowImportResourcePopup"
        customClass="project-form"
        size="100%"
    >
        <template #body>
            <div>
                <div v-if="step === 0">
                    <BaseRadio
                        :label="$t('planning.resource.import.option.label')"
                        v-model:value="type"
                        :options="importOptions"
                        :isHorizontal="false"
                        :isRequired="true"
                    />
                </div>
                <div v-else-if="step === 1">
                    <BaseTreeSelect
                        :tree="resourceTree"
                        :label="$t('planning.resource.import.resource.label')"
                        :placeholder="$t('planning.resource.import.resource.placeholder')"
                        v-model:value="editResourceId"
                    />
                </div>
                <div v-else-if="step === 2">
                    <BaseRadio
                        :label="$t('planning.resource.import.option.label')"
                        v-model:value="assignToExistingResourceOption"
                        :options="importExistingOptions"
                        :isHorizontal="false"
                        :isRequired="true"
                    />
                </div>
                <div v-else-if="step === 3">
                    <ResourceDetail
                        :assignToExistingResourceOption="assignToExistingResourceOption"
                        ref="resourceForm"
                        :hideActionButton="true"
                    />
                </div>
            </div>
            <div class="btn-upload d-flex justify-content-center">
                <el-button @click="onCloseImportForm" v-if="step === 0">
                    {{ $t('planning.resource.import.button.cancel') }}
                </el-button>
                <el-button @click="onClickPrev" v-if="step > 0">
                    {{ $t('planning.resource.import.button.prev') }}
                </el-button>
                <el-button type="primary" @click="onClickNext" v-if="step < 3">
                    {{ $t('planning.resource.import.button.next') }}
                </el-button>
                <el-button type="primary" @click="onClickSubmit" v-if="step === 3">
                    {{ $t('planning.resource.import.button.submit') }}
                </el-button>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { projectModule } from '@/features/project/store';
import { Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
import localStorageAuthService from '@/common/authStorage';
import { UtilMixins } from '@/mixins/utilMixins';
import { projectPlanningModule } from '@/features/4D-planning/store';
import {
    AssignToExistingResourceOption,
    ImportResourceOption,
    ResourceType,
} from '@/features/4D-planning/constants';
import ResourceDetail from '../ResourceDetail.vue';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import { webViewer3DService } from '@/features/3D-viewer/services/api.service';
import { calendarModule } from '@/features/calendar/store';
interface IResourceFormRef {
    onClickSaveButton: () => void;
}
@Options({
    components: {
        EditIcon,
        DeleteIcon,
        ResourceDetail,
    },
})
export default class ImportResourcePopup extends mixins(UtilMixins) {
    step = 0;
    type = ImportResourceOption.CREATE;
    editResourceId = '';
    assignToExistingResourceOption =
        AssignToExistingResourceOption.ASSIGN_TO_RESOURCE_BUILD_TREE;

    get importExistingOptions() {
        return Object.values(AssignToExistingResourceOption).map((option) => ({
            label: this.$t(
                `planning.resource.import.option.importToExistingResouce.${option}`,
            ),
            value: option,
        }));
    }

    get importOptions() {
        return Object.values(ImportResourceOption).map((option) => ({
            label: this.$t(`planning.resource.import.option.${option}`),
            value: option,
        }));
    }

    get resourceTree() {
        return projectPlanningModule.resourceTree;
    }

    get isShowImportResourcePopup() {
        return projectPlanningModule.isShowImportResourcePopup;
    }

    get planningPath() {
        return localStorageAuthService.getPlanningPermissions().path;
    }

    onClickPrev() {
        if (this.step > 0) {
            if (this.type === ImportResourceOption.CREATE && this.step === 3) {
                this.step = 0;
            } else {
                --this.step;
            }
        }
    }

    onClickNext() {
        this.getSelectedNodeIds();
        if (this.step === 0) {
            if (this.type === ImportResourceOption.SKIP) {
                projectPlanningModule.setIsShowImportResourcePopup(false);
                return;
            } else if (this.type === ImportResourceOption.UPDATE) {
                this.step = 1;
            } else {
                this.step = 3;
            }
        } else {
            if (this.step === 1) {
                projectPlanningModule.setSelectedResource({
                    _id: this.editResourceId,
                    name: '',
                    type: ResourceType.EQUIPMENT,
                    unit: '',
                    planningId: '',
                    fileIds: [],
                    projectId: '',
                    path: '',
                    calendar: '',
                    workloadAndCapacity: [],
                });
            }
            this.step = ++this.step % 4;
        }
    }

    onOpenImportForm() {
        calendarModule.getCalendarList(projectModule.selectedProjectId || '');
        projectPlanningModule.getResourceTree({
            planningId: projectPlanningModule.planning?._id || '',
            projectId: projectModule.selectedProjectId || '',
            path: this.planningPath || '',
        });
    }

    onClickSubmit() {
        (this.$refs.resourceForm as IResourceFormRef).onClickSaveButton();
    }

    onCloseImportForm() {
        projectPlanningModule.setIsShowImportResourcePopup(false);
    }

    getSelectedNodeIds() {
        webViewer3DService.getSelectedNodeIds(webViewer3DModule.sessionToken || '');
    }
}
</script>

<style scoped lang="scss">
.action-icon {
    height: 16px;
    width: 16px;
}
.task-count {
    text-align: center;
    width: 100%;
}
:deep(.custom-tree-node) {
    display: flex;
}
</style>
