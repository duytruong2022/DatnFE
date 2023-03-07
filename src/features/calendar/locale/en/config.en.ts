export default {
    calendar: {
        button: {
            thisMonth: 'This month',
        },
    },
    popup: {
        title: 'Config date',
        form: {
            type: {
                workingDay: 'Working day',
                noneWorkingDay: 'None working day',
            },
            repeat: {
                label: 'Repeat',
                onlyThisDate: 'Only this {weekDay}',
                allSameWeekDayThisMonth: 'All {weekDay} in this month',
                allSameWeekDayThisYear: 'All {weekDay} in this year',
                allSameWeekDay: 'All {weekDay}',
            },
            dayType: 'Day type',
            workingDayType: 'Working day type',
            button: {
                save: 'Save',
                cancel: 'Cancel',
                add: 'Add',
                edit: 'Edit',
                delete: 'Delete',
            },
        },
        message: {
            success: 'Config calendar successful',
        },
    },
    dayType: {
        popup: {
            title: {
                create: 'Create day type',
                update: 'Update day type',
            },
            name: {
                label: 'Name',
                placeholder: 'Name',
            },
            timeBlock: {
                start: {
                    label: 'Start',
                    placeholder: 'Start',
                },
                end: {
                    label: 'End',
                    placeholder: 'End',
                },
            },
            totalWorkingTime: {
                label: 'Total working time',
                hour: 'hour',
                hours: 'hours',
                minutes: 'minutes',
                minute: 'minute',
            },
            button: {
                addTimeBlock: 'Add time block',
            },
        },
        message: {
            create: 'Day type has been created',
            update: 'Day type has been updated',
            delete: {
                confirm: {
                    title: 'Confirm delete',
                    message: 'Are you sure to remove this day type?',
                },
                success: 'Day type has been removed',
            },
        },
    },
};
