<template>
    <div class="file-table">
        <BaseTableLayout
            :data="logServerFiles"
            :totalItems="logServerFiles.length"
            :isHighlightCurrentRow="true"
            :isShowPagination="false"
            @row-click="onClickRow"
        >
            <template #table-columns>
                <el-table-column
                    :label="$t('projectLog.logServer.header.name')"
                    min-width="250"
                    align="left"
                >
                    <template #default="scope">
                        <DocumentIcon class="icon" /> {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('projectLog.logServer.header.modifiedDate')"
                    width="300"
                    align="left"
                >
                    <template #default="scope">
                        {{ formatModifiedDate(scope.row?.modifyTime) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('projectLog.logServer.header.size')"
                    width="150"
                    align="left"
                >
                    <template #default="scope">
                        {{ getFileSize(scope.row.size) }}
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
</template>

<script lang="ts">
import moment from 'moment';
import { mixins, Options } from 'vue-class-component';
import { kiloByteToByteRateInDecimal } from '@/common/constants';

import {
    Document as DocumentIcon,
    Setting as SettingIcon,
    View,
} from '@element-plus/icons-vue';
import { UtilMixins } from '@/mixins/utilMixins';
import { projectLogModule } from '../store';
import { IFTPFile } from '@/common/interfaces';

@Options({
    components: { DocumentIcon, SettingIcon, View },
})
export default class LogFileTable extends mixins(UtilMixins) {
    get logServerFiles() {
        return projectLogModule.logServerFiles;
    }

    getFileType(fileName: string) {
        const fileNameSplitted = fileName.split('.');

        if (fileNameSplitted.length > 1) {
            return `.${fileNameSplitted[fileNameSplitted.length - 1]}`;
        }
        return '';
    }

    getFileSize(fileSize: number) {
        return `${(fileSize / kiloByteToByteRateInDecimal).toFixed(2)} ${this.$t(
            'projectLog.logServer.kb',
        )}`;
    }

    formatModifiedDate(timestamp: number) {
        return moment(timestamp).fmFullTimeWithoutSecond();
    }

    async onClickRow(row: IFTPFile) {
        projectLogModule.setSelectedLogServerFile(row);
        projectLogModule.setIsShowLogServerDetailPopup(true);
    }
}
</script>

<style scoped lang="scss">
.file-table {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px 0px;
}
.icon {
    width: 18px;
}
</style>
