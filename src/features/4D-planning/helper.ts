import { DATE_TIME_FORMAT } from '@/common/constants';
import ganttChartStorage from '@/common/ganttChartStorage';
import { GanttStatic } from 'dhtmlx-gantt';
import moment from 'moment';
import {
    TaskPercentageCompletion,
    TaskStatus,
    TaskType,
    FullTimeCalendarId,
    GanttColumn,
} from './constants';
import {
    IActivityCodeColumns,
    IActivityCodeValueItem,
    IAdditionalTaskField,
    IBaselineTask,
    ICreateProjectTaskDto,
    IGanttChartTask,
    IGanttGridDisplayingStatus,
    IProjectTask,
    ITaskDragUpdate,
} from './interfaces';

import { projectPlanningModule } from './store';

export const convertToGanttTask = (
    task: IProjectTask,
    additionalTaskFields: IAdditionalTaskField[],
    baselineTask?: IBaselineTask,
): IGanttChartTask & Record<string, any> => {
    const calcTaskProgress = () => {
        switch (task.percentageCompletion) {
            case TaskPercentageCompletion.MANUAL_COMPLETE:
                return task.manualComplete;
            case TaskPercentageCompletion.PHYSICAL_COMPLETE:
                return task.actualPhysicalQuantity / task.physicalQuantity;
            case TaskPercentageCompletion.DURATION_COMPLETE:
                if (!task.actualDuration || !task.remainingDuration) {
                    return 0;
                }
                return (
                    task.actualDuration / (task.actualDuration + task.remainingDuration)
                );
        }
    };
    const calcBLDuration = () => {
        if (!baselineTask) {
            return 0;
        }

        return Math.abs(
            (new Date(baselineTask.baselineFinish).getTime() -
                new Date(baselineTask.baselineStart).getTime()) /
                36e5,
        );
    };

    const calcVarianceBLDuration = () => {
        const baselineDuration = calcBLDuration();
        if (baselineDuration === 0) {
            return 0;
        }

        const originalDuration =
            task.plannedFinish && task.plannedStart
                ? (new Date(task.plannedFinish).getTime() -
                      new Date(task.plannedStart).getTime()) /
                  36e5
                : 0;

        return originalDuration - baselineDuration;
    };

    const calcVarianceBLFinishDate = () => {
        if (!task.finish || !task.baselineFinish) {
            return null;
        }
        return Math.abs(
            (new Date(task.finish).getTime() - new Date(task.baselineFinish).getTime()) /
                36e5,
        );
    };

    const calcVarianceBLStartDate = () => {
        if (!task.start || !task.baselineStart) {
            return null;
        }
        return Math.abs(
            (new Date(task.start).getTime() - new Date(task.baselineStart).getTime()) /
                36e5,
        );
    };

    const calcPhysicalComplete = () => {
        if (!task.actualPhysicalQuantity || !task.physicalQuantity) {
            return null;
        }

        return task.actualPhysicalQuantity / task.physicalQuantity;
    };

    const calcRemainingPhysicalQuantity = () => {
        if (!task.actualPhysicalQuantity || !task.physicalQuantity) {
            return null;
        }

        return task.physicalQuantity - task.actualPhysicalQuantity;
    };

    const calcDurationComplete = (calcByFormula1 = true) => {
        if (calcByFormula1) {
            if (!task.actualDuration || !task.remainingDuration) {
                return null;
            }
            return task.actualDuration / (task.actualDuration + task.remainingDuration);
        }

        if (!task.remainingDuration || !task.plannedDuration) return null;
        return (task.plannedDuration - task.remainingDuration) / task.plannedDuration;
    };

    const calcActivityCodeData = (activityCodeValueId: string): IActivityCodeColumns => {
        const activityCodeList = projectPlanningModule.activityCodeList;
        const displayActivityCode = ganttChartStorage.getDisplayActivityCode();
        let activityCodeValueList: IActivityCodeValueItem[] = [];
        activityCodeList.forEach((activityCode) => {
            activityCodeValueList = activityCodeValueList.concat(
                activityCode.activityCodeValues,
            );
        });

        const activityCodeValue = activityCodeValueList.find((activityCodeValue) => {
            return activityCodeValue._id === activityCodeValueId;
        });
        const activityCode = activityCodeList.find((activityCode) => {
            return activityCode._id === activityCodeValue?.activityCodeId;
        });

        return {
            activityCode: activityCode?.name || null,
            activityCodeValue: activityCodeValue?.name || null,
            activityCodeValueColor: displayActivityCode
                ? activityCodeValue?.colorCode
                : undefined,
        };
    };

    let activityCodeData: IActivityCodeColumns;
    if (task.activityCodeValueId) {
        activityCodeData = calcActivityCodeData(task.activityCodeValueId);
    } else {
        activityCodeData = {
            activityCode: null,
            activityCodeValue: null,
            activityCodeValueColor: undefined,
        };
    }

    const convertToGanttType = (type: TaskType): TaskType => {
        if (type === TaskType.WBS_SUMMARY) {
            return TaskType.PROJECT;
        } else if (
            type === TaskType.MILESTONE ||
            type === TaskType.START_MILESTONE ||
            type === TaskType.FINISH_MILESTONE
        ) {
            return TaskType.MILESTONE;
        }

        return TaskType.STANDARD;
    };
    const result = {
        ...task,
        //some milestones do not have start or end date
        start_date: task?.start ? new Date(task?.start) : new Date(task?.finish),
        end_date: task?.finish ? new Date(task?.finish) : new Date(task?.start),
        type: convertToGanttType(task.taskType),
        id: task._id,
        text: task.name,
        parent: task.parentGanttId ? task.parentGanttId : task?.parentId || 0,
        // duration:
        //     (new Date(task.finish).getTime() - new Date(task.start).getTime()) / 36e5,
        bl_start: task.baselineStart ? new Date(task.baselineStart) : undefined,
        bl_finish: task.baselineFinish ? new Date(task.baselineFinish) : undefined,
        progress: calcTaskProgress(),
        atCompletionDuration: (task.actualDuration || 0) + (task.remainingDuration || 0),
        baselineDuration: calcBLDuration(),
        varianceBLDuration: calcVarianceBLDuration(),
        varianceBLFinishDate: calcVarianceBLFinishDate(),
        varianceBLStartDate: calcVarianceBLStartDate(),
        // freeFloat, critical and totalFloat will calculate when gantt render column in grid
        physicalComplete: calcPhysicalComplete(),
        remainingPhysicalQuantity: calcRemainingPhysicalQuantity(),
        durationComplete: calcDurationComplete(),
        open: true,
        baselineCurrentStart: baselineTask
            ? new Date(baselineTask.baselineStart)
            : undefined,
        baselineCurrentFinish: baselineTask
            ? new Date(baselineTask.baselineFinish)
            : undefined,
        color: activityCodeData.activityCodeValueColor || task.color,
        ...task.additionalFields,
        additionalFields: task.additionalFields,
        calendar_id: task?.calendarId || FullTimeCalendarId,
        duration: task.originalDuration || 0,
        activityCode: activityCodeData.activityCode,
        activityCodeValue: activityCodeData.activityCodeValue,
    };

    if (task.primaryConstraints) {
        Object.assign(result, {
            ...result,
            constraint_type: task.primaryConstraints || undefined,
            constraint_date: moment(task.primaryConstraintDate).toDate(),
        });
    }
    return result;
};

export const convertGanttTaskToTaskDto = (
    task: IGanttChartTask,
): ICreateProjectTaskDto => {
    const calcDurationAndTimelineField = ((): ITaskDragUpdate => {
        const durationAndTimelineField: ITaskDragUpdate = {
            originalDuration: task.originalDuration,
            actualDuration: task.actualDuration,
            remainingDuration: task.remainingDuration,
            plannedDuration: task.plannedDuration,
            finish: moment(task.end_date)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            actualFinish: moment(task.end_date)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            plannedFinish: moment(task.end_date)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            start: moment(task.start_date)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            actualStart: moment(task.start_date)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            plannedStart: moment(task.start_date)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
        };
        const currentDuration =
            task?.calendarDuration ?? moment(task.end_date).diff(task.start_date, 'days');
        if (task.status === TaskStatus.TODO) {
            durationAndTimelineField.originalDuration = currentDuration;
            durationAndTimelineField.remainingDuration = currentDuration;
            durationAndTimelineField.plannedDuration = currentDuration;
            durationAndTimelineField.actualFinish = null;
            durationAndTimelineField.actualStart = null;
        } else if (task.status === TaskStatus.IN_PROGRESS) {
            durationAndTimelineField.originalDuration = currentDuration;
            durationAndTimelineField.remainingDuration = currentDuration;
            durationAndTimelineField.actualFinish = null;
            durationAndTimelineField.plannedStart = moment(task.plannedStart)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON);
        } else {
            durationAndTimelineField.originalDuration = currentDuration;
            durationAndTimelineField.actualDuration = currentDuration;
            durationAndTimelineField.plannedFinish = moment(task.plannedFinish)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON);
            durationAndTimelineField.plannedStart = moment(task.plannedStart)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON);
        }

        if (task.taskType === TaskType.START_MILESTONE) {
            durationAndTimelineField.finish = null;
            durationAndTimelineField.actualFinish = null;
            durationAndTimelineField.plannedFinish = null;
        }

        if (task.taskType === TaskType.FINISH_MILESTONE) {
            durationAndTimelineField.start = null;
            durationAndTimelineField.actualStart = null;
            durationAndTimelineField.plannedStart = null;
        }

        return durationAndTimelineField;
    })();

    return {
        ...calcDurationAndTimelineField,
        parentId: task.parentId ? task.parentId.toString() : null,
        name: task.name,
        status: task.status,
        // primaryConstraintDate:
        //     task.constraint_date && moment(task.constraint_date).isValid()
        //         ? moment(task.constraint_date)
        //               .utc()
        //               .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        //         : null,
        // primaryConstraints: task.constraint_type || null,
        durationType: task.durationType,
        rules: task.rules,
        additionalFields: task.additionalFields,
        calendarId: task.calendarId,
    };
};

/**
 *
 * @param from date from
 * @param hours number of hours to add
 * @param workingTime array of number contains exactly 4 items example [8,12,14,18]
 */
export const calcDateIgnoreNonWorkingTime = (
    from: Date | string | null,
    hours: number,
    workingTime: number[],
): Date | null => {
    if (!from) {
        return null;
    }
    const firstShiftDuration = workingTime[1] - workingTime[0];
    const lastShiftDuration = workingTime[3] - workingTime[2];
    const totalWorkingHourPerDay = lastShiftDuration + firstShiftDuration;
    const numOfDays = Math.floor(hours / totalWorkingHourPerDay);
    const remainHours = hours % totalWorkingHourPerDay;
    return new Date(
        moment(
            new Date(from).getTime() + numOfDays * 24 * 36e5 + remainHours * 36e5,
        ).fmDayString(),
    );
};

export const getVisibleColumnConfiguration = (
    gantt: GanttStatic,
    displayingStatus: IGanttGridDisplayingStatus,
    additionalTaskFieldsDisplaying: IAdditionalTaskField[],
    t: any,
    durationFormatter: (duration: number | null) => string,
) => {
    const activeKeys = Object.keys(displayingStatus).filter(
        (item) => displayingStatus[item as keyof IGanttGridDisplayingStatus],
    );

    const customColumn = [
        {
            name: GanttColumn.CALENDAR_NAME,
            label: t('planning.gantt.columns.calendarName'),
            width: 120,
            resize: true,
            hide: true,
        },
        {
            name: GanttColumn.PARENT_ID,
            label: t('planning.gantt.columns.parentId'),
            width: 150,
            resize: true,
            template: (task: IGanttChartTask) => {
                return task.parent ? task.parent : '';
            },
            hide: true,
        },
        {
            name: GanttColumn.PARENT_NAME,
            label: t('planning.gantt.columns.parentName'),
            width: 150,
            resize: true,
            template: (task: IGanttChartTask) => {
                if (!task.parent) {
                    return '';
                }
                return gantt.getTask(task.parent).name;
            },
            hide: true,
        },
        {
            name: GanttColumn.STATUS,
            label: t('planning.gantt.columns.status'),
            width: 100,
            resize: true,
            template: (task: IGanttChartTask) => {
                return task.status ? t(`planning.gantt.status.${task.status}`) : '';
            },
            hide: true,
            align: 'center',
        },
        {
            name: GanttColumn.TYPE,
            label: t('planning.gantt.columns.type'),
            resize: true,
            width: 150,
            template: (task: IGanttChartTask) => {
                if (!task.type) {
                    return '';
                }
                return t(`planning.task.types.${task.taskType}`);
            },
            hide: true,
            align: 'center',
        },
        // TODO correct the display value later
        {
            name: GanttColumn.START,
            label: t('planning.gantt.columns.start'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (!task.start || task.taskType === TaskType.FINISH_MILESTONE) {
                    return undefined;
                }
                return moment(task.start).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.PLANNED_START,
            label: t('planning.gantt.columns.plannedStart'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (task.status !== TaskStatus.TODO) {
                    return undefined;
                }
                return moment(task.plannedStart).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.ACTUAL_START,
            label: t('planning.gantt.columns.actualStart'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (!task.actualStart) {
                    return undefined;
                }
                return moment(task.actualStart).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.EARLY_START,
            label: t('planning.gantt.columns.earlyStart'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (!task.plannedStart) {
                    return undefined;
                }
                return moment(task.plannedStart).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.LATE_START,
            label: t('planning.gantt.columns.lateStart'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                // TODO move to constant later
                return task.plannedStart && gantt.getTotalSlack(task)
                    ? calcDateIgnoreNonWorkingTime(
                          task.plannedStart,
                          gantt.getTotalSlack(task),
                          [9, 13, 14, 18],
                      )
                    : undefined;
            },
            hide: true,
        },
        {
            name: GanttColumn.BL_START,
            label: t('planning.gantt.columns.blStart'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (!task.baselineStart) {
                    return undefined;
                }
                return moment(task.baselineStart).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.FINISH,
            label: t('planning.gantt.columns.finish'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (!task.finish || task.taskType === TaskType.START_MILESTONE) {
                    return undefined;
                }
                return moment(task.finish).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.ACTUAL_FINISH,
            label: t('planning.gantt.columns.actualFinish'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (!task.actualFinish) {
                    return undefined;
                }
                return moment(task.actualFinish).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.EARLY_FINISH,
            label: t('planning.gantt.columns.earlyFinish'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (!task.plannedFinish) {
                    return undefined;
                }
                return moment(task.plannedFinish).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.LATE_FINISH,
            label: t('planning.gantt.columns.lateFinish'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                // TODO move to constant later
                return task.plannedFinish && gantt.getTotalSlack(task)
                    ? calcDateIgnoreNonWorkingTime(
                          task.plannedFinish,
                          gantt.getTotalSlack(task),
                          [9, 13, 14, 18],
                      )
                    : null;
            },
            hide: true,
        },
        {
            name: GanttColumn.PLANNED_FINISH,
            label: t('planning.gantt.columns.plannedFinish'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (!task.plannedFinish) {
                    return undefined;
                }
                return moment(task.plannedFinish).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.BL_FINISH,
            label: t('planning.gantt.columns.blFinish'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                return task.baselineFinish
                    ? moment(task.baselineFinish).fmDayString()
                    : undefined;
            },
            hide: true,
        },
        {
            name: GanttColumn.PR_CONSTRAINT,
            label: t('planning.gantt.columns.prConstraint'),
            resize: true,
            width: 150,
            align: 'center',
            hide: true,
            template: (task: IGanttChartTask) => {
                return task.primaryConstraints
                    ? t(`planning.gantt.primaryConstraints.${task.primaryConstraints}`)
                    : '';
            },
        },
        {
            name: GanttColumn.PR_CONSTRAINT_DATE,
            label: t('planning.gantt.columns.prConstraintDate'),
            resize: true,
            width: 150,
            template: (task: IGanttChartTask) => {
                if (!task.primaryConstraintDate) {
                    return undefined;
                }
                return moment(task.primaryConstraintDate).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.EXPECTED_FINISH,
            label: t('planning.gantt.columns.expectedFinish'),
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                if (!task.expectedFinish) {
                    return undefined;
                }
                return moment(task.expectedFinish).fmDayString();
            },
            hide: true,
        },
        {
            name: GanttColumn.DURATION_TYPE,
            label: t('planning.gantt.columns.durationType'),
            resize: true,
            width: 150,
            template: (task: IGanttChartTask) => {
                return task.durationType
                    ? t(`planning.gantt.durationTypes.${task.durationType}`)
                    : '';
            },
            hide: true,
        },
        {
            name: GanttColumn.ORIGINAL_DURATION,
            label: t('planning.gantt.columns.originalDuration'),
            resize: true,
            width: 100,
            hide: true,
            align: 'center',
        },
        {
            name: GanttColumn.ACTUAL_DURATION,
            label: t('planning.gantt.columns.actualDuration'),
            resize: true,
            width: 100,
            align: 'center',
            hide: true,
        },
        {
            name: GanttColumn.REMAINING_DURATION,
            label: t('planning.gantt.columns.remainingDuration'),
            resize: true,
            width: 120,
            align: 'center',
            hide: true,
        },
        {
            name: GanttColumn.PLANNED_DURATION,
            label: t('planning.gantt.columns.plannedDuration'),
            resize: true,
            width: 120,
            hide: true,
            align: 'center',
        },
        {
            name: GanttColumn.AT_COMPLETE_DURATION,
            label: t('planning.gantt.columns.atCompleteDuration'),
            align: 'center',
            resize: true,
            width: 120,
            template: (task: IGanttChartTask) => {
                return (task.actualDuration || 0) + (task.remainingDuration || 0);
            },
            hide: true,
        },
        {
            name: GanttColumn.BL_DURATION,
            label: t('planning.gantt.columns.blDuration'),
            resize: true,
            align: 'center',
            width: 100,
            template: (task: IGanttChartTask) => {
                return durationFormatter(task.baselineDuration);
            },
            hide: true,
        },
        {
            name: GanttColumn.VBL_DURATION,
            label: t('planning.gantt.columns.VBLDuration'),
            resize: true,
            align: 'center',
            width: 120,
            template: (task: IGanttChartTask) => {
                return durationFormatter(task.varianceBLDuration);
            },
            hide: true,
        },
        {
            name: GanttColumn.VBL_FINISH_DATE,
            label: t('planning.gantt.columns.VBLFinishDate'),
            resize: true,
            width: 130,
            template: (task: IGanttChartTask) => {
                if (!task.finish || !task.baselineFinish) {
                    return undefined;
                }
                return moment(task.finish).diff(task.baselineFinish, 'days');
            },
            hide: true,
        },
        {
            name: GanttColumn.VBL_START_DATE,
            label: t('planning.gantt.columns.VBLStartDate'),
            resize: true,
            width: 130,
            template: (task: IGanttChartTask) => {
                if (!task.start || !task.baselineStart) {
                    return undefined;
                }
                return moment(task.start).diff(task.baselineStart, 'days');
            },
            hide: true,
        },
        {
            name: GanttColumn.FREE_FLOAT,
            label: t('planning.gantt.columns.freeFloat'),
            resize: true,
            width: 70,
            align: 'center',
            template: (task: IGanttChartTask) => {
                return gantt.getFreeSlack(task);
            },
            hide: true,
        },
        {
            name: GanttColumn.TOTAL_FLOAT,
            label: t('planning.gantt.columns.totalFloat'),
            resize: true,
            width: 70,
            align: 'center',
            template: (task: IGanttChartTask) => {
                return gantt.getTotalSlack(task);
            },
            hide: true,
        },
        {
            name: GanttColumn.CRITICAL,
            label: t('planning.gantt.columns.critical'),
            resize: true,
            width: 100,
            align: 'center',
            template: (task: IGanttChartTask) => {
                const totalSlack = gantt.getTotalSlack(task);
                if (totalSlack < 0 && totalSlack)
                    return `<input type="checkbox" id="critical-checkbox-${task.id}" onClick="return false;" checked>`;
                return `<input type="checkbox" id="critical-checkbox-${task.id}" onClick="return false;">`;
            },
            hide: true,
        },
        {
            name: GanttColumn.PERCENT_COMPLETE_TYPE,
            label: t('planning.gantt.columns.percentCompleteType'),
            resize: true,
            width: 150,
            template: (task: IGanttChartTask) => {
                return task.percentageCompletion
                    ? t(
                          `planning.gantt.percentCompleteTypes.${task.percentageCompletion}`,
                      )
                    : '';
            },
            hide: true,
        },
        {
            name: GanttColumn.PHYSICAL_PERCENTAGE,
            label: t('planning.gantt.columns.physicalPercentage'),
            align: 'center',
            resize: true,
            template: (task: IGanttChartTask) => {
                if (task.actualPhysicalQuantity && task.physicalQuantity) {
                    return task.actualPhysicalQuantity / task.physicalQuantity;
                }
                return undefined;
            },
            width: 150,
            hide: true,
        },
        {
            name: GanttColumn.DURATION_PERCENTAGE,
            label: t('planning.gantt.columns.durationPercentage'),
            resize: true,
            width: 150,
            align: 'center',
            template: (task: IGanttChartTask) => {
                // TODO add formular2 later
                if (task.actualDuration && task.remainingDuration) {
                    return (
                        task.actualDuration /
                        (task.actualDuration + task.remainingDuration)
                    );
                }
                return undefined;
            },
            hide: true,
        },
        {
            name: GanttColumn.MANUAL_PERCENTAGE,
            label: t('planning.gantt.columns.manualPercentage'),
            resize: true,
            width: 150,
            hide: true,
            align: 'center',
            template: (task: IGanttChartTask) => {
                return task.manualComplete;
            },
        },
        {
            name: GanttColumn.PHYSICAL_UNIT,
            label: t('planning.gantt.columns.physicalUnit'),
            resize: true,
            width: 130,
            align: 'center',
            template: (task: IGanttChartTask) => {
                return task.physicalQuantity
                    ? t(
                          `planning.gantt.physicalQuantityUnit.${task.physicalQuantityUnit}`,
                      )
                    : '';
            },
            hide: true,
        },
        {
            name: GanttColumn.PHYSICAL_QUANTITY,
            label: t('planning.gantt.columns.physicalQuantity'),
            resize: true,
            align: 'center',
            width: 130,
            hide: true,
        },
        {
            name: GanttColumn.ACTUAL_PHYSICAL_QUANTITY,
            label: t('planning.gantt.columns.actualPhysicalQuantity'),
            resize: true,
            align: 'center',
            width: 150,
            hide: true,
        },
        {
            name: GanttColumn.REMAIN_PHYSICAL_QUANTITY,
            label: t('planning.gantt.columns.remainPhysicalQuantity'),
            resize: true,
            align: 'center',
            width: 170,
            template: (task: IGanttChartTask) => {
                return task.remainingPhysicalQuantity
                    ? task.remainingPhysicalQuantity
                    : undefined;
            },
            hide: true,
        },
        {
            name: GanttColumn.RULES,
            label: t('planning.gantt.columns.rules'),
            resize: true,
            align: 'center',
            width: 100,
            hide: true,
        },
        {
            name: GanttColumn.APPEARANCE_PROFILE,
            label: t('planning.gantt.columns.appearanceProfile'),
            resize: true,
            width: 100,
            hide: true,
        },
        {
            name: GanttColumn.RESOURCE_3D,
            label: t('planning.gantt.columns.resouce3D'),
            align: 'center',
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                return task.resourceIds?.length ? task.resourceIds?.length : '';
            },

            hide: true,
        },
        {
            name: GanttColumn.RESOURCE_GROUP,
            label: t('planning.gantt.columns.resourceGroup'),
            align: 'center',
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                return task.resourceGroupIds?.length ? task.resourceGroupIds?.length : '';
            },

            hide: true,
        },
        {
            name: GanttColumn.ACTIVITY_CODE,
            label: t('planning.gantt.columns.activityCode'),
            align: 'center',
            resize: true,

            template: (task: IGanttChartTask) => {
                return task.activityCode;
            },
            width: 120,
            hide: true,
        },
        {
            name: GanttColumn.ACTIVITY_CODE_VALUE,
            label: t('planning.gantt.columns.activityCodeValue'),
            align: 'center',
            resize: true,
            width: 100,
            template: (task: IGanttChartTask) => {
                return task.activityCodeValue;
            },
            hide: true,
        },
    ];

    customColumn.forEach((column) => {
        if (activeKeys.includes(column.name)) {
            column.hide = false;
        }
    });

    const allColumns = [
        {
            name: 'name',
            label: t('planning.gantt.columns.name'),
            tree: true,
            width: '200',
            align: 'left',
            template: (task: IGanttChartTask & Record<string, any>) => {
                return `<div class="task-name-container"><span class="task-name">${
                    task.name
                }</span><img class="rename-task-button" src="${require('@/assets/icons/edit.svg')}"  task-id="${
                    task._id
                }" /></div>`;
            },
            resize: true,
        },
        {
            name: 'id',
            label: t('planning.gantt.columns.id'),
            width: 150,
            resize: true,
        },
        ...customColumn,
        ...additionalTaskFieldsDisplaying.map((field) => ({
            name: field._id,
            width: 100,
            resize: true,
            label: field.name,
            align: 'center',
            template: (task: IGanttChartTask & Record<string, any>) => {
                if (!isNaN(task[field.name])) {
                    return task[field.name];
                }
                // value here is date string
                if (!isNaN(Date.parse(task[field.name] as string))) {
                    return moment(task[field.name]).fmFullTimeString();
                }
                return task[field.name];
            },
        })),
        {
            name: 'add',
            width: 44,
        },
    ];

    const orderColumn = ganttChartStorage.getGanttOrderColumn();
    if (!orderColumn) {
        const newOrderColumn = new Map<string, number>();
        allColumns.forEach((column, index) => {
            newOrderColumn.set(column.name, index);
        });
        ganttChartStorage.setGanttOrderColumn(newOrderColumn);
    }

    const columnAfterOrder = allColumns
        .map((column) => {
            return {
                ...column,
                order: orderColumn ? orderColumn.get(column.name) ?? 0 : 0,
            };
        })
        .sort((a, b) => {
            return a.order - b.order;
        });

    return columnAfterOrder;
};

export const getBaselineTask = (taskId: string): IBaselineTask | undefined => {
    const baselineIdSelected = projectPlanningModule.baselineIdSelected;
    const baselineSelected = projectPlanningModule.baselineList.find((baseline) => {
        return baseline._id === baselineIdSelected;
    });
    const baselineTask = baselineSelected?.baselineTasks.find((baselineTask) => {
        return baselineTask.taskId === taskId;
    });

    return baselineTask;
};
