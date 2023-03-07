<template>
    <BaseRightDrawer
        :title="$t(`group.title.importGroupResult`)"
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
                    {{ $t('group.groupForm.button.save') }}
                </el-button>
            </div>
            <BaseTableLayout
                :data="importGroupList"
                :totalItems="importGroupList.length"
                :isShowPagination="false"
            >
                <template #table-columns>
                    <el-table-column
                        :label="$t('group.groupForm.name.label')"
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
                        :label="
                            $t('group.groupForm.profile.spacialytic_constellation.label')
                        "
                        min-width="200"
                        v-if="
                            selectedAccessModule ===
                            accessModules.SPACIALYTIC_CONSTELLATION
                        "
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.securityProfile"
                                placement="top"
                                v-if="errors[scope.row?.index]?.securityProfile"
                            >
                                <div class="error w-100">
                                    {{ scope.row.securityProfile }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div class="w-100" v-else>
                                {{ scope.row.securityProfile }}&nbsp;
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="
                            $t('group.groupForm.profile.spacialytic_3dwebviewer.label')
                        "
                        min-width="200"
                        v-else-if="
                            selectedAccessModule === accessModules.SPACIALYTIC_3DWEBVIEWER
                        "
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.viewer3dProfile"
                                placement="top"
                                v-if="errors[scope.row?.index]?.viewer3dProfile"
                            >
                                <div class="error w-100">
                                    {{ scope.row.viewer3dProfile }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div class="w-100" v-else>
                                {{ scope.row.viewer3dProfile }}&nbsp;
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('group.groupForm.description.label')"
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
import { groupModule } from '../../store';
import { groupService } from '../../services/api.services';
import {
    hasPermissionToAccessRouteInConstellation,
    parseImportErrors,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { authModule } from '@/features/auth/store';
import { IBulkCreateGroup } from '../../interfaces';
import { SecurityPermissions } from '@/features/security-profile/constants';

@Options({})
export default class ImportGroupResultForm extends mixins(UtilMixins) {
    isDisabledSaveButton = false;

    errors = {};
    hasError = false;

    get importGroupList(): IBulkCreateGroup[] {
        return groupModule.importGroups;
    }

    get isShowImportGroupResultPopUp(): boolean {
        return groupModule.isShowImportGroupResultPopUp;
    }

    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    validateData(): void {
        this.hasError = false;
        this.errors = {};
        groupModule.importGroups.forEach((importGroup) => {
            if (importGroup.index !== undefined) {
                const nameError = this.validateName(importGroup.name, importGroup.index);
                const securityProfilesError = this.validateSecurityProfile(
                    importGroup.securityProfile,
                );
                const viewer3dProfilesError = this.validateViewer3dProfile(
                    importGroup.viewer3dProfile,
                );
                const descriptionError = this.validateDescription(
                    importGroup.description,
                );

                this.errors = {
                    ...this.errors,
                    [importGroup.index]: {
                        name: nameError,
                        securityProfile: securityProfilesError,
                        viewer3dProfile: viewer3dProfilesError,
                        description: descriptionError,
                    },
                };

                if (
                    nameError ||
                    securityProfilesError ||
                    viewer3dProfilesError ||
                    descriptionError
                ) {
                    this.hasError = true;
                }
            }
        });
    }

    validateName(name: string, index: number): string {
        if (!name) {
            return this.$t('group.importGroups.name.required');
        }
        if (name?.length > INPUT_TEXT_MAX_LENGTH) {
            return this.$t('group.importGroups.name.maxLength');
        }
        if (
            this.importGroupList.some(
                (importGroup) =>
                    importGroup.name.toLocaleLowerCase() === name.toLocaleLowerCase() &&
                    importGroup.index !== index,
            )
        ) {
            return this.$t('group.importGroups.name.uniqueError');
        }
        return '';
    }

    validateSecurityProfile(securityProfile: string): string {
        if (this.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION) {
            if (!securityProfile) {
                return '';
            }
            if (securityProfile?.length > INPUT_TEXT_MAX_LENGTH) {
                return this.$t('group.importGroups.securityProfile.maxLength');
            }
            if (
                !hasPermissionToAccessRouteInConstellation([
                    SecurityPermissions.ASSIGN_SECURITY_PROFILE,
                ])
            ) {
                return this.$t('group.importGroups.securityProfile.permission');
            }
        }

        return '';
    }

    validateViewer3dProfile(viewer3dProfile: string): string {
        if (this.selectedAccessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER) {
            if (!viewer3dProfile) {
                return '';
            }
            if (viewer3dProfile?.length > INPUT_TEXT_MAX_LENGTH) {
                return this.$t('group.importGroups.viewer3dProfile.maxLength');
            }
        }
        return '';
    }

    validateDescription(description: string): string {
        if (!description) {
            return this.$t('group.importGroups.description.required');
        }
        if (description.length > TEXTAREA_MAX_LENGTH) {
            return this.$t('group.importGroups.description.maxLength');
        }
        return '';
    }

    async onClickSaveButton(): Promise<void> {
        this.isDisabledSaveButton = true;

        const response = await groupService.importGroups({
            groups: this.importGroupList,
            accessModule: this.selectedAccessModule,
        });

        if (response.success) {
            const importGroupResponses = response.data.results;

            if (
                !Object.keys(importGroupResponses).find(
                    (key) => !importGroupResponses[key].isValid,
                )
            ) {
                showSuccessNotificationFunction(
                    this.$t('group.message.importGroupSuccess') as string,
                );
                groupModule.setIsShowImportGroupResultPopup(false);
                const loading = ElLoading.service({
                    target: '.content',
                });
                await groupModule.getGroupList();
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
        groupModule.setIsShowImportGroupResultPopup(false);
        groupModule.setImportGroups([]);
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
