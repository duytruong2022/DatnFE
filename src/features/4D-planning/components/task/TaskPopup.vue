<template>
    <el-dialog
        v-model="open"
        :title="$t(`planning.task.form.title`)"
        width="80%"
        @open="handleOpen"
        @closed="handleClosed"
        destroy-on-close
    >
        <TaskFormPopup
            ref="taskGeneral"
            @task-response="handleTaskResponse"
            @calculateNewFinishDate="calculateNewFinishDate"
            @calculateNewDuration="calculateNewDuration"
            :newFinishDate="newFinishDate"
            :newDuration="newDuration"
        />
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="onCancel">{{
                    $t('planning.folderForm.buttons.cancel')
                }}</el-button>
                <el-button type="primary" @click="onSubmit">{{
                    $t('planning.folderForm.buttons.submit')
                }}</el-button>
                <el-button type="danger" @click="onDelete" v-if="selectedTaskId">{{
                    $t('planning.folderForm.buttons.delete')
                }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { showErrorNotificationFunction } from '@/common/helpers';
import { calendarModule } from '@/features/calendar/store';
import { projectModule } from '@/features/project/store';
import { ElLoading } from 'element-plus';
import { mixins, Options, setup } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { useTaskForm } from '../../compositions/taskForm';
import { LinkDependency, TaskPopupTab } from '../../constants';
import { IProjectTask } from '../../interfaces';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';
import AssignedResourceToTaskTable from './AssignedResourceToTaskTable.vue';
import AssignedResourceGroupToTaskTable from './AssignResourceGroupToTaskTable.vue';
import TaskFormPopup from './TaskFormPopup.vue';

@Options({
    components: {
        TaskFormPopup,
        AssignedResourceToTaskTable,
        AssignedResourceGroupToTaskTable,
    },
})
export default class TaskPopup extends mixins(Planning4DMixin) {
    @Prop({ default: '' }) newFinishDate!: string | Date | null;
    @Prop({ default: '' }) newDuration!: number;
    LinkDependency = LinkDependency;
    form = setup(() => useTaskForm());
    taskDetail: null | IProjectTask = null;
    taskPopupTab = TaskPopupTab;
    currentTab = TaskPopupTab.UPDATE_TASK;

    get open(): boolean {
        return projectPlanningModule.taskPopupParams.show;
    }

    get selectedTaskId(): string {
        return projectPlanningModule.taskPopupParams.selectedTaskId as string;
    }

    async handleOpen() {
        const selectedTask = projectPlanningModule.taskPopupParams.selectedTask;
        // editing mode
        const calendarResponse = await calendarModule.getCalendarList(
            projectModule.selectedProjectId || '',
        );
        if (!calendarResponse.success) {
            showErrorNotificationFunction(calendarResponse.message);
        }
        if (selectedTask?._id) {
            const loading = ElLoading.service({ target: '.el-dialog' });
            const taskResponse = await projectPlanningService.getTask(selectedTask?._id);
            loading.close();
            if (taskResponse.success) {
                this.taskDetail = taskResponse.data;
                (this.$refs.taskGeneral as TaskFormPopup).handleOpen(taskResponse.data);
            } else if (!taskResponse?.isRequestError) {
                showErrorNotificationFunction(taskResponse.message);
            }
        }
    }

    handleClosed(): void {
        this.currentTab = TaskPopupTab.UPDATE_TASK;
        projectPlanningModule.setTaskPopupParams({
            selectedTask: null,
            show: false,
            selectedTaskId: null,
        });
    }

    onCancel(): void {
        this.handleClosed();
    }

    async fetchTaskDetail() {
        const taskResponse = await projectPlanningService.getTask(
            this.taskDetail?._id || '',
        );
        if (taskResponse.success) {
            this.taskDetail = taskResponse.data;
        }
    }

    async onSubmit(): Promise<void> {
        (this.$refs.taskGeneral as TaskFormPopup).onSubmit();
    }

    handleTaskResponse(data: { oldGanttId?: string; task: IProjectTask | undefined }) {
        this.$emit('task-response', {
            oldGanttId: data.oldGanttId,
            task: data.task,
        });
    }

    calculateNewFinishDate(
        ganttId: string,
        duration: number,
        startDate: string,
        currentFinish: string,
        calendarId: string,
    ) {
        this.$emit(
            'calculateNewFinishDate',
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
        this.$emit('calculateNewDuration', ganttId, startDate, endDate, calendarId);
    }

    onDelete(): void {
        if (projectPlanningModule.taskPopupParams.selectedTask?._id)
            this.$emit('on-delete');
    }

    @Watch('form.calendarId', { deep: true })
    onCalendarId(calendarId: string) {
        (this.$refs.taskGeneral as TaskFormPopup).onCalendarId(calendarId);
    }
}
</script>
