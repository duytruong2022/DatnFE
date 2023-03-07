<template>
    <BaseImportFile
        :isShowImportForm="isShowImportGroupFileForm"
        @handleSave="onClickButtonImport"
        @changeFile="handleChangeFile"
        @onCloseImportForm="closePopup"
        @download="handleDownloadImportGroupFile"
        :title="$t('group.title.importGroups')"
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
import { downloadFile } from '@/common/helpers';
import { groupModule } from '../../store';
import { IBulkCreateGroup } from '../../interfaces';
import { authModule } from '@/features/auth/store';
import { importConstellationGroupHeader, importView3DGroupHeader } from '../../constant';

@Options({})
export default class ImportGroupForm extends mixins(UtilMixins) {
    importErrorMessage = '';
    get isShowImportGroupFileForm(): boolean {
        return groupModule.isShowImportGroupFileForm;
    }

    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
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

            let groupList: IBulkCreateGroup[] = [];
            if (this.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION) {
                groupList = XLSX.utils.sheet_to_json(
                    workbook.Sheets[workbook.SheetNames[0]],
                    { header: importConstellationGroupHeader, raw: false },
                ) as IBulkCreateGroup[];
            } else if (
                this.selectedAccessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER
            ) {
                groupList = XLSX.utils.sheet_to_json(
                    workbook.Sheets[workbook.SheetNames[0]],
                    { header: importView3DGroupHeader, raw: false },
                ) as IBulkCreateGroup[];
            }
            groupList.splice(0, 1);

            groupModule.setImportGroups(groupList);
            groupModule.setIsShowImportGroupResultPopup(true);
            groupModule.setIsShowImportGroupFileForm(false);
        }
    }

    handleChangeFile(): void {
        this.importErrorMessage = '';
    }

    handleDownloadImportGroupFile(): void {
        if (this.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION) {
            downloadFile(
                'import_group_template.xlsx',
                `${window.location.origin}/templates/import_constellation_group_template.xlsx`,
            );
        } else if (this.selectedAccessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER) {
            downloadFile(
                'import_group_template.xlsx',
                `${window.location.origin}/templates/import_3dwebviewer_group_template.xlsx`,
            );
        }
    }

    closePopup(): void {
        this.importErrorMessage = '';
        groupModule.setIsShowImportGroupFileForm(false);
    }
}
</script>

<style lang="scss" scoped></style>
