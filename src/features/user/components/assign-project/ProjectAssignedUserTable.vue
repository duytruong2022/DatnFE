<template>
    <div class="project-assigned-user-table-layout">
        <BaseTableLayout
            :data="projectAssignedUserList"
            :totalItems="projectAssignedUserList.length"
        >
            <template #table-columns>
                <el-table-column prop="name" :label="$t('user.assignedUserTable.name')" />
                <el-table-column :label="$t('user.assignedUserTable.group')">
                    <template #default="scope">
                        {{ getGroupNameList(scope.row?.groups ?? []) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('user.assignedUserTable.isAdmin')"
                    #default="scope"
                    header-align="center"
                    width="100"
                >
                    <div :style="{ textAlign: 'center' }">
                        <el-icon
                            v-if="scope.row.isAdmin ?? false"
                            color="#41e35d"
                            class="no-inherit"
                            size="15px"
                            ><CheckIcon
                        /></el-icon>
                    </div>
                </el-table-column>
                <el-table-column width="80" fixed="right" align="center">
                    <template #default="scope">
                        <div class="button-action">
                            <el-tooltip
                                effect="dark"
                                :content="$t('user.assignProjectPopup.tooltip.delete')"
                                placement="top"
                                v-if="!(scope.row?.groups || scope.row?.isAdmin)"
                            >
                                <el-button
                                    size="mini"
                                    @click="
                                        updateUserProjects(
                                            scope.row,
                                            UpdateProjectUserAction.REMOVE_PROJECT,
                                        )
                                    "
                                >
                                    <DeleteIcon class="action-icon" />
                                </el-button>
                            </el-tooltip>
                        </div>
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { userModule } from '../../store';
import { IProject } from '@/features/project/interfaces';
import { IGroup } from '@/features/group/interfaces';
import { UserTableMixin } from '../../mixins/UserTableMixins';
import { Delete as DeleteIcon, Check as CheckIcon } from '@element-plus/icons-vue';

@Options({ components: { DeleteIcon, CheckIcon } })
export default class ProjectAssignedUserTable extends mixins(UserTableMixin) {
    get projectAssignedUserList(): IProject[] {
        return userModule.projectAssignedUserList || [];
    }

    getGroupNameList(groups: IGroup[]): string {
        if (groups.length) {
            const groupNameList = groups.map((item) => item.name);
            return groupNameList.join(', ');
        }
        return '';
    }
}
</script>
<style lang="scss" scoped>
:deep(.el-table__body-wrapper) {
    cursor: pointer;
}

:deep(.el-table .cell) {
    word-break: unset;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}

.action-icon {
    height: 16px;
    width: 16px;
}

:deep(.button-action .el-button) {
    border: none !important;
    color: red;
    height: unset;
    padding: 0px;
}
:deep(.button-action .el-button:hover) {
    color: red !important;
    opacity: 0.6;
}
</style>
