<template>
    <div class="project-log-table-wrapper">
        <BaseTableLayout
            :data="projectLogList"
            :isHighlightCurrentRow="true"
            :totalItems="totalItems"
            v-model:selectedPage="selectedPage"
            @handlePaginate="handlePaginate"
        >
            <template #table-columns>
                <el-table-column
                    :label="$t('projectLog.projectLogList.project')"
                    width="250"
                    align="center"
                >
                    <template #default="scope">
                        {{ scope.row?.project?.name || '' }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('projectLog.projectLogList.action')"
                    width="250"
                    align="center"
                >
                    <template #default="scope">
                        {{
                            scope.row?.action
                                ? $t(`projectLog.action.${scope.row?.action}`)
                                : ''
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('projectLog.projectLogList.updatedBy')"
                    width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{
                            `${scope.row?.taskOwner?.firstName || ''} ${
                                scope.row?.taskOwner?.lastName || ''
                            }`
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('projectLog.projectLogList.updatedAt')"
                    width="250"
                    align="center"
                >
                    <template #default="scope">
                        {{
                            scope.row.createdAt
                                ? parseDateTime(
                                      scope.row.createdAt,
                                      DATE_TIME_FORMAT.MM_DD_YYYY_SLASH_HH_MM_SS_COLON,
                                  )
                                : ''
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('projectLog.projectLogList.oldData')"
                    width="400"
                    align="center"
                >
                    <template #default="scope">
                        <div v-html="scope.row?.oldData" class="text-left"></div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('projectLog.projectLogList.newData')"
                    width="400"
                    align="center"
                >
                    <template #default="scope">
                        <div v-html="scope.row?.newData" class="text-left"></div>
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
</template>

<script lang="ts">
import { DEFAULT_FIRST_PAGE } from '@/common/constants';
import { ElLoading } from 'element-plus';
import { projectLogModule } from '../store';
import { mixins } from 'vue-class-component';
import { ProjectLogMixins } from '../mixin';

export default class ProjectLogHistoryTable extends mixins(ProjectLogMixins) {
    get projectLogList() {
        return projectLogModule.projectLogHistoryList.map((projectLog) =>
            this.parseProjectLogValue(projectLog),
        );
    }

    get totalItems(): number {
        return projectLogModule.totalProjectLogHistories;
    }

    get selectedPage(): number {
        return projectLogModule.projectLogListQueryString?.page || DEFAULT_FIRST_PAGE;
    }

    async handlePaginate(selectedPage: number): Promise<void> {
        projectLogModule.setProjectLogListQueryString({
            page: selectedPage,
        });

        const loading = ElLoading.service({
            target: '.content',
        });
        await projectLogModule.getProjectLogHistoryList();
        loading.close();
    }
}
</script>

<style scoped lang="scss">
.project-log-table-wrapper {
    background-color: #fff;
    border-radius: 1rem;
    padding: 30px 0px;
}
.action-icon {
    height: 1em;
    width: 1em;
}
.text-left {
    text-align: left;
}
:deep(.cell) {
    text-align: left;
    word-break: break-word !important;
}
</style>
