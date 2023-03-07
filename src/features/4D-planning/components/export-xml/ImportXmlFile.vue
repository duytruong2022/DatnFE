<template>
    <BaseImportFile
        :isShowImportForm="isShowImportXmlFileForm"
        :isShowDownloadTemplateLink="false"
        @handleSaveContent="onClickButtonImport"
        @changeFile="handleChangeFile"
        @onCloseImportForm="closePopup"
        @download="handleDownloadImportUserFile"
        :title="$t(`planning.importXML.importXMLFile`)"
        :error="$t(`${importErrorMessage}`)"
    />
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-property-decorator';
import { Options } from 'vue-class-component';
import {
    AccessModules,
    MAX_FILE_SIZE_IN_BYTE,
    XML_ACCEPTED_FILE_TYPES,
} from '@/common/constants';
import { authModule } from '@/features/auth/store';
import { projectModule } from '@/features/project/store';
import { projectPlanningModule } from '../../store';
import convert from 'xml-js';
import { convertImportXmlProjects, XML_TYPE } from '../../constants';
import { IImportTaskCustomField } from '../../interfaces';

@Options({})
export default class ImportXmlForm extends mixins(UtilMixins) {
    importErrorMessage = '';

    get isShowImportXmlFileForm(): boolean {
        return projectPlanningModule.isShowImportXmlFileForm;
    }

    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    get selectedProjectId(): string | null {
        return projectModule.selectedProjectId;
    }

    async validateFileData(file: File): Promise<boolean> {
        const isValidFileSize = file?.size < MAX_FILE_SIZE_IN_BYTE;
        if (!file) {
            this.importErrorMessage = this.$t('common.importFiles.rules.empty') as string;
            return false;
        }
        if (file.name) {
            const finalFileName = file.name.split('.');
            if (
                !XML_ACCEPTED_FILE_TYPES.includes(finalFileName[finalFileName.length - 1])
            ) {
                this.importErrorMessage = this.$t(
                    'common.importFiles.rules.invalidType.xml',
                ) as string;
                return false;
            }
        }
        if (!isValidFileSize) {
            this.importErrorMessage = this.$t(
                'common.importFiles.rules.tooBig',
            ) as string;
            return false;
        }
        return true;
    }

    handleChangeFile(): void {
        this.importErrorMessage = '';
    }

    async onClickButtonImport(fileContent: string, file: File) {
        if (await this.validateFileData(file)) {
            const fileJson = JSON.parse(
                convert.xml2json(fileContent, {
                    compact: true,
                    alwaysChildren: true,
                    ignoreComment: true,
                    nativeType: true,
                }),
            );

            let project: Record<string, string> = {};
            if (fileJson?.Project) {
                convertImportXmlProjects.forEach((convertImportXmlProject) => {
                    project[convertImportXmlProject.name] =
                        fileJson?.Project[convertImportXmlProject[XML_TYPE.MSP]]?._text;
                });
                projectPlanningModule.setImportProject(project);
            } else if (fileJson.APIBusinessObjects) {
                let selectProject: Record<string, any> = {};
                if (Array.isArray(fileJson?.APIBusinessObjects?.Project)) {
                    selectProject = fileJson?.APIBusinessObjects?.Project?.find(
                        (project: Record<string, Record<string, string>>) =>
                            !project._attributes?.external,
                    );
                } else {
                    selectProject = fileJson?.APIBusinessObjects?.Project;
                }

                const mapImportTaskIdToGanttId = new Map<string, string>();
                if (selectProject) {
                    convertImportXmlProjects.forEach((convertImportXmlProject) => {
                        project[convertImportXmlProject.name] =
                            selectProject[convertImportXmlProject[XML_TYPE.P6]]?._text ||
                            selectProject[convertImportXmlProject[XML_TYPE.P6]]?._cdata;
                    });
                    const importTaskIds = [];
                    const importTaskCustomFields: IImportTaskCustomField[] = [];
                    if (Array.isArray(selectProject?.WBS)) {
                        selectProject?.WBS?.forEach(
                            (task: Record<string, Record<string, string>>) => {
                                importTaskIds.push(task?.ObjectId?._text?.toString());
                                mapImportTaskIdToGanttId.set(
                                    task?.ObjectId?._text?.toString(),
                                    task?.Code?._text?.toString(),
                                );
                            },
                        );
                    } else {
                        importTaskIds.push(
                            selectProject?.WBS?.ObjectId?._text?.toString(),
                        );
                        mapImportTaskIdToGanttId.set(
                            selectProject?.WBS?.ObjectId?._text?.toString(),
                            selectProject?.WBS?.Code?._text?.toString(),
                        );
                    }
                    if (Array.isArray(selectProject?.Activity)) {
                        selectProject?.Activity?.forEach(
                            (task: Record<string, Record<string, string>>) => {
                                importTaskIds.push(task?.ObjectId?._text?.toString());
                                mapImportTaskIdToGanttId.set(
                                    task?.ObjectId?._text?.toString(),
                                    task?.Id?._text?.toString(),
                                );
                                importTaskCustomFields.push({
                                    p6Id: task?.Id?._text?.toString(),
                                    milestoneType: task?.milestoneType?._text.toString(),
                                    color: task?.color?._text.toString(),
                                    primaryConstraints:
                                        task?.primaryConstraints?._text.toString(),
                                    primaryConstraintDate:
                                        task?.PrimaryConstraintDate?._text.toString(),
                                });
                            },
                        );
                    } else {
                        importTaskIds.push(
                            selectProject?.Activity?.ObjectId?._text?.toString(),
                        );
                        importTaskCustomFields.push({
                            p6Id: selectProject?.Activity?.Id?._text?.toString(),
                            milestoneType:
                                selectProject?.Activity?.milestoneType?._text.toString(),
                            color: selectProject?.Activity?.color?._text.toString(),
                            primaryConstraints:
                                selectProject?.Activity?.primaryConstraints?._text.toString(),
                            primaryConstraintDate:
                                selectProject?.Activity?.PrimaryConstraintDate?._text.toString(),
                        });
                        mapImportTaskIdToGanttId.set(
                            selectProject?.Activity?.ObjectId?._text?.toString(),
                            selectProject?.Activity?.Id?._text?.toString(),
                        );
                    }
                    projectPlanningModule.setImportTaskIds(importTaskIds);
                    projectPlanningModule.setImportTaskCustomFields(
                        importTaskCustomFields,
                    );
                }
                projectPlanningModule.setImportProject(project);
                this.$emit('importP6File', file, mapImportTaskIdToGanttId);
            }
        }
    }

    closePopup(): void {
        this.importErrorMessage = '';
        projectPlanningModule.setIsShowXmlFileForm(false);
    }
    created() {
        projectPlanningModule.setImportTasks([]);
        projectPlanningModule.setImportLinks([]);
        projectPlanningModule.setImportResources([]);
    }
}
</script>

<style lang="scss" scoped></style>
