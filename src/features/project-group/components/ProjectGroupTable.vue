<template>
    <div class="project-group-table-wrapper">
        <BaseTableLayout
            :data="groupList"
            :isHighlightCurrentRow="true"
            @sort-change="onSortChange"
            v-model:selectedPage="selectedPage"
            :totalItems="totalItems"
            @handlePaginate="handlePaginate"
        >
            <template #table-columns>
                <el-table-column
                    :label="$t('projectGroup.groupList.name')"
                    prop="name"
                    sortable
                >
                    <template #default="scope">
                        {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('projectGroup.groupList.assignUser')">
                    <template #default="scope">
                        <div
                            class="assign-to-txt"
                            @click="showAssignUserPopup(scope.row)"
                        >
                            {{
                                $t('projectGroup.groupList.assignToUser', {
                                    assignedUserCount: scope.row?.assignedUserCount || 0,
                                })
                            }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('projectGroup.groupList.projectProfile')">
                    <template #default="scope">
                        <SelectProjectProfile
                            :projectGroupId="scope.row._id"
                            :options="projectProfileOptions"
                            :placeholder="
                                $t('projectGroup.groupForm.projectProfile.placeholder')
                            "
                            v-model:value="scope.row.projectProfileId"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('projectGroup.groupList.description')">
                    <template #default="scope">
                        {{ scope.row?.description }}
                    </template>
                </el-table-column>
                <el-table-column
                    fixed="right"
                    align="center"
                    width="200"
                    :label="$t('projectGroup.groupList.action')"
                >
                    <template #default="scope">
                        <div class="button-group">
                            <el-tooltip
                                effect="dark"
                                :content="$t('projectGroup.groupList.tooltip.edit')"
                                placement="top"
                            >
                                <el-button
                                    type="warning"
                                    size="mini"
                                    @click="onClickButtonEdit(scope.row)"
                                >
                                    <EditIcon class="action-icon" />
                                </el-button>
                            </el-tooltip>
                            <el-tooltip
                                effect="dark"
                                :content="$t('projectGroup.groupList.tooltip.delete')"
                                placement="top"
                            >
                                <el-button
                                    type="danger"
                                    size="mini"
                                    @click="onClickButtonDelete(scope.row._id)"
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
import { Vue, Options, setup } from 'vue-class-component';
import { IProjectGroupUpdateBody } from '../interfaces';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Lock as LockIcon,
} from '@element-plus/icons-vue';
import { projectGroupModule } from '../store';
import { setupDelete } from '../composition/projectGroupList';
import { DEFAULT_FIRST_PAGE, OrderDirection } from '@/common/constants';
import {
    IBodyResponse,
    IDropDownOption,
    IELColumnSort,
    IGetListResponse,
} from '@/common/interfaces';
import { ElLoading } from 'element-plus';
import SelectProjectProfile from './SelectProjectProfile.vue';
import { commonService } from '@/common/services/common.service';
import { projectModule } from '@/features/project/store';
import { IProfile } from '@/features/3D-viewer-profile/interfaces';

@Options({ components: { DeleteIcon, EditIcon, LockIcon, SelectProjectProfile } })
export default class GroupTable extends Vue {
    projectProfileList: IProfile[] = [];
    deleteAction = setup(() => setupDelete());
    get groupList() {
        return projectGroupModule.groupList;
    }

    get totalItems(): number {
        return projectGroupModule.totalGroups;
    }

    get selectedPage(): number {
        return projectGroupModule.groupListQueryString?.page || DEFAULT_FIRST_PAGE;
    }

    get projectProfileOptions(): IDropDownOption[] {
        return this.projectProfileList.map((projectProfile) => ({
            label: projectProfile.name,
            value: projectProfile._id,
        }));
    }

    showAssignUserPopup(selectProjectGroup: IProjectGroupUpdateBody) {
        projectGroupModule.setSelectedGroup(selectProjectGroup);
        projectGroupModule.setIsShowAssignUserPopup(true);
    }

    async onClickButtonEdit(updateProjectGroup: IProjectGroupUpdateBody): Promise<void> {
        projectGroupModule.setSelectedGroup(updateProjectGroup);
        projectGroupModule.setIsShowGroupForm(true);
    }

    async onClickButtonDelete(id: string): Promise<void> {
        await this.deleteAction.deleteGroup(id);
    }

    async onSortChange(column: IELColumnSort): Promise<void> {
        const loading = ElLoading.service({
            target: '.content',
        });
        projectGroupModule.setGroupListQueryString({
            orderBy: column?.prop,
            orderDirection:
                column.order === OrderDirection.ASCENDING
                    ? OrderDirection.DESCENDING
                    : OrderDirection.ASCENDING,
        });
        await projectGroupModule.getGroupList();
        loading.close();
    }

    async handlePaginate(selectedPage: number): Promise<void> {
        projectGroupModule.setGroupListQueryString({
            page: selectedPage,
        });

        const loading = ElLoading.service({
            target: '.content',
        });
        await projectGroupModule.getGroupList();
        loading.close();
    }

    async getProjectProfileList() {
        const response = (await commonService.getProjectProfileList(
            projectModule.selectedProjectId,
        )) as unknown as IBodyResponse<IGetListResponse<IProfile>>;
        if (response.success) {
            this.projectProfileList = response.data?.items || [];
            const projectProfileDefault = this.projectProfileList.find(
                (projectProfile) => projectProfile.isDefaultSelect,
            );

            if (projectProfileDefault) {
                projectGroupModule.setProjectProfileDefault({
                    label: projectProfileDefault?.name || '',
                    value: projectProfileDefault?._id || '',
                });
            } else {
                projectGroupModule.setProjectProfileDefault({});
            }
        }
    }
    async initData() {
        const loading = ElLoading.service({ target: '.page-wrapper' });
        await this.getProjectProfileList();
        loading.close();
    }

    async created() {
        this.initData();
    }
}
</script>

<style scoped lang="scss">
.project-group-table-wrapper {
    background-color: #fff;
    border-radius: 1rem;
    padding: 30px 0px;
}
.action-icon {
    height: 1em;
    width: 1em;
}

.assign-to-txt {
    color: rgb(46, 77, 252);
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
}
</style>
