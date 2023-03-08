<template>
    <div class="content-wrapper filter-wrapper">
        <FilterForm />
    </div>
    <div class="content-wrapper">
        <BaseTableLayout
            :data="planningList"
            :totalItems="planningList.length"
            :isHighlightCurrentRow="true"
            :isShowPagination="false"
        >
            <template #table-columns>
                <el-table-column
                    :label="$t('planning.table.columns.name')"
                    width="250"
                    align="left"
                >
                    <template #default="scope">
                        <el-icon><DocumentChecked /></el-icon> {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('planning.table.columns.updatedAt')"
                    align="center"
                >
                    <template #default="scope">
                        {{ updatedAt(scope.row.updatedAt) }}
                    </template>
                </el-table-column>
                <el-table-column align="center">
                    <template #default="scope">
                        <el-tooltip
                            effect="dark"
                            :content="$t('group.groupList.tooltip.edit')"
                            placement="top"
                        >
                            <el-icon
                                class="view-icon"
                                @click="onClickButtonEdit(scope.row)"
                            >
                                <EditIcon class="action-icon" />
                            </el-icon>
                        </el-tooltip>
                        <el-tooltip
                            placement="top"
                            :content="$t('abs.table.action.view')"
                            v-if="canReadWBS(scope.row)"
                        >
                            <el-icon class="view-icon" @click="onClickView(scope.row)"
                                ><ViewIcon
                            /></el-icon>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
    <PlanningForm />
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options } from 'vue-class-component';
import { IPlanning } from '../interfaces';
import { projectPlanningModule } from '../store';
import {
    DocumentChecked,
    Setting as SettingIcon,
    View as ViewIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
} from '@element-plus/icons-vue';
import { ElLoading } from 'element-plus';
import { projectModule } from '@/features/project/store';
import { PlanningOrderBy } from '../constants';
import moment from 'moment';
import { absModule } from '@/features/abs/store';
import localStorageAuthService from '@/common/authStorage';
import { getPbsGroupPermissionsForFile } from '@/common/helpers';
import { IFTPFile } from '@/common/interfaces';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import FilterForm from '../components/FilterForm.vue';
import PlanningForm from '../components/PlanningForm.vue';

@Options({
    components: {
        DocumentChecked,
        SettingIcon,
        ViewIcon,
        EditIcon,
        RefreshIcon,
        FilterForm,
        PlanningForm,
    },
})
export default class Planning4DAnalyzerPage extends mixins(UtilMixins) {
    mounted() {
        this.fetchData();
    }

    get pbsGroupPermissions() {
        return localStorageAuthService.getPbsGroupPermissions();
    }

    get projectFolderAssignPbs() {
        return absModule.projectFolderAssignPbs;
    }

    get planningList(): IPlanning[] {
        return projectPlanningModule.planningList;
    }

    get selectedPlannings(): IPlanning[] {
        return projectPlanningModule.selectedPlannings;
    }

    canReadWBS(planning: IPlanning): boolean {
        return getPbsGroupPermissionsForFile(
            this.projectFolderAssignPbs,
            this.planningList.map((planning) => ({
                ...planning,
                _id: planning.fileId || '',
            })) as unknown as IFTPFile[],
            this.pbsGroupPermissions,
            planning.fileId || '',
        )?.includes(ProjectSecurityPermissions['4DPLANNING_READ_WBS_STRUCTURE']);
    }

    async fetchData() {
        const loading = ElLoading.service({});
        await projectPlanningModule.getPlanningList({
            projectId: projectModule.selectedProjectId as string,
            query: {
                orderBy: PlanningOrderBy.CREATED_AT,
            },
        });
        loading.close();
    }

    onClickView(planning: IPlanning) {
        projectPlanningModule.setPlanningId(planning._id);
        this.$router.push({
            path: '/project/4d-planning',
            query: {
                planningFilePath: planning.planningFilePath,
                name: planning._id,
            },
        });
    }

    onClickButtonEdit(planning: IPlanning) {
        projectPlanningModule.setPlanning(planning);
        projectPlanningModule.setIsShowPlanningPopup(true);
    }

    updatedAt(date: Date): string {
        return moment(date).fmDHTMLXString();
    }
}
</script>

<style lang="scss" scoped>
.content-wrapper {
    margin: 20px 25px;
    padding: 30px 25px;
    background-color: white;
    border-radius: 15px;
}

.filter-wrapper {
    margin-top: 0;
}
.icon {
    width: 18px;
}

:deep(.view-icon) {
    margin-right: 0px !important;
    margin-right: 20px !important;
    cursor: pointer;
}
.action-icon {
    height: 1em;
    width: 1em;
}
</style>
