<template>
    <BaseImportFile
        :isShowImportForm="isShowImportGroupFileForm"
        @handleSave="onClickButtonImport"
        @changeFile="handleChangeFile"
        @onCloseImportForm="closePopup"
        @download="handleDownloadImportGroupFile"
        :title="$t('projectGroup.title.importGroups')"
        :error="$t(`${importErrorMessage}`)"
    />
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-property-decorator';
import { Options } from 'vue-class-component';
import * as XLSX from 'xlsx';
import { EXCEL_ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_IN_BYTE } from '@/common/constants';
import { downloadFile } from '@/common/helpers';
import { projectGroupModule } from '../store';
import { IBulkCreateProjectGroup } from '../interfaces';
import { importProjectGroupHeader } from '../constant';

@Options({})
export default class ImportGroupForm extends mixins(UtilMixins) {
    importErrorMessage = '';
    get isShowImportGroupFileForm(): boolean {
        return projectGroupModule.isShowImportGroupFileForm;
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
            const groupList = XLSX.utils.sheet_to_json(
                workbook.Sheets[workbook.SheetNames[0]],
                { header: importProjectGroupHeader, raw: false },
            ) as IBulkCreateProjectGroup[];
            groupList.splice(0, 1);
            projectGroupModule.setImportGroups(groupList);
            projectGroupModule.setIsShowImportGroupResultPopup(true);
            projectGroupModule.setIsShowImportGroupFileForm(false);
        }
    }

    handleChangeFile(): void {
        this.importErrorMessage = '';
    }

    handleDownloadImportGroupFile(): void {
        downloadFile(
            'import_project_group_template.xlsx',
            `${window.location.origin}/templates/import_project_group_template.xlsx`,
        );
    }

    closePopup(): void {
        this.importErrorMessage = '';
        projectGroupModule.setIsShowImportGroupFileForm(false);
    }
}
</script>

<style lang="scss" scoped></style>
