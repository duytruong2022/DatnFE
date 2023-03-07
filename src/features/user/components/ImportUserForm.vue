<template>
    <BaseImportFile
        :isShowImportForm="isShowImportUserFileForm"
        @handleSave="onClickButtonImport"
        @changeFile="handleChangeFile"
        @onCloseImportForm="closePopup"
        @download="handleDownloadImportUserFile"
        :title="$t('user.title.importUsers')"
        :error="$t(`${importErrorMessage}`)"
    />
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-property-decorator';
import { Options } from 'vue-class-component';
import * as XLSX from 'xlsx';
import {
    AccessModules,
    EXCEL_ACCEPTED_FILE_TYPES,
    MAX_FILE_SIZE_IN_BYTE,
} from '@/common/constants';
import { userModule } from '../store';
import { downloadFile } from '@/common/helpers';
import { authModule } from '@/features/auth/store';
import { IBulkCreateUser } from '../interfaces';
import { projectModule } from '@/features/project/store';
import {
    importConstellationUserHeader,
    importPlatformUserHeader,
    importProjectUserHeader,
    importView3DUserHeader,
} from '../constant';

@Options({})
export default class ImportUserForm extends mixins(UtilMixins) {
    importErrorMessage = '';
    get isShowImportUserFileForm(): boolean {
        return userModule.isShowImportUserFileForm;
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
                !EXCEL_ACCEPTED_FILE_TYPES.includes(
                    finalFileName[finalFileName.length - 1],
                )
            ) {
                this.importErrorMessage = this.$t(
                    'common.importFiles.rules.invalidType.excel',
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

    async onClickButtonImport(file: File): Promise<void> {
        if (await this.validateFileData(file)) {
            const fileText = await file.arrayBuffer();
            const workbook = XLSX.read(fileText);
            let userList: IBulkCreateUser[] = [];
            if (this.selectedAccessModule === AccessModules.SPACIALYTIC_PLATFORM) {
                userList = XLSX.utils.sheet_to_json(
                    workbook.Sheets[workbook.SheetNames[0]],
                    {
                        header: importPlatformUserHeader,
                        raw: false,
                    },
                ) as IBulkCreateUser[];
            } else if (
                this.selectedAccessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER
            ) {
                userList = XLSX.utils.sheet_to_json(
                    workbook.Sheets[workbook.SheetNames[0]],
                    {
                        header: importView3DUserHeader,
                        raw: false,
                    },
                ) as IBulkCreateUser[];
            } else if (!this.selectedProjectId) {
                userList = XLSX.utils.sheet_to_json(
                    workbook.Sheets[workbook.SheetNames[0]],
                    {
                        header: importConstellationUserHeader,
                        raw: false,
                    },
                ) as IBulkCreateUser[];
            } else {
                userList = XLSX.utils.sheet_to_json(
                    workbook.Sheets[workbook.SheetNames[0]],
                    {
                        header: importProjectUserHeader,
                    },
                ) as IBulkCreateUser[];
            }

            userList.splice(0, 1); //delete header row
            userModule.setImportUsers(userList);
            userModule.setIsShowImportUserResultPopup(true);
            userModule.setIsShowImportUserFileForm(false);
        }
    }

    handleChangeFile(): void {
        this.importErrorMessage = '';
    }

    handleDownloadImportUserFile(): void {
        if (this.selectedAccessModule === AccessModules.SPACIALYTIC_PLATFORM) {
            downloadFile(
                'import_user_template.xlsx',
                `${window.location.origin}/templates/import_user_platform_template.xlsx`,
            );
        } else if (this.selectedAccessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER) {
            downloadFile(
                'import_user_template.xlsx',
                `${window.location.origin}/templates/import_user_3dwebviewer_template.xlsx`,
            );
        } else if (!this.selectedProjectId) {
            downloadFile(
                'import_user_template.xlsx',
                `${window.location.origin}/templates/import_user_constellation_template.xlsx`,
            );
        } else {
            downloadFile(
                'import_user_template.xlsx',
                `${window.location.origin}/templates/import_user_project_template.xlsx`,
            );
        }
    }

    closePopup(): void {
        this.importErrorMessage = '';
        userModule.setIsShowImportUserFileForm(false);
    }
}
</script>

<style lang="scss" scoped></style>
