<template>
    <el-dialog
        :title="$t(`planning.importXML.importXML`)"
        width="40%"
        @closed="handleClosed"
        @opened="handleOpened"
        destroy-on-close
        v-model="isShowImportXmlDetail"
    >
        <div class="row">
            <div class="import-option">
                <div class="import-option-title">
                    {{ $t('planning.importXML.importOptionTitle') }}
                </div>
                <el-radio-group v-model="importXmlOption">
                    <el-radio
                        class="checkbox"
                        :label="importOption.UNDER_SELECTED_TASK"
                        :disabled="selectedTaskIds?.length !== 1"
                    >
                        {{ $t('planning.importXML.underSelectedTask') }}
                    </el-radio>
                    <el-radio
                        class="checkbox"
                        :label="importOption.END_OF_PROJECT"
                        :disabled="planning?.delegatedFromPlanningId"
                        checked
                    >
                        {{ $t('planning.importXML.endOfProject') }}
                    </el-radio>
                    <el-radio
                        class="checkbox"
                        :label="importOption.REPLACE_PLANNING"
                        :disabled="planning?.p6Id !== importProject?.p6Id"
                    >
                        {{ $t('planning.importXML.replacePlanning') }}
                    </el-radio>
                </el-radio-group>
            </div>
            <div class="col-xl-12">
                <BaseInputText
                    :isRequired="true"
                    :label="$t('planning.planningForm.labels.planningId')"
                    v-model:value="importProject.p6Id"
                    :placeholder="$t('planning.planningForm.placeholders.planningId')"
                    :isDisabled="true"
                />
            </div>
            <div class="col-xl-6">
                <BaseInputText
                    :isRequired="true"
                    :label="$t('planning.planningForm.labels.name')"
                    v-model:value="importProject.name"
                    :placeholder="$t('planning.planningForm.placeholders.name')"
                    :isDisabled="true"
                />
            </div>
            <div class="col-xl-6">
                <BaseDatePicker
                    :isRequired="true"
                    :label="$t('planning.planningForm.labels.dataDate')"
                    v-model:value="importProject.dataDate"
                    :placeholder="$t('planning.planningForm.placeholders.dataDate')"
                    :isDisabled="true"
                />
            </div>
            <div class="import-title">
                {{ $t('planning.importXML.importObjectOption') }}
            </div>
            <div class="import-object-option">
                <div class="row import-object-option-title">
                    <div class="col-6">
                        {{ $t('planning.importXML.object.object') }}
                    </div>
                    <div class="col-6">
                        {{ $t('planning.importXML.object.command') }}
                    </div>
                </div>
                <div
                    class="row"
                    v-for="importObject in Object.keys(importObjectOption)"
                    :key="importObject"
                >
                    <div class="col-6 object">
                        {{ $t(`planning.importXML.object.${importObject}`) }}
                    </div>
                    <div class="col-6">
                        <BaseSingleSelect
                            :options="importObjectOptions"
                            v-model:value="importObjectOption[importObject]"
                            :clearable="false"
                        />
                    </div>
                </div>
                <div class="import-object-option-button">
                    <el-button @click="onClickDefault" class="button" type="primary">
                        {{ $t('planning.buttons.default') }}
                    </el-button>
                    <el-button @click="onClickSkipAll" class="button" type="primary">
                        {{ $t('planning.buttons.skipAll') }}
                    </el-button>
                </div>
            </div>
        </div>
        <div class="import-button">
            <el-button @click="handleClosed" class="button" type="danger">
                {{ $t('planning.buttons.cancel') }}
            </el-button>
            <el-button @click="onClickImport" class="button" type="success">
                {{ $t('planning.buttons.import') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script>
import {
    parseLanguageSelectOptions,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { mixins, Options } from 'vue-class-component';
import {
    DefaultNameTask,
    ImportObjectOption,
    ImportObjectOptions,
    ImportOption,
} from '../../constants';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';

@Options({})
export default class ImportXmlDetail extends mixins(Planning4DMixin) {
    importXmlOption = ImportOption.END_OF_PROJECT;
    importObjectOption = {
        tasks: ImportObjectOption.IMPORT,
        links: ImportObjectOption.IMPORT,
        resources: ImportObjectOption.IMPORT,
    };

    get importProject() {
        return projectPlanningModule.importProject;
    }

    get planning() {
        return projectPlanningModule.planning;
    }

    get isShowImportXmlDetail() {
        return projectPlanningModule.isShowImportXmlDetail;
    }

    get selectedTaskIds() {
        return projectPlanningModule.selectedTaskIdList;
    }

    get importObjectOptions() {
        return parseLanguageSelectOptions(ImportObjectOptions);
    }

    handleClosed() {
        projectPlanningModule.setIsShowImportXmlDetail(false);
    }

    handleOpened() {
        this.importXmlOption = !this.planning?.delegatedFromPlanningId
            ? ImportOption.END_OF_PROJECT
            : this.planning?.p6Id === projectPlanningModule.importProject?.p6Id
            ? ImportOption.REPLACE_PLANNING
            : ImportOption.UNDER_SELECTED_TASK;
        this.importObjectOption = {
            tasks: ImportObjectOption.IMPORT,
            links: ImportObjectOption.IMPORT,
            resources: ImportObjectOption.IMPORT,
        };
    }

    onClickDefault() {
        this.importObjectOption = {
            tasks: ImportObjectOption.IMPORT,
            links: ImportObjectOption.IMPORT,
            resources: ImportObjectOption.IMPORT,
        };
    }

    onClickSkipAll() {
        this.importObjectOption = {
            tasks: ImportObjectOption.SKIP,
            links: ImportObjectOption.SKIP,
            resources: ImportObjectOption.SKIP,
        };
    }

    async onClickImport() {
        const importProjectPlanning = {
            project: projectPlanningModule.importProject,
            isReplace: this.importXmlOption === ImportOption.REPLACE_PLANNING,
        };

        if (
            this.importXmlOption === ImportOption.END_OF_PROJECT ||
            this.importXmlOption === ImportOption.REPLACE_PLANNING
        ) {
            Object.assign(importProjectPlanning, {
                parentTaskId: projectPlanningModule.planning?.tasks.find((taskStore) => {
                    return (
                        taskStore.parentId === null &&
                        taskStore.name === DefaultNameTask.CONTENT
                    );
                })._id,
            });
        } else {
            Object.assign(importProjectPlanning, {
                parentTaskId: projectPlanningModule.planning?.tasks.find((taskStore) => {
                    return (
                        taskStore._id ===
                        projectPlanningModule.taskPopupParams.selectedTaskId
                    );
                })._id,
            });
        }

        if (this.importObjectOption.tasks === ImportObjectOption.IMPORT) {
            Object.assign(importProjectPlanning, {
                tasks: projectPlanningModule.importTasks.map((task) => {
                    const customFields =
                        projectPlanningModule.importTaskCustomFields.find(
                            (item) => item.p6Id === task.p6Id,
                        );
                    if (customFields) {
                        return {
                            ...task,
                            ...customFields,
                        };
                    } else {
                        return { ...task };
                    }
                }),
            });
        }

        if (this.importObjectOption.links === ImportObjectOption.IMPORT) {
            Object.assign(importProjectPlanning, {
                links: projectPlanningModule.importLinks,
            });
        }

        if (this.importObjectOption.resources === ImportObjectOption.IMPORT) {
            Object.assign(importProjectPlanning, {
                resources: projectPlanningModule.importResources,
            });
        }

        const response = await projectPlanningService.importXML(
            importProjectPlanning,
            projectPlanningModule.planningId,
        );
        projectPlanningModule.setIsShowImportXmlDetail(false);

        if (response.success) {
            this.$emit('importXMLSuccess');
        } else {
            showErrorNotificationFunction(response.message);
        }
    }
}
</script>
<style scoped lang="scss">
.import-option {
    margin-bottom: 15px;
    .import-option-title {
        font-size: 15px;
        font-weight: 700;
    }
}

.import-title {
    margin-bottom: 15px;
    font-size: 15px;
    font-weight: 700;
}

.import-object-option {
    width: 90%;
    margin: 0 5%;
    padding: 33px 20px 0px 20px;
    border: 2px solid rgb(235, 238, 245);
    border-radius: 9px;
    .import-object-option-title {
        text-align: center;
        font-size: 15px;
        font-weight: 700;
        padding-bottom: 33px;
    }
}
.import-object-option-button {
    padding: 20px;
    .button {
        width: 100px;
    }
}
.object {
    padding: 12px !important;
}
.import-button {
    padding: 20px 0 0 0;
    text-align: right;
}
</style>
