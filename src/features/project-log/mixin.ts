import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-class-component';
import {
    COORDINATES,
    PLACE,
    projectAttributes,
    projectProfileAttributes,
    ProjectLogActions,
    projectGroupAttributes,
    userAttributes,
    groupAttributes,
    ProjectLogHistoryActionOptions,
    ProjectLogTransactionActionOptions,
    ProjectLogType,
    DateRangeTypes,
} from './constant';
import { IProjectLog } from './interfaces';

export class ProjectLogMixins extends mixins(UtilMixins) {
    dateRangeTypes = DateRangeTypes;
    projectLogHistoryActionOptions = ProjectLogHistoryActionOptions;
    projectLogTransactionActionOptions = ProjectLogTransactionActionOptions;
    projectLogType = ProjectLogType;

    parseProjectLogValue(projectLog: IProjectLog) {
        let oldData = '';
        let newData = '';
        switch (projectLog.action) {
            case ProjectLogActions.CREATE_PROJECT:
                projectAttributes.forEach((key) => {
                    if (key === PLACE) {
                        newData += `<b>${key}</b>: ${
                            this.getDisplayAddress(
                                projectLog.newData[COORDINATES] as string,
                            ) || ''
                        }<br/>`;
                    } else {
                        newData =
                            newData +
                            `<b>${key}</b>: ${projectLog.newData[key] || ''}<br/>`;
                    }
                });
                break;
            case ProjectLogActions.UPDATE_PROJECT:
                projectAttributes.forEach((key) => {
                    if (key === PLACE) {
                        newData += `<b>${key}</b>: ${
                            this.getDisplayAddress(
                                projectLog.newData[COORDINATES] as string,
                            ) || ''
                        }<br/>`;
                        oldData += `<b>${key}</b>: ${
                            this.getDisplayAddress(
                                projectLog.oldData[COORDINATES] as string,
                            ) || ''
                        }<br/>`;
                    } else {
                        newData += `<b>${key}</b>: ${projectLog.newData[key] || ''}<br/>`;
                        oldData += `<b>${key}</b>: ${projectLog.oldData[key] || ''}<br/>`;
                    }
                });
                break;
            case ProjectLogActions.DELETE_PROJECT:
                projectAttributes.forEach((key) => {
                    if (key === PLACE) {
                        oldData += `<b>${key}</b>: ${
                            this.getDisplayAddress(
                                projectLog.oldData[COORDINATES] as string,
                            ) || ''
                        }<br/>`;
                    } else {
                        oldData += `<b>${key}</b>: ${projectLog.oldData[key] || ''}<br/>`;
                    }
                });
                break;
            case ProjectLogActions.CREATE_PROJECT_PROFILE:
                projectProfileAttributes.forEach((key) => {
                    newData =
                        newData +
                        `<b>${key}</b>: ${
                            (projectLog.newData[key] as string)?.toString() || ''
                        }<br/>`;
                });
                break;
            case ProjectLogActions.UPDATE_PROJECT_PROFILE:
                projectProfileAttributes.forEach((key) => {
                    newData =
                        newData +
                        `<b>${key}</b>: ${
                            (projectLog.newData[key] as string)?.toString() || ''
                        }<br/>`;
                    oldData =
                        oldData +
                        `<b>${key}</b>: ${
                            (projectLog.oldData[key] as string)?.toString() || ''
                        }<br/>`;
                });
                break;
            case ProjectLogActions.DELETE_PROJECT_PROFILE:
                projectProfileAttributes.forEach((key) => {
                    oldData =
                        oldData +
                        `<b>${key}</b>: ${
                            (projectLog.oldData[key] as string)?.toString() || ''
                        }<br/>`;
                });
                break;
            case ProjectLogActions.CREATE_PROJECT_GROUP:
                projectGroupAttributes.forEach((key) => {
                    newData =
                        newData + `<b>${key}</b>: ${projectLog.newData[key] || ''}<br/>`;
                });
                break;
            case ProjectLogActions.UPDATE_PROJECT_GROUP:
                projectGroupAttributes.forEach((key) => {
                    newData =
                        newData + `<b>${key}</b>: ${projectLog.newData[key] || ''}<br/>`;
                    oldData =
                        oldData + `<b>${key}</b>: ${projectLog.oldData[key] || ''}<br/>`;
                });
                break;
            case ProjectLogActions.DELETE_PROJECT_GROUP:
                projectGroupAttributes.forEach((key) => {
                    oldData =
                        oldData + `<b>${key}</b>: ${projectLog.oldData[key] || ''}<br/>`;
                });
                break;
            case ProjectLogActions.CREATE_USER:
            case ProjectLogActions.ASSIGN_TO_PROJECT_USER:
                userAttributes.forEach((key) => {
                    newData =
                        newData + `<b>${key}</b>: ${projectLog.newData[key] || ''}<br/>`;
                });
                break;
            case ProjectLogActions.UPDATE_USER:
                userAttributes.forEach((key) => {
                    newData =
                        newData + `<b>${key}</b>: ${projectLog.newData[key] || ''}<br/>`;
                    oldData =
                        oldData + `<b>${key}</b>: ${projectLog.oldData[key] || ''}<br/>`;
                });
                break;
            case ProjectLogActions.REMOVE_FROM_PROJECT_USER:
                userAttributes.forEach((key) => {
                    oldData =
                        oldData + `<b>${key}</b>: ${projectLog.oldData[key] || ''}<br/>`;
                });
                break;
            case ProjectLogActions.ASSIGN_TO_PROJECT_GROUP:
                groupAttributes.forEach((key) => {
                    newData =
                        newData + `<b>${key}</b>: ${projectLog.newData[key] || ''}<br/>`;
                });
                break;

            case ProjectLogActions.REMOVE_FROM_PROJECT_GROUP:
                groupAttributes.forEach((key) => {
                    oldData =
                        oldData + `<b>${key}</b>: ${projectLog.oldData[key] || ''}<br/>`;
                });
                break;
            default:
                break;
        }
        return { ...projectLog, oldData, newData };
    }
}
