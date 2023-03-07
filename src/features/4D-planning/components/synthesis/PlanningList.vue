<template>
    <div class="file-table">
        <BaseTableLayout
            :data="planningList"
            :totalItems="planningList.length"
            :isHighlightCurrentRow="true"
            :isShowPagination="false"
            @selection-change="handleSelectionChange"
        >
            <template #table-columns>
                <el-table-column type="selection" width="55" />
                <el-table-column
                    :label="$t('abs.table.header.name')"
                    width="250"
                    align="left"
                >
                    <template #default="scope">
                        <DocumentIcon class="icon" /> {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.type')"
                    :width="200"
                    align="center"
                >
                    {{ planningExtension }}
                </el-table-column>
                <el-table-column :label="$t('abs.table.header.4d')" align="center">
                    <template #default="scope">
                        {{ scope.row?.userAccess?.city || '-' }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('abs.table.header.pbs')" align="center">
                    <template #default="scope">
                        {{ scope.row?.pbs }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.modifiedDate')"
                    :width="220"
                    align="center"
                >
                    <template #default="scope">
                        {{ formatModifiedDate(scope.row?.updatedAt) }}
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';

import {
    Document as DocumentIcon,
    Setting as SettingIcon,
    View,
} from '@element-plus/icons-vue';
import { projectPlanningModule } from '../../store';
import { IPlanning } from '../../interfaces';
import { Prop } from 'vue-property-decorator';
import { ABSUploadedFileExtensions } from '@/features/abs/constants';
import { AbsFileMixin } from '@/features/abs/mixin';

@Options({
    components: { DocumentIcon, SettingIcon, View },
})
export default class PlanningList extends mixins(AbsFileMixin) {
    planningExtension = ABSUploadedFileExtensions.PLANNING;
    @Prop({ default: [], type: Array(String) }) readonly selectedIds!: string[];
    get planningList(): IPlanning[] {
        return projectPlanningModule.planningList;
    }

    get tableLayoutRef() {
        return this.$refs.tableLayoutRef as {
            toggleRowSelection: (row: any, selected: boolean) => void;
        };
    }

    handleSelectionChange(rows: IPlanning[]) {
        this.$emit('select', rows);
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
