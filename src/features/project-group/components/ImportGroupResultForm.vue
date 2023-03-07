<template>
    <BaseRightDrawer
        :title="$t(`projectGroup.title.importGroupResult`)"
        v-model:value="isShowImportGroupResultPopUp"
        size="60%"
        custom-class="confirm-dialog"
        @onClosed="closePopup"
        @onOpened="openPopup"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button
                    :disabled="isDisabledSaveButton || hasError"
                    type="primary"
                    @click="onClickSaveButton"
                >
                    {{ $t('projectGroup.groupForm.button.save') }}
                </el-button>
            </div>
            <BaseTableLayout
                :data="importGroupList"
                :totalItems="importGroupList.length"
                :isShowPagination="false"
            >
                <template #table-columns>
                    <el-table-column
                        :label="$t('projectGroup.groupForm.name.label')"
                        min-width="170"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.name"
                                placement="top"
                                v-if="errors[scope.row?.index]?.name"
                            >
                                <div class="error w-100">{{ scope.row.name }}&nbsp;</div>
                            </el-tooltip>
                            <div class="w-100" v-else>{{ scope.row.name }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('projectGroup.groupForm.projectProfile.label')"
                        min-width="200"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.projectProfile"
                                placement="top"
                                v-if="errors[scope.row?.index]?.projectProfile"
                            >
                                <div class="error w-100">
                                    {{ scope.row.projectProfile }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div class="w-100" v-else>
                                {{ scope.row.projectProfile }}&nbsp;
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('projectGroup.groupForm.description.label')"
                        min-width="300"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.description"
                                placement="top"
                                v-if="errors[scope.row?.index]?.description"
                            >
                                <div class="error w-100">
                                    {{ scope.row.description }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div class="w-100" v-else>
                                {{ scope.row.description }}&nbsp;
                            </div>
                        </template>
                    </el-table-column>
                </template>
            </BaseTableLayout>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { UtilMixins } from '@/mixins/utilMixins';
import {
    AccessModules,
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from '@/common/constants';
import { ElLoading } from 'element-plus';
import { projectGroupModule } from '../store';
import { projectGroupService } from '../services/api.services';
import {
    parseImportErrors,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { authModule } from '@/features/auth/store';
import { IBulkCreateProjectGroup } from '../interfaces';
import { projectModule } from '@/features/project/store';

@Options({})
export default class ImportGroupResultForm extends mixins(UtilMixins) {
    isDisabledSaveButton = false;

    errors = {};
    hasError = false;

    get importGroupList(): IBulkCreateProjectGroup[] {
        return projectGroupModule.importGroups;
    }

    get isShowImportGroupResultPopUp(): boolean {
        return projectGroupModule.isShowImportGroupResultPopUp;
    }

    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    validateData(): void {
        this.hasError = false;
        this.errors = {};
        projectGroupModule.importGroups.forEach((importGroup) => {
            if (importGroup.index !== undefined) {
                const nameError = this.validateName(importGroup.name, importGroup.index);
                const projectProfilesError = this.validateProjectProfile(
                    importGroup.projectProfile,
                );
                const descriptionError = this.validateDescription(
                    importGroup.description,
                );

                this.errors = {
                    ...this.errors,
                    [importGroup.index]: {
                        name: nameError,
                        projectProfile: projectProfilesError,
                        description: descriptionError,
                    },
                };

                if (nameError || projectProfilesError || descriptionError) {
                    this.hasError = true;
                }
            }
        });
    }

    validateName(name: string, index: number): string {
        if (!name) {
            return this.$t('projectGroup.importGroups.name.required');
        }
        if (name?.length > INPUT_TEXT_MAX_LENGTH) {
            return this.$t('projectGroup.importGroups.name.maxLength');
        }
        if (
            this.importGroupList.some(
                (importGroup) =>
                    importGroup.name.toLocaleLowerCase() === name.toLowerCase() &&
                    importGroup.index !== index,
            )
        ) {
            return this.$t('projectGroup.importGroups.name.uniqueError');
        }
        return '';
    }

    validateProjectProfile(projectProfile: string): string {
        if (!projectProfile) {
            return '';
        }
        if (projectProfile?.length > INPUT_TEXT_MAX_LENGTH) {
            return this.$t('projectGroup.importGroups.projectProfile.maxLength');
        }
        return '';
    }

    validateDescription(description: string): string {
        if (!description) {
            return this.$t('projectGroup.importGroups.description.required');
        }
        if (description.length > TEXTAREA_MAX_LENGTH) {
            return this.$t('projectGroup.importGroups.description.maxLength');
        }
        return '';
    }

    async onClickSaveButton(): Promise<void> {
        this.isDisabledSaveButton = true;

        const response = await projectGroupService.importGroups({
            groups: this.importGroupList,
            accessModule: this.selectedAccessModule,
            projectId: projectModule.selectedProjectId,
        });

        if (response.success) {
            const importGroupResponses = response.data.results;

            if (
                !Object.keys(importGroupResponses).find(
                    (key) => !importGroupResponses[key].isValid,
                )
            ) {
                showSuccessNotificationFunction(
                    this.$t('projectGroup.message.importGroupSuccess') as string,
                );
                projectGroupModule.setIsShowImportGroupResultPopup(false);
                const loading = ElLoading.service({
                    target: '.content',
                });
                await projectGroupModule.getGroupList();
                loading.close();
                this.isDisabledSaveButton = false;
            } else {
                this.errors = parseImportErrors(importGroupResponses);
                this.scrollToError('error');
            }
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    }

    openPopup(): void {
        this.isDisabledSaveButton = false;
        this.validateData();
        this.scrollToError('error');
    }

    closePopup(): void {
        projectGroupModule.setIsShowImportGroupResultPopup(false);
        projectGroupModule.setImportGroups([]);
    }

    scrollToError(className: string): void {
        setTimeout(() => {
            const collectionElement = Array.from(
                document.getElementsByClassName(className),
            );

            if (collectionElement[0]) {
                collectionElement[0].scrollIntoView({
                    block: 'start',
                    inline: 'start',
                });
            }
        }, 0);
    }
}
</script>

<style lang="scss" scoped>
.error {
    color: rgb(219, 58, 104) !important;
    background-color: rgb(255, 203, 193);
}
.w-100 {
    height: 100%;
    width: 100%;
    padding: 8px 12px;
}
:deep(td.el-table__cell) {
    padding: 0px !important;
    :deep(.cell) {
        height: 100%;
        width: 100%;
        padding: 0px !important;
    }
}
</style>
