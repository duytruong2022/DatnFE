<template>
    <div>
        <div class="btn-wrapper">
            <div class="head-btn-group">
                <!-- <el-button
                    @click="handleClickUserField"
                    type="primary"
                    v-if="canReadUserField"
                    >{{ $t('planning.buttons.userField') }}</el-button
                > -->
            </div>
        </div>
        <div class="chart-header">
            <div class="display-flex">
                <SearchBox @search="handleSearch" />
                <el-button
                    class="grid-button"
                    style="margin-left: 10px"
                    @click="onGridSetting"
                    type="primary"
                    >{{ $t('planning.buttons.gridSettings') }}</el-button
                >
            </div>
            <div class="action-buttons">
                <!-- <el-tooltip :content="$t('planning.buttons.rescheduling')">
                    <el-button @click="onReschedulingGantt">
                        <RefreshIcon class="icon" />
                    </el-button>
                </el-tooltip>
                <el-tooltip :content="$t('planning.buttons.planningSettings')">
                    <el-button @click="onUpdatePlanning">
                        <SettingIcon class="icon" />
                    </el-button>
                </el-tooltip> -->
                <el-tooltip :content="$t('planning.buttons.zoomIn')">
                    <el-button @click="zoomIn">
                        <ZoomInIcon class="icon" />
                    </el-button>
                </el-tooltip>
                <el-tooltip :content="$t('planning.buttons.zoomOut')">
                    <el-button @click="zoomOut">
                        <ZoomOutIcon class="icon" />
                    </el-button>
                </el-tooltip>
            </div>
        </div>
        <div
            style="height: calc(100vh - 160px)"
            id="gantt-chart-4d-planning"
            class="chart-wrapper"
            :class="configurationStyle"
        ></div>
        <TaskPopup
            @task-response="handleTaskResponse"
            @on-delete="handleDelete"
            @calculateNewFinishDate="calculateNewFinishDate"
            @calculateNewDuration="calculateNewDuration"
            :newFinishDate="newFinishDate"
            :newDuration="newDuration"
        />
        <GridViewSettingsPopup @save="saveSettings" />
        <TaskFieldPopup @deleted-field="handleFieldDeleted" />

        <!-- <PlanningForm @updated-planning="handleUpdatedPlanning" /> -->
        <RenameTaskFormPopup @updateTask="updateOneTask" />
    </div>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { projectPlanningModule } from '@/features/4D-planning/store';
import { Watch } from 'vue-property-decorator';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import TaskFieldPopup from '../components/additional-task-field/TaskFieldPopup.vue';
import TaskPopup from '../components/task/TaskPopup.vue';
import GanttContextMenu from '@/features/4D-planning/components/context-menu/GanttContextMenu.vue';
import LinkPopup from '../components/link/LinkPopup.vue';
import RenameTaskFormPopup from '../components/task/RenameTaskFormPopup.vue';
import { useGantt } from '../compositions/useGantt';
import {
    IDelegateResponse,
    IGanttGridDisplayingStatus,
    IPlanning,
    IProjectTask,
    ISearchTask,
    ITaskLink,
} from '../interfaces';
import {
    convertToGanttTask,
    getVisibleColumnConfiguration,
    getBaselineTask,
} from '../helper';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { ElLoading } from 'element-plus';
import { projectPlanningService } from '../services/planning.service';
import { useRoute } from 'vue-router';
import GridViewSettingsPopup from '../components/GridViewSettingsPopup.vue';
import ganttChartStorage from '@/common/ganttChartStorage';
import { Gantt, GanttStatic } from 'dhtmlx-gantt';
import i18n from '@/plugins/vue-i18n';
import SearchBox from '../components/SearchBox.vue';
import { DATE_TIME_FORMAT, PageName } from '@/common/constants';
import moment from 'moment';
import {
    DelegateOptions,
    GanttColumn,
    GanttZoomLevel,
    SearchTaskOption,
    TaskType,
} from '../constants';
import PlanningForm from '../components/PlanningForm.vue';
import {
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    Refresh as RefreshIcon,
    Setting as SettingIcon,
} from '@element-plus/icons-vue';
import { Planning4DMixin } from '../mixins/mixin';
import { IFile } from '@/common/interfaces';
import localStorageAuthService from '@/common/authStorage';
import { projectModule } from '@/features/project/store';
import router from '@/plugins/vue-router';
import { commonModule } from '@/features/common/common.store';
import LinkDetailFormPopup from '../components/link/LinkDetailFormPopup.vue';

@Options({
    components: {
        TaskFieldPopup,
        TaskPopup,
        GridViewSettingsPopup,
        PlanningForm,
        SearchBox,
        GanttContextMenu,
        LinkPopup,
        ZoomInIcon,
        ZoomOutIcon,
        RefreshIcon,
        SettingIcon,
        LinkDetailFormPopup,
        RenameTaskFormPopup,
    },
})
export default class Planning4DPage extends mixins(Planning4DMixin) {
    disableGroupBtn = false;
    markerId: string | null = null;
    ganttInstance: GanttStatic | null = null;
    gantt = setup(() => {
        this.ganttInstance = Gantt.getGanttInstance();
        return useGantt(this.ganttInstance as GanttStatic);
    });
    route = useRoute();
    zoomLevel = 0;
    isShow3DIn4DPage = true;
    newFinishDate: Date | null = null;
    newDuration = 0;

    get planning(): IPlanning | null {
        return projectPlanningModule.planning;
    }

    get configurationStyle() {
        return {
            'hidden-baseline': !projectPlanningModule.baselineConfiguration.display,
            'top-baseline':
                projectPlanningModule.baselineConfiguration.position === 'top',
            'bottom-baseline':
                projectPlanningModule.baselineConfiguration.position === 'bottom',
            'disabled-add-button': projectPlanningModule.isDisableButtonAdd,
        };
    }

    get sessionToken() {
        return webViewer3DModule.sessionToken;
    }

    get atLeastOneParentTaskIsSelected(): boolean {
        const allTasks = projectPlanningModule.planning?.tasks;
        const mapIdToTask = new Map<string, IProjectTask>();
        allTasks?.forEach((task) => mapIdToTask.set(task._id, task));
        return projectPlanningModule.selectedTaskIdList.some((id) => {
            const task = mapIdToTask.get(id);
            if (!task) {
                return false;
            }
            return task.taskType === TaskType.WBS_SUMMARY;
        });
    }

    get selectedTaskIds() {
        return projectPlanningModule.selectedTaskIdList;
    }

    get needReload3DViewer() {
        return projectPlanningModule.needReload3DViewer;
    }

    get isDisableBottomUp() {
        // check planning is has children planning

        if (projectPlanningModule.planning?.forceEnableBottomup) {
            return false;
        }
        if (projectPlanningModule.planning?.isSynthesized) {
            return !this.editedTaskIds.length;
        } else {
            return projectPlanningModule.planning?.clonedFromPlanningIds?.length === 0;
        }
    }

    get shouldEnableTopdown() {
        // check planning is has children planning
        return (
            projectPlanningModule.planning?.forceEnableTopdown ||
            (projectPlanningModule.planning?.isSynthesized &&
                this.editedTaskIds.length) ||
            projectPlanningModule.planning?.tasks?.some((task) => {
                return task.delegatedTo;
            })
        );
    }

    get createdLink() {
        return projectPlanningModule.createdLink;
    }

    get editedTaskIds() {
        return projectPlanningModule.editedTaskIds;
    }

    get selectedTasksIncludeMilestone() {
        const selectedTaskIds = this.selectedTaskIds;
        const milestoneCheck = new Map<string, TaskType>();
        projectPlanningModule.planning?.tasks.map((task) => {
            if (
                [TaskType.START_MILESTONE, TaskType.FINISH_MILESTONE].includes(
                    task.taskType,
                )
            ) {
                milestoneCheck.set(task._id, task.taskType);
            }
        });
        return selectedTaskIds.some((id) => milestoneCheck.has(id));
    }

    async created() {
        projectPlanningModule.setCreatedLink(false);
        this.gantt.searchValue = '';
        this.gantt.searchType = SearchTaskOption.APPROPRIATE;
        this.gantt.searchColumn = GanttColumn.NAME;
    }

    getFileName(name: string) {
        const nameSplited = name.split('.');
        return nameSplited.slice(0, nameSplited.length - 1).join('.');
    }

    mounted() {
        let recaptchaScript = document.createElement('script');
        recaptchaScript.setAttribute(
            'src',
            'https://export.dhtmlx.com/gantt/api.js?v=20180322',
        );
        document.head.appendChild(recaptchaScript);
        const displaySettings = ganttChartStorage.getGanttDisplayingStatus();
        if (displaySettings) {
            projectPlanningModule.setGridSettingsParams({
                displayingStatus: displaySettings,
            });
        }

        const additionalFieldDisplayingIds =
            ganttChartStorage.getAdditionalTaskFields() || [];

        this.$nextTick(async () => {
            (this.ganttInstance as GanttStatic).config.columns =
                getVisibleColumnConfiguration(
                    this.ganttInstance as GanttStatic,
                    projectPlanningModule.gridSettingParams.displayingStatus,
                    (projectPlanningModule.planning?.additionalTaskFields || []).filter(
                        (field) => additionalFieldDisplayingIds.includes(field._id),
                    ),
                    this.$t,
                    this.gantt.durationFormatter,
                );
            if (!projectPlanningModule.planningId) {
                projectPlanningModule.setPlanningId(
                    (this.$router.currentRoute as any)?.value?.query?.name,
                );
            }
            console.log(
                'projectPlanningModule.planningId',
                projectPlanningModule.planningId,
            );

            await this.gantt.initChart(true);
            this.registerOnClickRename();
        });
    }

    updated() {
        this.registerOnClickRename();
    }

    beforeUnmount() {
        const editNameButtons = document.getElementsByClassName('rename-task-button');
        for (var i = 0; i < editNameButtons.length; i++) {
            editNameButtons[i].removeEventListener(
                'click',
                this.showEditNamePopup,
                false,
            );
        }
        projectPlanningModule.setPlanning(null);
        projectPlanningModule.resetStore();
        this.ganttInstance?.destructor();
        this.ganttInstance = null;
    }

    unmounted() {
        commonModule.setCustomBreadcrumb(null);
        webViewer3DModule.setOpenFileId(null);
    }

    registerOnClickRename() {
        const editNameButtons = document.getElementsByClassName('rename-task-button');
        for (var i = 0; i < editNameButtons.length; i++) {
            editNameButtons[i].addEventListener('click', this.showEditNamePopup, false);
        }
    }

    showEditNamePopup(e: any) {
        const taskId = e.target.getAttribute('task-id');
        if (!taskId?.length) {
            return;
        }
        projectPlanningModule.setSelectedTaskId(taskId);
        projectPlanningModule.setIsShowRenameTaskFormPopup(true);
    }

    onDelegate() {
        projectPlanningModule.setDelegatePopupParam({
            show: true,
            tabSelected: DelegateOptions.NEW_PLANNING,
        });
    }

    onChangeSettingBaseline() {
        this.gantt.changeTaskLayer();
        this.ganttInstance?.render();
    }

    async onResetBaseline() {
        await this.gantt.fetchData();
        this.ganttInstance?.render();
    }

    async handleTaskResponse(data: {
        oldGanttId?: string;
        task: IProjectTask | undefined;
    }) {
        await this.gantt.initChart(true);
    }

    async handleDelete(): Promise<void> {
        const taskId = projectPlanningModule.taskPopupParams.selectedTask?._id;
        if (!taskId) return;
        const confirm = await showConfirmPopUpFunction(
            this.$t('planning.task.messages.confirmDelete', {
                name: projectPlanningModule.taskPopupParams.selectedTask?.name,
            }),
            this.$t('planning.task.messages.titleConfirmDelete'),
        );
        if (confirm === 'confirm') {
            const loading = ElLoading.service({});
            const response = await projectPlanningService.deleteTask(
                projectPlanningModule.taskPopupParams.selectedTask?._id as string,
            );
            if (response.success) {
                // delete coresponding task in task store
                const ganttIdTaskDeleted: string[] = [];
                const currentTasks = (projectPlanningModule.planning?.tasks || []).filter(
                    (task) => {
                        if (response.data._ids.includes(task._id)) {
                            ganttIdTaskDeleted.push(task.ganttId);
                            return false;
                        }
                        return true;
                    },
                );
                projectPlanningModule.setPlanning({
                    ...(projectPlanningModule.planning as IPlanning),
                    tasks: currentTasks,
                });
                // delete task in UI
                this.$nextTick(() => {
                    ganttIdTaskDeleted.forEach((id) => {
                        this.ganttInstance?.deleteTask(id);
                    });
                });
                showSuccessNotificationFunction(
                    this.$t('planning.task.messages.deleted'),
                );
                projectPlanningModule.setTaskPopupParams({
                    show: false,
                    selectedTask: null,
                    parentOfSelectedTask: null,
                });
                projectPlanningModule.setNeedReload3DViewer(true);
            } else if (!response.isRequestError) {
                showErrorNotificationFunction(response.message);
            }
            loading.close();
        }
    }

    onOpenResource() {
        projectPlanningModule.setIsShowResourcePopup(true);
    }

    onOpenResourceGroup() {
        projectPlanningModule.setIsShowResourceGroupPopup(true);
    }

    async onClickTopDown() {
        if (projectPlanningModule.planning?.forceEnableTopdown) {
            const confirm = await showConfirmPopUpFunction(
                this.$t('planning.topDown.confirm.message'),
                this.$t('planning.topDown.confirm.title'),
            );
            if (!confirm) {
                return;
            }
        }
        projectPlanningModule.setIsShowTopDownFormPopup(true);
    }

    async onClickBottomUp() {
        if (projectPlanningModule.planning?.forceEnableBottomup) {
            const confirm = await showConfirmPopUpFunction(
                this.$t('planning.bottomUp.confirm.message'),
                this.$t('planning.bottomUp.confirm.title'),
            );
            if (!confirm) {
                return;
            }
        }
        projectPlanningModule.setIsShowBottomUpFormPopup(true);
    }

    onTopDown(planningIds: string[]) {
        this.gantt.onClickTopDown(planningIds);
    }

    /**
     * update milestone IM in delegation.
     * @param tasks task has modify in delegation
     */
    async onUpdateDelegation(tasks: IProjectTask[]) {
        const loading = ElLoading.service();
        const tasksFormatDate = tasks.map((task) => {
            const taskInOriginal = projectPlanningModule.planning?.tasks?.find((item) => {
                return item.delegatedTo === task._id;
            });
            return {
                _id: task._id,
                name: task.name,
                ganttId: task.ganttId,
                planningId: task.planningId,
                startModified: moment(taskInOriginal?.start)
                    .utc()
                    .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                finishModified: moment(taskInOriginal?.finish)
                    .utc()
                    .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            };
        });
        const response = await projectPlanningService.updateDelegation(
            tasksFormatDate,
            projectPlanningModule.planningId,
            projectModule.selectedProjectId || '',
            localStorageAuthService.getPlanningPermissions().path || '',
        );
        loading.close();
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            projectPlanningModule.setIsShowTopDownFormPopup(false);
            showSuccessNotificationFunction(
                this.$t('planning.topDown.message.updateDelegationSuccess'),
            );
        }
    }

    onBottomUp(planningIds: string[]) {
        this.gantt.onClickBottomUp(planningIds);
    }

    onUpdateMilestone(planningId: string) {
        this.gantt.onClickUpdateMilestone(planningId);
    }

    onGridSetting() {
        projectPlanningModule.setGridSettingsParams({
            open: true,
        });
    }

    handleFieldDeleted(fieldId: string) {
        this.saveSettings({
            displayingStatus: projectPlanningModule.gridSettingParams.displayingStatus,
            additionalFieldIds: (
                ganttChartStorage.getAdditionalTaskFields() || []
            ).filter((id) => id !== fieldId),
        });
    }

    handleUpdatedPlanning(data: { needRerenderGantt: boolean; newName: string }) {
        if (data.newName) {
            let name = this.route.query?.name as string;
            const planningFilePath = this.route.query?.planningFilePath as string;
            if (data.newName) {
                name = data.newName;
                router.replace({
                    name: PageName.PLANNING_4D_PAGE,
                    query: {
                        name,
                        planningFilePath,
                    },
                });
            }
        }
        if (data.needRerenderGantt) {
            this.reloadChart();
        }
    }

    saveSettings(data: {
        displayingStatus: IGanttGridDisplayingStatus;
        additionalFieldIds: string[];
    }) {
        projectPlanningModule.setGridSettingsParams({
            displayingStatus: data.displayingStatus,
            open: false,
        });
        const additionalTaskFieldsDisplaying = (
            projectPlanningModule.planning?.additionalTaskFields || []
        ).filter((field) => data.additionalFieldIds.includes(field._id));
        (this.ganttInstance as GanttStatic).config.columns =
            getVisibleColumnConfiguration(
                this.ganttInstance as GanttStatic,
                data.displayingStatus,
                additionalTaskFieldsDisplaying,
                this.$t,
                this.gantt.durationFormatter,
            );
        this.ganttInstance?.render();
        ganttChartStorage.setAdditionalTaskFields(data.additionalFieldIds);
    }

    onSynthesis() {
        projectPlanningModule.setIsShowSynthesisPopup(true);
    }

    createBaseLine() {
        projectPlanningModule.setIsShowBaselinePopup(true);
    }

    handleDelegated(data: IDelegateResponse) {
        // after call api to delegate task success, we must force repaint task
        this.gantt.handleAfterDelegateTask(data);

        projectPlanningModule.setSelectedTaskIdList([]);
    }

    handleCancelDelegation(updatedTaskId: string, deletedMilestoneIds: string[]) {
        const taskNeedUpdate = this.ganttInstance?.getTask(updatedTaskId);
        taskNeedUpdate.delegatedTo = null;
        this.gantt.initGanttTemplates();
        this.ganttInstance?.refreshTask(updatedTaskId);
        this.ganttInstance?.unselectTask();
        deletedMilestoneIds.forEach((id) => this.ganttInstance?.deleteTask(id));
    }

    onAssignResource() {
        if (!projectPlanningModule.selectedTaskIdList?.length) {
            showErrorNotificationFunction(
                this.$t('planning.assignResource.message.errorSelectTaskIdsEmpty'),
            );
        } else {
            projectPlanningModule.setIsShowAssignResourceForm(true);
        }
    }

    onAssignResourceGroup() {
        if (!projectPlanningModule.selectedTaskIdList?.length) {
            showErrorNotificationFunction(
                this.$t('planning.assignResource.message.errorSelectTaskIdsEmpty'),
            );
        } else {
            projectPlanningModule.setIsShowAssignResourceGroupForm(true);
        }
    }

    async assignResourceSuccess() {
        if (!projectPlanningModule.hasTaskDeleted) {
            this.ganttInstance?.batchUpdate(() => {
                projectPlanningModule.updatedTasks.forEach((updatedTask) => {
                    const task = this.ganttInstance?.getTaskBy('_id', updatedTask._id)[0];
                    task.resourceIds = updatedTask.resourceIds;
                    task.resourceGroupIds = updatedTask.resourceGroupIds;
                    this.ganttInstance?.updateTask(task.id, task);
                });
            });
        } else {
            this.gantt.initChart(true);
            projectPlanningModule.setHasTaskDeleted(false);
        }
    }

    onOpenActivityCode() {
        projectPlanningModule.setActivityCodePopupParam({
            show: true,
            isCreate: false,
            activityCodeIdSelected: '',
            activityCodeValueSelected: '',
        });
    }

    onOpenAssignActivityCode() {
        if (!projectPlanningModule.selectedTaskIdList?.length) {
            showErrorNotificationFunction(
                i18n.global.t(
                    'planning.activityCode.message.errorSelectTaskIdsEmpty',
                ) as string,
            );
        } else {
            projectPlanningModule.setIsShowAssignActivityCodePopup(true);
        }
    }

    async refetchDataGantt() {
        await this.gantt.fetchData();
        this.ganttInstance?.render();
    }

    async onChangeActivityCodeDisplay() {
        await this.gantt.fetchData();
        this.ganttInstance?.render();
    }

    async reloadChart() {
        await this.gantt.initChart(true);
    }

    handleClickUserField() {
        projectPlanningModule.setTaskFieldParams({
            open: true,
        });
    }

    onOpenAppearanceProfile() {
        projectPlanningModule.setIsShowAppearanceProfilePopup(true);
    }

    handleSearch(data: ISearchTask) {
        this.gantt.searchValue = data.searchValue.trim();
        this.gantt.searchType = data.searchType;
        this.gantt.searchColumn = data.searchColumn;
        this.ganttInstance?.render();
    }

    onUpdatePlanning() {
        projectPlanningModule.setIsShowPlanningPopup(true);
    }

    zoomIn() {
        if (this.zoomLevel > 0) {
            this.zoomLevel--;
        }
        this.ganttInstance?.ext.zoom.setLevel(GanttZoomLevel[this.zoomLevel]);
    }

    zoomOut() {
        if (this.zoomLevel < GanttZoomLevel.length - 1) {
            this.zoomLevel++;
        }
        this.ganttInstance?.ext.zoom.setLevel(GanttZoomLevel[this.zoomLevel]);
    }

    onImportXml() {
        projectPlanningModule.setIsShowXmlFileForm(true);
    }

    importP6File(file: IFile, mapImportTaskIdToGanttId: Map<string, string>) {
        if (
            this.planning?.delegatedFromPlanningId &&
            projectPlanningModule.selectedTaskIdList?.length !== 1 &&
            this.planning?.p6Id !== projectPlanningModule.importProject?.p6Id
        ) {
            showErrorNotificationFunction(
                i18n.global.t('planning.importXML.noSatisfyingOption'),
            );
        } else {
            this.gantt.importP6File(file, mapImportTaskIdToGanttId);
        }
        projectPlanningModule.setIsShowXmlFileForm(false);
    }

    onReschedulingGantt() {
        this.gantt.reschedulingGantt();
    }

    onExportToPrimaveraP6() {
        projectPlanningModule.setIsShowExportPlanningPopup(true);
    }

    onClickSaveAs() {
        if (webViewer3DModule?.openFileId) {
            projectPlanningModule.setIsShowSaveAsPopup(true);
        } else {
            showErrorNotificationFunction(
                this.$t('planning.saveAsForm.errors.notFoundResource'),
            );
        }
    }

    handleAddNewLinks(taskLinks: ITaskLink[]) {
        this.gantt.bulkAddLinks(taskLinks);
    }

    async handleDeleteLink(linkId: string) {
        await this.gantt.deleteLink(linkId);
    }

    handleUpdatedLink(link: ITaskLink) {
        this.gantt.updatedLink(link);
    }

    calculateNewFinishDate(
        ganttId: string,
        duration: number,
        startDate: string,
        currentFinish: string,
        calendarId: string,
    ) {
        this.newFinishDate = this.gantt.calculateFinish(
            ganttId,
            duration,
            startDate,
            currentFinish,
            calendarId,
        );
    }

    calculateNewDuration(
        ganttId: string,
        startDate: string,
        endDate: string,
        calendarId: string,
    ) {
        this.newDuration = this.gantt.calculateDuration(
            ganttId,
            startDate,
            endDate,
            calendarId,
        );
    }

    updateOneTask(taskData: IProjectTask) {
        this.gantt.updateOneTask(taskData);
    }

    @Watch('planning')
    onChangePlanning(planning: IPlanning) {
        if (planning?._id) {
            commonModule.setCustomBreadcrumb(planning.name);
        }
    }

    @Watch('needReload3DViewer')
    async reload3DViewer() {
        if (this.needReload3DViewer) {
            if (webViewer3DModule.sessionToken) {
                const focusTime = await moment(
                    this.ganttInstance?.getMarker(
                        this.gantt.currentMarkerFocusTimeId || '',
                    )?.start_date || '',
                ).format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON);
                const response = await projectPlanningService.setFileByFocusTime({
                    focusTime: focusTime,
                    sessionToken: webViewer3DModule.sessionToken as string,
                    planningId: this.planning?._id || '',
                    projectId: projectModule.selectedProjectId || '',
                    path: localStorageAuthService.getPlanningPermissions().path || '',
                });
                if (!response.success) {
                    showErrorNotificationFunction(response.message);
                }
            }
            projectPlanningModule.setNeedReload3DViewer(false);
        }
    }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
@import '~dhtmlx-gantt/codebase/dhtmlxgantt.css';
.btn-wrapper {
    margin: 20px 0;
    display: flex;
    overflow-x: auto;
    justify-content: center;
}

.head-btn-group {
    display: flex;
    overflow-x: auto;
}

.filter_line {
    background-color: #0ca30a;
}

:deep(.delegated_task) {
    background-color: #ebebeb !important;
}

.readonly-task-type {
    margin-top: 3px !important;
}

// css for base line style
.bottom-baseline
    :deep(.gantt_task_line.gantt_bar_standard, .gantt_line_wrapper.gantt_bar_standard),
.bottom-baseline
    :deep(.gantt_task_line.gantt_project, .gantt_line_wrapper.gantt_project) {
    margin-top: -9px;
}

.bottom-baseline :deep(.gantt_side_content.gantt_bar_standard),
.bottom-baseline :deep(.gantt_side_content.gantt_project) {
    margin-bottom: 7px;
}
.bottom-baseline :deep(.gantt_task_link .gantt_link_arrow.gantt_bar_standard),
.bottom-baseline :deep(.gantt_task_link .gantt_link_arrow.gantt_project) {
    margin-top: -12px;
}
.bottom-baseline :deep(.gantt_side_content.gantt_right.gantt_bar_standard),
.bottom-baseline :deep(.gantt_side_content.gantt_right.gantt_project) {
    bottom: 0;
}

.top-baseline
    :deep(.gantt_task_line.gantt_bar_standard, .gantt_line_wrapper.gantt_bar_standard),
.top-baseline :deep(.gantt_task_line.gantt_project, .gantt_line_wrapper.gantt_project) {
    margin-top: 7px;
}

.top-baseline :deep(.gantt_side_content.gantt_bar_standard),
.top-baseline :deep(.gantt_side_content.gantt_project) {
    margin-bottom: 7px;
}
.top-baseline :deep(.gantt_task_link .gantt_link_arrow.gantt_bar_standard),
.top-baseline :deep(.gantt_task_link .gantt_link_arrow.gantt_project) {
    margin-top: 4px;
}
.top-baseline :deep(.gantt_side_content.gantt_right.gantt_bar_standard),
.top-baseline :deep(.gantt_side_content.gantt_right.gantt_project) {
    bottom: 0;
}

:deep(.gantt-task-baseline) {
    position: absolute;
    border-radius: 2px;
    opacity: 0.6;
    margin-top: -35px;
    border: 1px solid rgb(30, 30, 30);
}
.hidden-baseline :deep(.gantt-task-baseline) {
    display: none;
}
.synthesis-btn {
    margin: 0 12px 0 12px !important;
}
:deep(.status_line) {
    cursor: pointer;
}

:deep(.gantt_add) {
    display: none;
}
.icon {
    width: 16px;
}
.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .action-buttons {
        margin-right: 20px;
    }
}
.viewer-3d-container {
    resize: vertical;
    overflow: auto;
    border-bottom: 2px solid #344767;
    position: relative;

    .hint {
        position: absolute;
        top: 0;
        right: 0;
    }
}

// style for add button
:deep(.gantt_grid_head_add) {
    position: sticky;
    background-color: $--color-white;
    width: 44px !important;
    opacity: 1;
    top: 0;
    right: 0;
    z-index: 2;

    &:hover {
        background-color: $--color-gray-200;
    }
}

.disabled-add-button :deep(.gantt_grid_head_add) {
    opacity: 0.4;
    cursor: not-allowed;
}

:deep(.data_date_line) {
    background-color: #0ca30a;
}
.tooltip-container {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    padding-right: 18px;
}
.custom-tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black;
}

.custom-tooltip .tooltiptext {
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    top: -15px;
    right: 110%;
    font-size: 13px;
}

.custom-tooltip .tooltiptext::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 100%;
    margin-top: -10px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent transparent black;
}
.custom-tooltip:hover .tooltiptext {
    visibility: visible;
}
.wrapper-absolute {
    position: absolute;
    top: 0;
    right: 0;
}
:deep(#map-wrapper > div) {
    width: 30%;
    left: 70% !important;
}

:deep(.task-name-container) {
    display: flex;
    gap: 5px;
    cursor: pointer;
    height: 100%;
    align-items: center;
    .rename-task-button {
        width: 24px;
    }
}
.display-flex {
    display: flex;
    .grid-button {
        margin-top: 5px;
    }
}
</style>
