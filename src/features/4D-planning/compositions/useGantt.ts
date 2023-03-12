import { GanttStatic } from 'dhtmlx-gantt';
import { ElLoading, UploadFile, UploadFiles } from 'element-plus';
import moment from 'moment';
import { useI18n } from 'vue-i18n';
import {
    convertImportXmlLinks,
    convertImportXmlResources,
    convertImportXmlTasks,
    convertLinkType,
    convertResourceTypes,
    DefaultDurationTask,
    DefaultNameTask,
    defaultWorkTimeBlocks,
    GanttColumn,
    LinkFieldName,
    LinkType,
    MilestoneType,
    ResourceFieldName,
    ResourceType,
    SearchTaskOption,
    TaskDuration,
    TaskPercentageCompletion,
    TaskPhysicalQuantityUnit,
    TaskStatus,
    TaskType,
    XML_TYPE,
} from '../constants';
import { ref, computed } from 'vue';
import { commonModule } from '@/features/common/common.store';
import { DATE_TIME_FORMAT, HttpStatus, SidebarWidth } from '@/common/constants';
import { projectPlanningModule } from '../store';
import {
    IBaselinePlanning,
    IBaselineTask,
    IBulkUpdateTask,
    ICreateProjectTaskDto,
    IDelegateResponse,
    IGanttChartTask,
    IMilestoneUpdateOriginalPlanning,
    IPlanning,
    IProjectTask,
    ITaskLink,
    ITaskUpdateOriginalPlanning,
    IGanttChartColumn,
} from '../interfaces';
import { projectPlanningService } from '../services/planning.service';
import { useRoute, useRouter } from 'vue-router';
import localStorageAuthService from '@/common/authStorage';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import {
    calcDateIgnoreNonWorkingTime,
    convertGanttTaskToTaskDto,
    convertToGanttTask,
    getBaselineTask,
    getVisibleColumnConfiguration,
} from '../helper';
import ganttChartStorage from '@/common/ganttChartStorage';
import uniq from 'lodash/uniq';
import cloneDeep from 'lodash/cloneDeep';
import { projectModule } from '@/features/project/store';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import { IFile } from '@/common/interfaces';
import sortBy from 'lodash/sortBy';
import { number } from 'yup';

export const useGantt = (gantt: GanttStatic) => {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    const planningId = computed(() => {
        return projectPlanningModule.planning?._id;
    });
    const searchValue = ref<string>('');
    const searchColumn = ref<GanttColumn>(GanttColumn.NAME);
    const searchType = ref<SearchTaskOption>(SearchTaskOption.APPROPRIATE);
    const autoScheduling = computed(() => {
        return !!projectPlanningModule.planning?.autoScheduling;
    });
    const currentMarkerFocusTimeId = ref<string | null>(null);
    let taskIdHasChangeList: string[] = [];
    //
    let onMouseMoveEventId = '';
    let dataProcessorInitialized = false;
    let eventInitialized = false;
    let gridWidthWithoutScrollbar = ganttChartStorage.getGridWidth() || 500;
    // add links for render, block call api to create link
    let addingLinksForRender = false;
    // add milestone after delegate for render, block bulkUpdateTask
    let addingMilestoneAfterDelegate = false;

    const getPlanning = async () => {
        const loading = ElLoading.service({});
        const planningResponse = await projectPlanningModule.getPlanning(
            projectPlanningModule.planningId,
        );

        loading.close();
        if (planningResponse.success) {
            projectPlanningModule.setPlanning(planningResponse.data);
        } else if (
            !planningResponse.success &&
            [HttpStatus.ITEM_NOT_FOUND, HttpStatus.BAD_REQUEST].includes(
                planningResponse.code,
            )
        ) {
            router.push({
                path: '/404',
            });
            return;
        }
        return planningResponse;
    };

    const getLinkType = (numericValue: number): LinkType => {
        const keys = Object.keys(LinkType);
        let result = LinkType.START_TO_FINISH;
        keys.forEach((key) => {
            const enumValue = LinkType[key as keyof typeof LinkType];
            if (Number(gantt.config[enumValue]) === numericValue) {
                result = enumValue;
                return result;
            }
        });

        return result;
    };

    const handleMarkerMove = (gridWidth?: number) => {
        if (onMouseMoveEventId) {
            gantt.detachEvent(onMouseMoveEventId);
        }
        onMouseMoveEventId = gantt.attachEvent(
            'onMouseMove',
            function (id, e) {
                if (!currentMarkerFocusTimeId.value) {
                    return true;
                }
                const marker = gantt.getMarker(currentMarkerFocusTimeId.value);

                const sidebarWidth = commonModule.openSidebar
                    ? +SidebarWidth.expand.split('px')[0] + 20
                    : +SidebarWidth.collapse.split('px')[0] + 20;
                const mousePosition =
                    e.clientX -
                    (gridWidth ? gridWidth : gridWidthWithoutScrollbar) -
                    sidebarWidth;
                const rightDate = gantt.dateFromPos(
                    gantt.getScrollState().x + (gantt as any).$task.offsetWidth,
                );
                const maxDate = gantt.getState().max_date;

                if (
                    moment(rightDate).diff(moment(maxDate), 'days') &&
                    mousePosition > (gantt as any).$task.offsetWidth - 80
                ) {
                    gantt.scrollTo(gantt.getScrollState().x + 20, null);
                }

                const mouseDate = gantt.dateFromPos(
                    mousePosition + gantt.getScrollState().x,
                );

                if (mouseDate && marker) {
                    marker.start_date = mouseDate;
                    marker.text = moment(mouseDate).fmDHTMLXString();
                    gantt.updateMarker(currentMarkerFocusTimeId.value);
                }
                return true;
            },
            null,
        );
    };

    const handleFileUpload = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
        gantt.importFromMSProject({
            data: uploadFile.raw,
            callback: function (project: any) {
                if (project) {
                    gantt.destructor();
                    gantt.init('gantt-chart-4d-planning');
                    initChart(false);
                    if (project.config.duration_unit) {
                        gantt.config.duration_unit = project.config.duration_unit;
                    }

                    gantt.parse(project.data);
                    gantt.render();
                }
            },
        });
    };

    const onFilter = async () => {
        const projectStart = moment(
            projectPlanningModule.planning?.projectStart,
        ).toDate();
        // move to the start time
        gantt.showDate(projectStart);

        projectPlanningModule.setIsMovingFocusTime(true);
        handleMarkerMove();
    };

    const configGanttLabels = () => {
        gantt.locale.labels.section_name = t('planning.gantt.lightbox.labels.name');
        gantt.locale.labels.section_time = t('planning.gantt.lightbox.labels.time');
    };

    const handleCreateTask = async (newTask: ICreateProjectTaskDto) => {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.createTask(
            projectPlanningModule.planning?._id as string,
            {
                ...newTask,
                path: localStorageAuthService.getPlanningPermissions().path || '',
                projectId: projectModule.selectedProjectId || '',
            },
        );
        loading.close();

        if (!response.success) {
            showErrorNotificationFunction(response.message);
            return;
        }

        const task = response.data;
        // update the planning in store
        const oldPlanning = cloneDeep(projectPlanningModule.planning);
        const parentTask = oldPlanning?.tasks.find((_task) => {
            return _task.ganttId === task.parentGanttId;
        });
        if (task && parentTask && oldPlanning) {
            parentTask.taskType = TaskType.WBS_SUMMARY;
            projectPlanningModule.setPlanning({
                ...oldPlanning,
                tasks: [...oldPlanning?.tasks, task],
            });
        }

        // update the gantt chart
        const baselineTask = getBaselineTask(task._id);
        const responseTask = convertToGanttTask(
            task,
            projectPlanningModule.planning?.additionalTaskFields || [],
            baselineTask,
        );
        const taskId = gantt.addTask(responseTask, responseTask.parent?.toString() || 0);
        showSuccessNotificationFunction(t('planning.task.messages.createdTask'));
        return taskId;
    };

    const checkPermissionToCreateChidTask = (task: IGanttChartTask) => {
        const ganttIdsRootTaskHasPermissionCreateChild =
            projectPlanningModule.rootTaskHasPermissionCreateChild?.map((rootTask) => {
                return rootTask.ganttId;
            });
        // can't add chid-task for milestone
        if (task.type === TaskType.MILESTONE) {
            return false;
        }
        if (projectPlanningModule.planning?.isTemplate) {
            return true;
        }

        while (task.parentGanttId) {
            if (ganttIdsRootTaskHasPermissionCreateChild.includes(task.ganttId)) {
                return true;
            } else {
                task = gantt.getTask(task.parentGanttId);
            }
        }
        return false;
    };

    const checkPermissionToAddLink = (taskId: string) => {
        let task = gantt.getTask(taskId);
        const ganttIdsRootTaskHasPermissionCreateChild =
            projectPlanningModule.rootTaskHasPermissionCreateChild?.map((rootTask) => {
                return rootTask.ganttId;
            });
        // can't add link with  WBS_SUMMARY or milestone render by BE
        if (task.type === TaskType.PROJECT || task.milestoneType) {
            return false;
        }

        if (projectPlanningModule.planning?.isTemplate) {
            return true;
        }

        while (task.parentGanttId) {
            if (ganttIdsRootTaskHasPermissionCreateChild.includes(task.ganttId)) {
                return true;
            } else {
                task = gantt.getTask(task.parentGanttId);
            }
        }
        return false;
    };

    const bulkUpdateTaskAutoScheduling = async () => {
        // check timeline wbs_summary has change
        const summaryTaskIdHasUpdate: string[] = [];
        projectPlanningModule.planning?.tasks.forEach((task) => {
            const taskInGantt: IGanttChartTask = gantt.getTask(task.ganttId);
            if (
                new Date(task.start).toString() !==
                    new Date(taskInGantt.start_date || '').toString() ||
                new Date(task.finish).toString() !==
                    new Date(taskInGantt.end_date || '').toString()
            ) {
                summaryTaskIdHasUpdate.push(task.ganttId);
            }
        });

        taskIdHasChangeList = uniq([...taskIdHasChangeList, ...summaryTaskIdHasUpdate]);

        taskIdHasChangeList.forEach((ganttId) => {
            const task = gantt.getTask(ganttId);

            const taskInStore = projectPlanningModule.planning?.tasks.find(
                (t) => t.ganttId === task.id,
            );
            let isUpdateStart = false;
            let isUpdateFinish = false;

            if (taskInStore) {
                if (
                    moment(task.start_date).fmFullTimeString() !==
                    moment(taskInStore.start).fmFullTimeString()
                ) {
                    isUpdateStart = true;
                }
                if (
                    moment(task.end_date).fmFullTimeString() !==
                    moment(taskInStore.finish).fmFullTimeString()
                ) {
                    isUpdateFinish = true;
                }
            }

            const taskLink = projectPlanningModule.planning?.taskLinks.find((link) => {
                if (
                    isUpdateStart &&
                    (([LinkType.FINISH_TO_START, LinkType.START_TO_START].includes(
                        link.type,
                    ) &&
                        link.target === task._id) ||
                        ([LinkType.START_TO_START, LinkType.START_TO_FINISH].includes(
                            link.type,
                        ) &&
                            link.source === task._id))
                ) {
                    return true;
                }
                if (
                    isUpdateFinish &&
                    (([LinkType.START_TO_FINISH, LinkType.FINISH_TO_FINISH].includes(
                        link.type,
                    ) &&
                        link.target === task._id) ||
                        ([LinkType.FINISH_TO_START, LinkType.FINISH_TO_FINISH].includes(
                            link.type,
                        ) &&
                            link.source === task._id))
                ) {
                    return true;
                }
                return false;
            });
            if (taskLink) {
                projectPlanningModule.setEditedTaskIds(
                    uniq([
                        ...projectPlanningModule.editedTaskIds,
                        taskLink.source,
                        taskLink.target,
                    ]),
                );
                projectPlanningModule.setEditedLinkIds(
                    uniq([...projectPlanningModule.editedLinkIds, taskLink._id]),
                );
            }
        });

        const taskHasChangeList: IBulkUpdateTask[] = [];
        taskIdHasChangeList.map((taskId) => {
            const taskInGantt: IGanttChartTask = gantt.getTask(taskId);
            if (taskInGantt) {
                taskHasChangeList.push({
                    ...convertGanttTaskToTaskDto({
                        ...taskInGantt,
                        calendarDuration: gantt.calculateDuration(taskInGantt),
                    }),
                    taskId: taskInGantt._id,
                });
            }
        });

        if (!taskHasChangeList) {
            return;
        }

        const response = await projectPlanningService.bulkUpdateTasks({
            items: taskHasChangeList,
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });

        if (response.success) {
            response.data.forEach((task) => {
                const currentTaskIndex = projectPlanningModule.planning?.tasks.findIndex(
                    (_task) => _task.ganttId === task.ganttId,
                );
                if (currentTaskIndex !== undefined && currentTaskIndex !== -1) {
                    const clonedPlanning = cloneDeep(projectPlanningModule.planning);
                    if (clonedPlanning?.tasks) {
                        clonedPlanning.tasks[currentTaskIndex] = cloneDeep(task);
                        projectPlanningModule.setPlanning(clonedPlanning);
                    }
                }
                const ganttTask = convertToGanttTask(
                    task,
                    projectPlanningModule.planning?.additionalTaskFields || [],
                );
                gantt.updateTask(task.ganttId, ganttTask);
            });
            taskIdHasChangeList = [];
        } else {
            showErrorNotificationFunction(response.message);
        }
    };

    // config gantt templates
    const initGanttTemplates = () => {
        gantt.templates.task_text = (start, end, task) => {
            return task.name;
        };

        gantt.templates.scale_cell_class = function (date) {
            if (date.getDay() == 0 || date.getDay() == 6) {
                return 'gantt-cell-weekend';
            }
            return '';
        };

        gantt.templates.timeline_cell_class = function (task, date) {
            if (!gantt.isWorkTime({ date: date, task: task })) {
                return 'gantt-timeline-cell-weekend';
            }
            return '';
        };

        gantt.templates.leftside_text = function (start, end, task) {
            const startTime = gantt.getTaskCalendar(task).getClosestWorkTime({
                date: new Date(start),
                dir: 'future',
                unit: 'hour',
            });
            return t('planning.gantt.task.prefix', {
                date: moment(startTime).fmHourMinuteString(),
            });
        };

        gantt.templates.link_description = (link) => {
            const fromObject = gantt.getTask(link.source);
            const toObject = gantt.getTask(link.target);
            return t(`planning.task.link.popupTitle.${getLinkType(link.type)}`, {
                from: fromObject.name,
                to: toObject.name,
            });
        };

        // add class for regular task (task type === task)
        gantt.templates.grid_row_class = function (start, end, task: IGanttChartTask) {
            let additionalClass = '';

            // TODO add more type to marked task is delegated
            if (task.type !== TaskType.PROJECT) {
                additionalClass += ' child_task';
            }
            if (task.delegatedTo) {
                additionalClass += ' delegated_task';
            }

            return additionalClass;
        };

        gantt.templates.drag_link = (from, from_start, to, to_start) => {
            const fromTask = gantt.getTask(from);
            const fromTaskName =
                fromTask.name?.length > 100
                    ? `${fromTask.name.slice(0, 100)}...`
                    : fromTask.name;
            const text = `From: <b>${fromTaskName}</b><br/>`;
            if (to) {
                const toTask = gantt.getTask(to);
                const fromTaskName =
                    toTask.name?.length > 100
                        ? `${toTask.name.slice(0, 100)}...`
                        : toTask.name;
                return text.concat(`To: <b>${fromTaskName}</b><br/>`);
            }
            return text;
        };
    };

    const configLinkDirection = () => {
        gantt.config[LinkType.FINISH_TO_START] = 0;
        gantt.config[LinkType.START_TO_START] = 1;
        gantt.config[LinkType.FINISH_TO_FINISH] = 2;
        gantt.config[LinkType.START_TO_FINISH] = 3;
    };

    const configZooming = () => {
        const zoomConfig = {
            levels: [
                {
                    name: 'year',
                    scale_height: 50,
                    min_column_width: 30,
                    scales: [{ unit: 'year', step: 1, format: '%Y' }],
                },

                {
                    name: 'quarter',
                    height: 50,
                    min_column_width: 90,
                    scales: [
                        { unit: 'month', step: 1, format: '%M' },
                        {
                            unit: 'quarter',
                            step: 1,
                            format: function (date: Date) {
                                const monthString = gantt.date.date_to_str('%M');
                                const yearString = gantt.date.date_to_str('%Y');
                                const endDate = gantt.date.add(
                                    gantt.date.add(date, 3, 'month'),
                                    -1,
                                    'day',
                                );
                                return (
                                    monthString(date) +
                                    ' - ' +
                                    monthString(endDate) +
                                    ' - ' +
                                    yearString(date)
                                );
                            },
                        },
                    ],
                },
                {
                    name: 'month',
                    scale_height: 50,
                    min_column_width: 120,
                    scales: [
                        { unit: 'month', format: '%F, %Y' },
                        { unit: 'week', format: 'Week #%W' },
                    ],
                },

                {
                    name: 'week',
                    scale_height: 50,
                    min_column_width: 50,
                    scales: [
                        {
                            unit: 'week',
                            step: 1,
                            format: function (date: Date) {
                                const dateToStr = gantt.date.date_to_str('%d %M');
                                const endDate = gantt.date.add(date, 6, 'day');
                                const weekNum = gantt.date.date_to_str('%W')(date);
                                return (
                                    '#' +
                                    weekNum +
                                    ', ' +
                                    dateToStr(date) +
                                    ' - ' +
                                    dateToStr(endDate)
                                );
                            },
                        },
                        { unit: 'day', step: 1, format: '%j %D' },
                    ],
                },

                {
                    name: 'day',
                    scale_height: 27,
                    min_column_width: 80,
                    scales: [{ unit: 'day', step: 1, format: '%d %M' }],
                },
                {
                    name: 'hour',
                    scale_height: 27,
                    min_column_width: 80,
                    scales: [{ unit: 'hour', step: 1, format: '%h' }],
                },
            ],
            // TODO config date later
            startDate: new Date(2010, 2, 27),
            endDate: new Date(2030, 3, 20),
            useKey: 'ctrlKey',
            trigger: 'wheel',
            element: function () {
                return document.querySelector('#gantt-chart-4d-planning .gantt_task');
            },
        };

        gantt.ext.zoom.init(zoomConfig);
        gantt.ext.zoom.setLevel('day');
    };

    const configAutoScheduling = (value: boolean) => {
        gantt.plugins({
            auto_scheduling: value,
        });
        gantt.config.auto_scheduling = value;
        gantt.config.auto_scheduling_initial = value;
        gantt.config.auto_scheduling_compatibility = value;
        gantt.config.auto_scheduling_strict = value;
    };

    const configGanttCommon = () => {
        gantt.config.bar_height = 16;
        gantt.config.row_height = 40;
        gantt.config.fit_tasks = true;

        // if use this config, gantt will throw an error when delete a task which has some children
        // gantt.config.cascade_delete = false;
        Object.values(TaskType).forEach((type) => {
            gantt.config.types[type] = type;
            gantt.locale.labels[`type_${type}`] = t(`planning.task.types.${type}`);
        });
        gantt.config.drag_timeline = {
            ignore: '.gantt_task_line, .gantt_task_link',
            useKey: 'ctrlKey',
        };
        gantt.config.show_markers = true;
        gantt.config.scales = [
            { unit: 'month', step: 1, format: '%M %Y' },
            { unit: 'day', step: 1, format: '%d, %l' },
            // { unit: 'hour', step: 1, format: '%H' },
        ];
        gantt.config.scale_height = 20 * 3;
        gantt.config.min_column_width = 18;
        gantt.config.min_grid_column_width = 1;

        gantt.config.horizontal_scroll_key = 'altKey';
        gantt.config.date_format = '%Y-%m-%d%T%H:%i:%s';
        // duration in decimal format
        gantt.config.work_time = true;
        // gantt.config.skip_off_time = true;
        gantt.config.duration_unit = 'day';

        // display column in grid
        gantt.config.reorder_grid_columns = true;
        gantt.config.grid_resize = true;
        const displayingTaskFieldIds = ganttChartStorage.getAdditionalTaskFields() || [];
        gantt.config.columns = getVisibleColumnConfiguration(
            gantt,
            projectPlanningModule.gridSettingParams.displayingStatus,
            (projectPlanningModule.planning?.additionalTaskFields || []).filter((field) =>
                displayingTaskFieldIds.includes(field._id),
            ),
            t,
            durationFormatter,
        );

        // show horizontal scrollbar in grid area
        gantt.config.layout = {
            css: 'gantt_container',
            cols: [
                {
                    width: gridWidthWithoutScrollbar || 500,
                    min_width: 300,
                    rows: [
                        {
                            view: 'grid',
                            scrollX: 'gridScroll',
                            scrollable: true,
                            scrollY: 'scrollVer',
                        },

                        // horizontal scrollbar for the grid
                        { view: 'scrollbar', id: 'gridScroll', group: 'horizontal' },
                    ],
                },
                { resizer: true, width: 1 },
                {
                    rows: [
                        { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },

                        // horizontal scrollbar for the timeline
                        { view: 'scrollbar', id: 'scrollHor', group: 'horizontal' },
                    ],
                },
                { view: 'scrollbar', id: 'scrollVer' },
            ],
        };
    };

    const parseData = async (data: IPlanning): Promise<void> => {
        // get baseline selected
        let baselineSelected: IBaselinePlanning;
        if (projectPlanningModule.baselineIdSelected) {
            const response = await projectPlanningService.getBaselineDetail(
                projectPlanningModule.baselineIdSelected,
            );
            if (response.success) {
                baselineSelected = response.data;
            } else {
                showErrorNotificationFunction(response.message);
            }
        }

        const tasks = (data.tasks || []).map((task) => {
            const baselineTask = baselineSelected?.baselineTasks?.find((baselineTask) => {
                return task._id.toString() === baselineTask.taskId?.toString();
            });

            return convertToGanttTask(
                task,
                data.additionalTaskFields || [],
                baselineTask,
            );
        });
        configLinkDirection();
        const taskLinks = (data.taskLinks || []).map((item) => {
            return {
                ...item,
                id: item._id,
                source: tasks.find((task) => task._id === item.source)?.ganttId,
                target: tasks.find((task) => task._id === item.target)?.ganttId,
                type: gantt.config[item.type],
                lag: item.lag,
            };
        });

        tasks.sort((taskA, taskB) => {
            if (taskA?.isMilestoneFolder) {
                return taskA?.milestoneType === MilestoneType.TOP_DOWN ? -1 : 1;
            }
            if (taskB?.isMilestoneFolder) {
                return taskB?.milestoneType === MilestoneType.TOP_DOWN ? 1 : -1;
            }
            return 0;
        });

        addCalendars();
        gantt.parse({
            data: tasks,
            // links: taskLinks,
        });
    };

    const initGanttEvent = () => {
        if (eventInitialized) return;
        eventInitialized = true;

        gantt.attachEvent(
            'onDataRender',
            () => {
                if (currentMarkerFocusTimeId.value) {
                    document
                        .querySelector(
                            `[data-marker-id="${currentMarkerFocusTimeId.value}"]`,
                        )
                        ?.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            await onFilter();
                        });
                }
                return true;
            },
            null,
        );

        gantt.attachEvent(
            'onGanttReady',
            () => {
                const grid = (gantt as any).$ui.getView('grid');
                grid.attachEvent(
                    'onBeforeColumnDragStart',
                    (
                        column: {
                            draggedColumn: IGanttChartColumn;
                            draggedIndex: number;
                        },
                        index: number,
                    ) => {
                        if (column.draggedColumn.name === 'name') {
                            return false;
                        }
                        return true;
                    },
                    null,
                );

                grid.attachEvent(
                    'onColumnDragMove',
                    ({
                        draggedColumn,
                        targetColumn,
                        draggedIndex,
                        targetIndex,
                    }: {
                        draggedColumn: IGanttChartColumn;
                        targetColumn: IGanttChartColumn;
                        draggedIndex: number;
                        targetIndex: number;
                    }) => {
                        const orderColumn = cloneDeep(
                            ganttChartStorage.getGanttOrderColumn(),
                        );
                        if (
                            targetColumn?.name === 'name' ||
                            draggedColumn?.name === 'name' ||
                            !orderColumn
                        ) {
                            return false;
                        }

                        orderColumn?.set(targetColumn.name, draggedIndex);
                        orderColumn?.set(draggedColumn.name, targetIndex);
                        ganttChartStorage.setGanttOrderColumn(orderColumn);
                    },
                    null,
                );
            },
            null,
        );

        // event fire when use click add icon in grid area
        gantt.attachEvent(
            'onTaskCreated',
            (task: IGanttChartTask) => {
                projectPlanningModule.setTaskPopupParams({
                    selectedTask: null,
                    show: true,
                    selectedTaskId: null,
                });
            },
            null,
        );

        gantt.attachEvent(
            'onAfterTaskAdd',
            async (id: string, item: IGanttChartTask) => {
                if (addingMilestoneAfterDelegate) {
                    return true;
                }
                const parentId = gantt.getParent(id || '');
                if (parentId) {
                    // update task type to wbs_summary
                    const parent = gantt.getTask(parentId);
                    const newParent = cloneDeep(parent);
                    newParent.type = TaskType.PROJECT;
                    newParent.taskType = TaskType.WBS_SUMMARY;
                    gantt.updateTask(parentId.toString(), newParent);
                }

                await bulkUpdateTaskAutoScheduling();
            },
            null,
        );

        // block show light box
        gantt.attachEvent(
            'onBeforeLightbox',
            () => {
                return false;
            },
            null,
        );

        gantt.attachEvent(
            'onTaskDblClick',
            (id: string) => {
                const currentTask = gantt.getTask(id);
                if (!currentTask.readonly) {
                    projectPlanningModule.setTaskPopupParams({
                        show: true,
                        selectedTask: currentTask,
                        parentOfSelectedTask: currentTask.parent
                            ? gantt.getTask(currentTask.parent)
                            : null,
                    });
                }
                return false;
            },
            null,
        );

        gantt.attachEvent(
            'onLinkDblClick',
            (id: string) => {
                const currentLink = projectPlanningModule.planning?.taskLinks.find(
                    (link) => {
                        return link._id === id;
                    },
                );
                if (!currentLink) {
                    return false;
                }
                projectPlanningModule.setLinkDetailPopupFormParam({
                    linkSelected: currentLink as ITaskLink,
                    show: true,
                });
                return false;
            },
            null,
        );

        gantt.attachEvent(
            'onBeforeTaskDrag',
            (id: string) => {
                const task: IGanttChartTask = gantt.getTask(id);
                if (!task.parentGanttId || task.canEdit === false) {
                    return false;
                }
                return true;
            },
            null,
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        gantt.attachEvent(
            'onAfterTaskDrag',
            async (id: string, mode: 'resize' | 'progress' | 'move' | 'ignore') => {
                const task = gantt.getTask(id);
                if (!task.parentGanttId) {
                    return false;
                }
                if (!task.canEdit) {
                    gantt.updateTask(
                        id,
                        convertToGanttTask(
                            task,
                            projectPlanningModule.planning?.additionalTaskFields || [],
                        ),
                    );
                    return false;
                }
                await bulkUpdateTaskAutoScheduling();
                return true;
            },
            null,
        );

        gantt.attachEvent(
            'onBeforeTaskAutoSchedule',
            (task: IGanttChartTask, _start, _link, _predecessor) => {
                if (
                    task.isStaticMilestone ||
                    (task.milestoneType === MilestoneType.BOTTOM_UP_DELEGATE_FL &&
                        task.taskType === TaskType.START_MILESTONE) ||
                    (task.milestoneType === MilestoneType.TOP_DOWN_DELEGATE_FL &&
                        task.taskType === TaskType.START_MILESTONE) ||
                    (task.milestoneType === MilestoneType.TOP_DOWN &&
                        task.taskType === TaskType.START_MILESTONE)
                ) {
                    return false;
                }
                return true;
            },
            null,
        );

        // after auto scheduling finishes
        gantt.attachEvent(
            'onAfterAutoSchedule',
            (taskId: string | undefined, updatedTasks: string[] | []) => {
                taskIdHasChangeList = uniq([...taskIdHasChangeList, ...updatedTasks]);
            },
            null,
        );

        gantt.attachEvent(
            'onTaskClick',
            (id: string) => {
                projectPlanningModule.setSelectedTaskIdList(
                    // gantt.getSelectedTasks() || [],
                    gantt
                        .getSelectedTasks()
                        .map((ganttId) => gantt.getTask(ganttId)._id) || [],
                );
                const task = gantt.getTask(id);
                projectPlanningModule.setTaskPopupParams({
                    selectedTaskId: task._id,
                });
                // projectPlanningModule.setIsDisableButtonAdd(
                //     !checkPermissionToCreateChidTask(task),
                // );
                return true;
            },
            null,
        );

        gantt.attachEvent(
            'onEmptyClick',
            () => {
                if (projectPlanningModule.isMovingFocusTime) {
                    gantt.detachEvent(onMouseMoveEventId);
                    projectPlanningModule.setNeedReload3DViewer(true);
                    document
                        .querySelector(
                            `[data-marker-id="${currentMarkerFocusTimeId.value}"]`,
                        )
                        ?.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            await onFilter();
                        });
                    projectPlanningModule.setIsMovingFocusTime(false);
                }
                return false;
            },
            null,
        );

        gantt.attachEvent(
            'onGridResizeEnd',
            (oldWidth: number, newWidth: number) => {
                gridWidthWithoutScrollbar = newWidth;
                ganttChartStorage.setGridWitdh(
                    newWidth < 0 ? gridWidthWithoutScrollbar : newWidth,
                );
                return true;
            },
            null,
        );

        gantt.attachEvent(
            'onTaskLoading',
            (task: IGanttChartTask) => {
                task.bl_start = gantt.date.parseDate(
                    task.baselineCurrentStart,
                    'xml_date',
                );
                task.bl_finish = gantt.date.parseDate(
                    task.baselineCurrentFinish,
                    'xml_date',
                );
                return true;
            },
            null,
        );

        const isTaskDisplaying = (taskId: string): boolean => {
            const task = gantt.getTask(taskId);
            let taskValue = task?.[searchColumn.value];
            if (!searchValue.value?.length) {
                return true;
            }
            if (searchColumn.value === GanttColumn.PARENT_ID) {
                taskValue = task.parent ? task.parent : '';
            } else if (searchColumn.value === GanttColumn.PARENT_NAME) {
                if (!task.parent) {
                    taskValue = '';
                } else {
                    taskValue = gantt.getTask(task.parent).name;
                }
            } else if (searchColumn.value === GanttColumn.STATUS) {
                taskValue = task.status ? t(`planning.gantt.status.${task.status}`) : '';
            } else if (searchColumn.value === GanttColumn.TYPE) {
                if (!task.type) {
                    taskValue = '';
                } else {
                    taskValue = t(`planning.task.types.${task.taskType}`);
                }
            } else if (searchColumn.value === GanttColumn.START) {
                if (!task.start || task.taskType === TaskType.FINISH_MILESTONE) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.start).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.PLANNED_START) {
                if (task.status !== TaskStatus.TODO) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.plannedStart).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.ACTUAL_START) {
                if (!task.actualStart) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.actualStart).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.EARLY_START) {
                if (!task.plannedStart) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.plannedStart).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.LATE_START) {
                taskValue =
                    task.plannedStart && gantt.getTotalSlack(task)
                        ? calcDateIgnoreNonWorkingTime(
                              task.plannedStart,
                              gantt.getTotalSlack(task),
                              [9, 13, 14, 18],
                          )
                        : undefined;
            } else if (searchColumn.value === GanttColumn.BL_START) {
                if (!task.baselineStart) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.baselineStart).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.FINISH) {
                if (!task.finish || task.taskType === TaskType.START_MILESTONE) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.finish).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.ACTUAL_FINISH) {
                if (!task.actualFinish) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.actualFinish).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.EARLY_FINISH) {
                if (!task.plannedFinish) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.plannedFinish).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.LATE_FINISH) {
                taskValue =
                    task.plannedFinish && gantt.getTotalSlack(task)
                        ? calcDateIgnoreNonWorkingTime(
                              task.plannedFinish,
                              gantt.getTotalSlack(task),
                              [9, 13, 14, 18],
                          )
                        : null;
            } else if (searchColumn.value === GanttColumn.PLANNED_FINISH) {
                if (!task.plannedFinish) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.plannedFinish).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.BL_FINISH) {
                taskValue = task.baselineFinish
                    ? moment(task.baselineFinish).fmDayString()
                    : undefined;
            } else if (searchColumn.value === GanttColumn.PR_CONSTRAINT) {
                taskValue = task.primaryConstraints
                    ? t(`planning.gantt.primaryConstraints.${task.primaryConstraints}`)
                    : '';
            } else if (searchColumn.value === GanttColumn.PR_CONSTRAINT_DATE) {
                if (!task.primaryConstraintDate) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.primaryConstraintDate).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.EXPECTED_FINISH) {
                if (!task.expectedFinish) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.expectedFinish).fmDayString();
                }
            } else if (searchColumn.value === GanttColumn.DURATION_TYPE) {
                taskValue = task.durationType
                    ? t(`planning.gantt.durationTypes.${task.durationType}`)
                    : '';
            } else if (searchColumn.value === GanttColumn.AT_COMPLETE_DURATION) {
                taskValue = (task.actualDuration || 0) + (task.remainingDuration || 0);
            } else if (searchColumn.value === GanttColumn.BL_DURATION) {
                taskValue = durationFormatter(task.baselineDuration);
            } else if (searchColumn.value === GanttColumn.VBL_DURATION) {
                taskValue = durationFormatter(task.varianceBLDuration);
            } else if (searchColumn.value === GanttColumn.VBL_FINISH_DATE) {
                if (!task.finish || !task.baselineFinish) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.finish).diff(task.baselineFinish, 'days');
                }
            } else if (searchColumn.value === GanttColumn.VBL_START_DATE) {
                if (!task.start || !task.baselineStart) {
                    taskValue = undefined;
                } else {
                    taskValue = moment(task.start).diff(task.baselineStart, 'days');
                }
            } else if (searchColumn.value === GanttColumn.FREE_FLOAT) {
                taskValue = gantt.getFreeSlack(task);
            } else if (searchColumn.value === GanttColumn.TOTAL_FLOAT) {
                taskValue = gantt.getTotalSlack(task);
            } else if (searchColumn.value === GanttColumn.PERCENT_COMPLETE_TYPE) {
                taskValue = task.percentageCompletion
                    ? t(
                          `planning.gantt.percentCompleteTypes.${task.percentageCompletion}`,
                      )
                    : '';
            } else if (searchColumn.value === GanttColumn.PHYSICAL_PERCENTAGE) {
                if (task.actualPhysicalQuantity && task.physicalQuantity) {
                    taskValue = task.actualPhysicalQuantity / task.physicalQuantity;
                } else {
                    taskValue = undefined;
                }
            } else if (searchColumn.value === GanttColumn.DURATION_PERCENTAGE) {
                if (task.actualDuration && task.remainingDuration) {
                    taskValue =
                        task.actualDuration /
                        (task.actualDuration + task.remainingDuration);
                } else {
                    taskValue = undefined;
                }
            } else if (searchColumn.value === GanttColumn.MANUAL_PERCENTAGE) {
                taskValue = task.manualComplete;
            } else if (searchColumn.value === GanttColumn.PHYSICAL_UNIT) {
                taskValue = task.physicalQuantity
                    ? t(
                          `planning.gantt.physicalQuantityUnit.${task.physicalQuantityUnit}`,
                      )
                    : '';
            } else if (searchColumn.value === GanttColumn.REMAIN_PHYSICAL_QUANTITY) {
                taskValue = task.remainingPhysicalQuantity
                    ? task.remainingPhysicalQuantity
                    : undefined;
            } else if (searchColumn.value === GanttColumn.RESOURCE_3D) {
                taskValue = task.resourceIds?.length ? task.resourceIds?.length : '';
            } else if (searchColumn.value === GanttColumn.RESOURCE_GROUP) {
                taskValue = task.resourceGroupIds?.length
                    ? task.resourceGroupIds?.length
                    : '';
            } else if (searchColumn.value === GanttColumn.ACTIVITY_CODE) {
                taskValue = task.activityCode;
            } else if (searchColumn.value === GanttColumn.ACTIVITY_CODE_VALUE) {
                taskValue = task.activityCodeValue;
            }

            if (
                searchType.value === SearchTaskOption.APPROPRIATE &&
                taskValue
                    ?.toLocaleLowerCase()
                    ?.includes(searchValue.value.toLocaleLowerCase())
            ) {
                return true;
            }
            if (
                searchType.value === SearchTaskOption.EXACT &&
                taskValue?.toString() === searchValue.value
            ) {
                return true;
            }

            const children = gantt.getChildren(taskId);
            for (let i = 0; i < children.length; i++) {
                if (isTaskDisplaying(children[i])) return true;
            }
            return false;
        };

        gantt.attachEvent(
            'onBeforeTaskDisplay',
            (id, task: IGanttChartTask) => {
                if (isTaskDisplaying(id)) {
                    return true;
                }

                return false;
            },
            {},
        );

        gantt.attachEvent(
            'onContextMenu',
            (taskId: string, linkId: string, event) => {
                if (taskId || linkId) {
                    event.preventDefault();
                    if (taskId) {
                        const task: IGanttChartTask = gantt.getTask(taskId) || null;
                        gantt.eachSelectedTask((id) => {
                            gantt.unselectTask(id);
                        });
                        gantt.selectTask(taskId);

                        projectPlanningModule.setGanttContextMenuParam({
                            task,
                            link: null,
                            show: true,
                            top:
                                event.clientY +
                                document.body.scrollTop +
                                document.documentElement.scrollTop,
                            left:
                                event.clientX +
                                document.body.scrollLeft +
                                document.documentElement.scrollLeft,
                            permissionAddLink: task
                                ? checkPermissionToAddLink(task.id)
                                : false,
                        });
                    }
                }

                return true;
            },
            null,
        );
    };

    const configGanttDataProcessor = () => {
        if (dataProcessorInitialized) return;
        dataProcessorInitialized = true;
        gantt.createDataProcessor(
            async (
                entity: 'task' | 'link',
                action: 'create' | 'update' | 'delete',
                data: IGanttChartTask | ITaskLink,
                _id: string,
            ) => {
                if (entity === 'task') return;
                const loading = ElLoading.service({});
                let response = undefined;
                if (entity === 'link') {
                    const link = data as ITaskLink;
                    switch (action) {
                        case 'create': {
                            break;
                        }
                        case 'update': {
                            response = await projectPlanningService.updateLink(_id, {
                                source: gantt.getTask(link.source)._id,
                                target: gantt.getTask(link.target)._id,
                                type: getLinkType(Number(link.type)),
                                lag: link.lag,
                                projectId: projectModule.selectedProjectId || '',
                                path:
                                    localStorageAuthService.getPlanningPermissions()
                                        .path || '',
                            });
                            break;
                        }
                        case 'delete':
                            break;
                    }
                }
                if (response && !response?.success && !response?.isRequestError) {
                    showErrorNotificationFunction(response?.message);
                    gantt.clearAll();
                    response = await getPlanning();
                    if (response?.success) {
                        await parseData(response?.data);
                    }
                }
                loading.close();
            },
        );
    };

    const addGanttTaskLayer = () => {
        const dataSettingBaseline = projectPlanningModule.baselineConfiguration;
        const layer_id = gantt.addTaskLayer({
            renderer: {
                render: function draw_planned(task: IGanttChartTask) {
                    if (task.bl_start && task.bl_finish) {
                        const sizes = gantt.getTaskPosition(
                            task,
                            task.bl_start,
                            task.bl_finish,
                        );
                        const el = document.createElement('div');
                        el.className = 'gantt-task-baseline';
                        el.style.backgroundColor = dataSettingBaseline.color;
                        el.style.left = sizes.left + 'px';
                        el.style.width = sizes.width + 'px';

                        if (task.type === TaskType.MILESTONE) {
                            el.style.left = sizes.left - 12 + 'px';
                            el.style.width = '22px';
                            el.style.top =
                                sizes.top + gantt.config.bar_height + 27 + 'px';
                            el.style.height = '22px';
                            el.style.transform = 'rotate(45deg)';
                            return el;
                        }

                        switch (dataSettingBaseline.position) {
                            case 'top':
                                el.style.top =
                                    sizes.top + gantt.config.bar_height + 22 + 'px';
                                el.style.height = '13px';
                                break;
                            case 'bottom':
                                el.style.top =
                                    sizes.top + gantt.config.bar_height + 41 + 'px';
                                el.style.height = '13px';
                                break;
                            default:
                                el.style.top =
                                    sizes.top + gantt.config.bar_height + 23 + 'px';
                                el.style.height = '31px';
                                break;
                        }

                        return el;
                    }
                    return false;
                },
                // define getRectangle in order to hook layer with the smart rendering
                getRectangle: function (task: IGanttChartTask, view: any) {
                    if (task.bl_start && task.bl_finish) {
                        return gantt.getTaskPosition(task, task.bl_start, task.bl_finish);
                    }
                    return null;
                },
            },
        });

        projectPlanningModule.setTaskLayerId(layer_id);
    };

    const changeTaskLayer = () => {
        gantt.removeTaskLayer(projectPlanningModule.taskLayerId);
        addGanttTaskLayer();
    };

    const configChart = () => {
        gantt.plugins({
            multiselect: true,
            marker: true,
            collision: false,
            keyboard_navigation: true,
            critical_path: true,
        });
        configAutoScheduling(autoScheduling.value);
        configGanttCommon();
        configZooming();
        configLinkDirection();
        configGanttLabels();
        initGanttTemplates();
        initGanttEvent();
        configGanttDataProcessor();
        addGanttTaskLayer();
    };

    const fetchData = async () => {
        const response = await getPlanning();
        console.log(response);

        if (response?.success) {
            await parseData(response?.data);
        }
    };

    const addCalendars = () => {
        const calendars = projectPlanningModule.planning?.calendars || [];
        calendars.forEach((calendar) => {
            const mapDateToWorkHours = new Map<string, string[]>();
            calendar.configs.forEach((config) => {
                const date = moment(config.date).fmDayString();
                const workHours = config.dayType.timeBlocks.map(
                    (timeBlock) => `${timeBlock.startTime}-${timeBlock.endTime}`,
                );
                mapDateToWorkHours.set(date, workHours);
            });
            const calendarLength = moment(
                calendar.configs[calendar.configs.length - 1]?.date,
            ).diff(moment(calendar.configs[0]?.date), 'day');
            const calendarStart = moment(calendar.configs[0]?.date);

            const calendarId = gantt.addCalendar({
                id: calendar._id,
                worktime: {
                    hours: defaultWorkTimeBlocks,
                    days: [1, 1, 1, 1, 1, 1, 1],
                },
            });
            const ganttCalendar = gantt.getCalendar(calendarId);
            for (let i = 0; i <= calendarLength; ++i) {
                const momentDate = calendarStart.clone().add(i, 'day');
                let workTimeData = {};
                if (mapDateToWorkHours.has(momentDate.fmDayString())) {
                    workTimeData = {
                        date: momentDate.toDate(),
                        hours: mapDateToWorkHours.get(momentDate.fmDayString()),
                    };
                } else {
                    workTimeData = {
                        date: momentDate.toDate(),
                        hours: false,
                    };
                }
                ganttCalendar.setWorkTime(workTimeData);
                if (calendar.isDefaultCalendar) {
                    gantt.setWorkTime(workTimeData);
                }
            }
        });
    };

    const initChart = async (forceFetchData: boolean) => {
        gantt.clearAll();
        if (forceFetchData) {
            await fetchData();
        }
        if (!gantt.config.initFlag) {
            configChart();
            gantt.config.initFlag = true;
        }
        // ensure that template must be re-config
        initGanttTemplates();
        gantt.init(
            'gantt-chart-4d-planning',
            // new Date('03-04-2020 00:00'),
            // new Date('03-04-2025 00:00'),
        );
        gantt.config.show_errors = false;
    };

    /**
     * auto schedule gantt chart after update task by form popup.
     * @param taskId ganttID of task.
     */
    const handleAfterUpdateTaskByFormPopup = async (taskId: string) => {
        taskIdHasChangeList.push(taskId);
        await bulkUpdateTaskAutoScheduling();
    };

    const handleAfterDelegateTask = (data: IDelegateResponse) => {
        addingLinksForRender = true;
        addingMilestoneAfterDelegate = true;
        // update in store
        const planning = cloneDeep(projectPlanningModule.planning);
        data?.tasks.forEach((task) => {
            if (
                task.taskType === TaskType.FINISH_MILESTONE ||
                task.taskType === TaskType.START_MILESTONE
            ) {
                planning?.tasks.push(task);
                gantt.addTask(
                    convertToGanttTask(
                        task,
                        projectPlanningModule.planning?.additionalTaskFields || [],
                    ),
                );
            } else {
                const taskNeedUpdate = planning?.tasks.find(
                    (item) => task._id === item._id,
                );
                if (taskNeedUpdate) {
                    taskNeedUpdate.delegatedTo = task.delegatedTo;
                    const taskInGantt: IGanttChartTask = gantt.getTask(
                        taskNeedUpdate.ganttId,
                    );
                    taskInGantt.delegatedTo = task.delegatedTo;
                    gantt.refreshTask(taskNeedUpdate.ganttId);
                }
            }
        });
        data?.links.forEach((link) => {
            planning?.taskLinks.push(link);
            gantt.addLink({
                ...link,
                id: link._id,
                source: planning?.tasks?.find((task) => task._id === link.source)
                    ?.ganttId,
                target: planning?.tasks?.find((task) => task._id === link.target)
                    ?.ganttId,
                type: gantt.config[link.type],
                lag: link.lag,
            });
        });

        addingLinksForRender = false;
        addingMilestoneAfterDelegate = false;
    };

    const onClickTopDown = async (planningIds: string[]) => {
        const editedTaskIds = computed(() => projectPlanningModule.editedTaskIds);
        const editedLinkIds = computed(() => projectPlanningModule.editedLinkIds);
        const loading = ElLoading.service();
        const response = await projectPlanningService.topDown(
            projectPlanningModule.planningId,
            editedTaskIds.value,
            planningIds,
            projectModule.selectedProjectId || '',
            localStorageAuthService.getPlanningPermissions().path || '',
            editedLinkIds.value,
        );
        loading.close();
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            projectPlanningModule.setIsShowTopDownFormPopup(false);
            showSuccessNotificationFunction(t('planning.topDown.message.success'));
        }
    };

    const importP6File = async (
        file: IFile,
        mapImportTaskIdToGanttId: Map<string, string>,
    ) => {
        const loading = ElLoading.service();
        try {
            (window as any).gantt.importFromPrimaveraP6({
                data: file,
                callback: (project: Record<string, any>) => {
                    if (project) {
                        const tasks: Record<string, unknown>[] = [];
                        const sortedTasks = sortBy(
                            project?.data?.data?.filter((task: Record<string, string>) =>
                                projectPlanningModule.importTaskIds.includes(task.id),
                            ),
                            (task) => parseInt(task.id) || task.id,
                        );
                        sortedTasks?.forEach((currentTask: Record<string, any>) => {
                            const task: Record<string, unknown> = {};
                            convertImportXmlTasks.forEach((convertImportXmlTask) => {
                                task[convertImportXmlTask.name] =
                                    currentTask[convertImportXmlTask[XML_TYPE.P6]] ||
                                    currentTask.$raw[convertImportXmlTask[XML_TYPE.P6]];
                            });
                            task.p6Id = mapImportTaskIdToGanttId.get(task.p6Id as string);
                            task.parentId = mapImportTaskIdToGanttId.get(
                                task.parentId as string,
                            );
                            tasks.push(task);
                        });
                        projectPlanningModule.setImportTasks(tasks);

                        const links: Record<string, string>[] = [];
                        project?.data?.links
                            ?.filter(
                                (link: Record<string, string>) =>
                                    projectPlanningModule.importTaskIds.includes(
                                        link.target,
                                    ) &&
                                    projectPlanningModule.importTaskIds.includes(
                                        link.source,
                                    ),
                            )
                            ?.forEach((currentLink: Record<string, string>) => {
                                const link: Record<string, string> = {};
                                convertImportXmlLinks.forEach((convertImportXmlLink) => {
                                    if (
                                        convertImportXmlLink.name !== LinkFieldName.TYPE
                                    ) {
                                        link[convertImportXmlLink.name] =
                                            currentLink[
                                                convertImportXmlLink[XML_TYPE.P6]
                                            ];
                                    } else {
                                        link[convertImportXmlLink.name] =
                                            convertLinkType[
                                                +currentLink[
                                                    convertImportXmlLink[XML_TYPE.P6]
                                                ]
                                            ];
                                    }
                                });
                                link.source =
                                    mapImportTaskIdToGanttId.get(link.source) ||
                                    link.source;
                                link.target =
                                    mapImportTaskIdToGanttId.get(link.target) ||
                                    link.target;
                                links.push(link);
                            });
                        projectPlanningModule.setImportLinks(links);

                        const resources: Record<string, string>[] = [];
                        project?.resources?.forEach(
                            (currentResource: Record<string, string>) => {
                                const resource: Record<string, string> = {};
                                convertImportXmlResources.forEach(
                                    (convertImportXmlResource) => {
                                        if (
                                            convertImportXmlResource.name ===
                                            ResourceFieldName.TYPE
                                        ) {
                                            const resourceType =
                                                convertResourceTypes.find(
                                                    (convertResourceType) =>
                                                        currentResource[
                                                            convertImportXmlResource[
                                                                XML_TYPE.P6
                                                            ]
                                                        ] ===
                                                        convertResourceType[XML_TYPE.P6],
                                                );

                                            resource[convertImportXmlResource.name] =
                                                resourceType?.type ||
                                                ResourceType.EQUIPMENT;
                                        } else {
                                            resource[convertImportXmlResource.name] =
                                                currentResource[
                                                    convertImportXmlResource[XML_TYPE.P6]
                                                ];
                                        }
                                    },
                                );
                                resources.push(resource);
                            },
                        );
                        projectPlanningModule.setImportResources(resources);
                    }
                    loading.close();
                    projectPlanningModule.setIsShowImportXmlDetail(true);
                },
            });
        } catch (error) {
            loading.close();
            showErrorNotificationFunction(error as string);
        }
    };

    const onClickBottomUp = async (planningIds: string[]) => {
        const editedTaskIds = computed(() => projectPlanningModule.editedTaskIds);
        const editedLinkIds = computed(() => projectPlanningModule.editedLinkIds);
        const loading = ElLoading.service();
        const response = await projectPlanningService.bottomUp(
            projectPlanningModule.planningId,
            editedTaskIds.value,
            planningIds,
            projectModule.selectedProjectId || '',
            localStorageAuthService.getPlanningPermissions().path || '',
            editedLinkIds.value,
        );
        loading.close();
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            projectPlanningModule.setIsShowBottomUpFormPopup(false);
            showSuccessNotificationFunction(t('planning.bottomUp.message.success'));
        }
    };

    /**
     * update milestone IM (create by delegate) and FL (create by synthesis).
     * @param planningId Id of original planning.
     */
    const onClickUpdateMilestone = async (planningId: string) => {
        // for update mile IM
        const taskIdsDelegatedFromOtherPlanning =
            projectPlanningModule.rootTaskHasPermissionCreateChild.map((task) => {
                return task._id;
            });
        const tasks: ITaskUpdateOriginalPlanning[] | undefined =
            projectPlanningModule.planning?.tasks
                .filter((task) => {
                    return taskIdsDelegatedFromOtherPlanning.includes(task._id);
                })
                .map((task) => {
                    return {
                        _id: task.clonedFromTaskId || '',
                        planningId: planningId,
                        startModified: moment(task.start)
                            .utc()
                            .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                        finishModified: moment(task.finish)
                            .utc()
                            .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                        name: task.name,
                        ganttId: task.ganttId,
                    };
                });

        // for update milestone FL
        const milestones: IMilestoneUpdateOriginalPlanning[] =
            projectPlanningModule.planning?.tasks
                .filter((task) => {
                    return (
                        task.milestoneType === MilestoneType.TOP_DOWN &&
                        task.isStaticMilestone === false &&
                        task.linkedTaskId &&
                        task.linkedLinkId
                    );
                })
                .map((task) => {
                    return {
                        _id: task._id,
                        linkedTaskId: task.linkedTaskId || '',
                        linkedLinkId: task.linkedLinkId || '',
                        milestoneLinkTo: task.milestoneLinkTo || null,
                        startModified: task.start
                            ? moment(task.start)
                                  .utc()
                                  .format(
                                      DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON,
                                  )
                            : null,
                        finishModified: task.finish
                            ? moment(task.finish)
                                  .utc()
                                  .format(
                                      DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON,
                                  )
                            : null,
                    };
                }) || [];

        if (!tasks) {
            return;
        }

        const loading = ElLoading.service();
        const response = await projectPlanningService.updateOriginalPlanning(
            tasks,
            milestones,
            projectPlanningModule.planningId || '',
            projectModule.selectedProjectId || '',
            localStorageAuthService.getPlanningPermissions().path || '',
        );
        loading.close();
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            projectPlanningModule.setIsShowBottomUpFormPopup(false);
            showSuccessNotificationFunction(
                t('planning.bottomUp.message.updateMilestonesSuccess'),
            );
        }
    };

    const addTaskListToChart = (tasks: IProjectTask[]) => {
        if (tasks.length) {
            tasks.forEach((task) => {
                if (
                    task.milestoneType === MilestoneType.TOP_DOWN &&
                    task.isMilestoneFolder
                ) {
                    gantt.addTask(
                        convertToGanttTask(
                            task,
                            projectPlanningModule.planning?.additionalTaskFields || [],
                        ),
                        undefined,
                        0,
                    );
                } else {
                    gantt.addTask(
                        convertToGanttTask(
                            task,
                            projectPlanningModule.planning?.additionalTaskFields || [],
                        ),
                    );
                }
                if (task.isMilestoneFolder) {
                    gantt.open(task._id);
                }
            });
        }
    };
    const calculateFinish = (
        ganttId: string,
        duration: number,
        startDate: string,
        currentFinish: string,
        calendarId: string,
    ) => {
        const task = gantt.getTask(ganttId);
        if (!task) {
            return null;
        }
        const currentDuration = calculateDuration(
            ganttId,
            startDate,
            currentFinish,
            calendarId,
        );
        if (currentDuration === duration) {
            return moment(currentFinish).toDate();
        }
        const oldCalendarId = task.calendar_id;
        task.calendar_id = calendarId;
        const endDate = gantt.calculateEndDate({
            start_date: moment(startDate).toDate(),
            duration,
            task,
        });
        task.calendar_id = oldCalendarId;
        return endDate;
    };
    const calculateDuration = (
        ganttId: string,
        startDate: string,
        endDate: string,
        calendarId: string,
    ) => {
        const task = gantt.getTask(ganttId);
        if (
            !task ||
            [TaskType.START_MILESTONE, TaskType.FINISH_MILESTONE].includes(task.taskType)
        ) {
            return null;
        }

        const calendar = gantt.getCalendar(calendarId);
        if (!calendar) {
            return null;
        }

        return calendar.calculateDuration(
            moment(startDate).toDate(),
            moment(endDate).toDate(),
        );
    };

    const reschedulingGantt = async () => {
        configAutoScheduling(true);
        gantt.autoSchedule();
        // Update to db
        await bulkUpdateTaskAutoScheduling();
        configAutoScheduling(autoScheduling.value);
        // notification success
        showSuccessNotificationFunction(
            t('planning.scheduling.messages.reschedulingSuccess'),
        );
    };

    const bulkAddLinks = (taskLinks: ITaskLink[]) => {
        const tasks = projectPlanningModule.planning?.tasks;
        const newTaskLinks = (taskLinks || []).map((item) => {
            projectPlanningModule.planning?.taskLinks.push(item);
            return {
                ...item,
                id: item._id,
                source: tasks?.find((task) => task._id === item.source)?.ganttId,
                target: tasks?.find((task) => task._id === item.target)?.ganttId,
                type: gantt.config[item.type],
                lag: item.lag,
            };
        });

        addingLinksForRender = true;
        newTaskLinks.forEach((link) => {
            gantt.addLink(link);
        });
        addingLinksForRender = false;
    };

    const deleteLink = async (linkId: string) => {
        const link = gantt.getLink(linkId);
        // prevent delete one link multi times
        if (!link) return;
        const response = await projectPlanningService.deleteLink(
            planningId.value as string,
            linkId,
        );
        if (response.success) {
            gantt.deleteLink(linkId);
            bulkUpdateTaskAutoScheduling();
            response.data.deletedMilestoneIds.forEach((milestoneId) => {
                gantt.deleteTask(milestoneId);
            });
            projectPlanningModule.setPlanning(
                cloneDeep({
                    ...projectPlanningModule.planning,
                    taskLinks: projectPlanningModule.planning?.taskLinks.filter(
                        (link) => link._id !== linkId,
                    ),
                }) as IPlanning,
            );
            showSuccessNotificationFunction(t('planning.task.messages.deletedLink'));
        }
    };

    const updatedLink = (link: ITaskLink) => {
        const linkInGantt = gantt.getLink(link._id);
        const linkInStore = projectPlanningModule.planning?.taskLinks.find((taskLink) => {
            return link._id === taskLink._id;
        });
        if (!linkInStore) {
            return;
        } else {
            linkInStore.lag = link.lag;
        }
        linkInGantt.lag = link.lag;
        gantt.updateLink(link._id);
    };

    const ganttDurationFormatter = gantt.ext.formatters.durationFormatter({
        enter: 'hour',
        store: 'hour',
        format: ['month', 'day', 'hour'],
        hoursPerDay: 24,
        hoursPerWeek: 168,
        short: true,
        labels: {
            hour: {
                full: 'hour',
                plural: 'hours',
                short: 'h',
            },
            day: {
                full: 'day',
                plural: 'days',
                short: 'd',
            },
            month: {
                full: 'month',
                plural: 'months',
                short: 'mon',
            },
        },
    });

    const durationFormatter = (duration: number | null) => {
        const ganttFormated = ganttDurationFormatter.format(duration);
        const regExp = /^0[a-z]+/;
        const durationFormated = ganttFormated
            .split(' ')
            .reduce((result: string, word: string) => {
                return result + (regExp.test(word) ? '' : word + ' ');
            }, '')
            .slice(0, -1);

        return durationFormated || '0';
    };

    const updateOneTask = (taskData: IProjectTask) => {
        const task = gantt.getTask(taskData.ganttId);
        if (!task) {
            return;
        }
        gantt.updateTask(
            taskData.ganttId,
            convertToGanttTask(
                taskData,
                projectPlanningModule.planning?.additionalTaskFields || [],
            ),
        );
    };

    return {
        currentMarkerFocusTimeId,
        searchValue,
        searchType,
        searchColumn,
        updateOneTask,
        durationFormatter,
        initChart,
        getPlanning,
        handleFileUpload,
        onFilter,
        handleMarkerMove,
        onClickTopDown,
        onClickBottomUp,
        onClickUpdateMilestone,
        initGanttTemplates,
        fetchData,
        addTaskListToChart,
        changeTaskLayer,
        importP6File,
        reschedulingGantt,
        calculateFinish,
        calculateDuration,
        checkPermissionToAddLink,
        bulkAddLinks,
        deleteLink,
        updatedLink,
        handleAfterUpdateTaskByFormPopup,
        handleAfterDelegateTask,
    };
};
