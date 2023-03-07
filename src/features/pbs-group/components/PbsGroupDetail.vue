<template>
    <div class="user-table-wrapper">
        <div class="title">{{ $t('pbsGroup.title.pbsGroupInformation') }}</div>
        <hr class="horizontal-line" />
        <div v-if="selectedPbsGroup?._id" class="user-table-header">
            <div class="group-name">
                <span class="group-name-label">
                    {{ $t('pbsGroup.label.pbsGroupName') }}:
                </span>
                <span class="pbs-group-name">
                    {{ selectedPbsGroup?.name }}
                </span>
            </div>
        </div>
        <el-collapse v-if="selectedPbsGroup?._id" v-model="activeCollapseNames">
            <el-collapse-item name="1">
                <template #title>
                    <div class="user-list-title">
                        {{ $t('pbsGroup.title.userList') }}
                        <el-button
                            class="add-user-button"
                            size="mini"
                            type="primary"
                            v-if="canAssignUserToPBS"
                            @click.stop="onClickButtonAddUser"
                        >
                            {{ $t('pbsGroup.button.addUser') }}
                        </el-button>
                    </div>
                </template>
                <UserTable />
            </el-collapse-item>
            <el-collapse-item name="2">
                <template #title>
                    <div class="group-list-title">
                        {{ $t('pbsGroup.title.groupList') }}
                        <el-button
                            size="mini"
                            type="primary"
                            v-if="canAssignUserToPBS"
                            @click.stop="onClickButtonAddGroup"
                        >
                            {{ $t('pbsGroup.button.addGroup') }}
                        </el-button>
                    </div>
                </template>
                <ProjectGroupTable v-if="selectedPbsGroup?._id" />
            </el-collapse-item>
        </el-collapse>
        <BaseEmptyData v-else />
    </div>
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { pbsGroupModule } from '../store';
import { hasPermissionToAccessRouteInProject } from '@/common/helpers';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import UserTable from './UserTable.vue';
import ProjectGroupTable from './ProjectGroupTable.vue';
@Options({
    components: { UserTable, ProjectGroupTable },
})
export default class PbsGroupDetail extends mixins(UtilMixins) {
    activeCollapseNames = ['1', '2'];

    get selectedPbsGroup() {
        return pbsGroupModule.selectedPbsGroup;
    }

    get canAssignUserToPBS(): boolean {
        return hasPermissionToAccessRouteInProject([
            ProjectSecurityPermissions.GENERAL_ASSIGN_USER_TO_PBS,
        ]);
    }

    onClickButtonAddUser() {
        pbsGroupModule.setIsShowAddUserForm(true);
    }

    onClickButtonAddGroup() {
        pbsGroupModule.setIsShowAddGroupForm(true);
    }
}
</script>

<style scoped lang="scss">
.user-table-header {
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.title {
    font-weight: 650;
    font-size: 18px;
    display: flex;
    margin-bottom: 21px;
}
.user-table-wrapper {
    background-color: #fff;
    border-radius: 16px;
    padding: 30px 25px;
    max-height: calc((100vh - 95px));
    overflow-y: auto;
}
.group-name {
    text-align: left;
    margin-left: 20px;
    .group-name-label {
        font-weight: 650;
        margin-right: 5px;
        width: 135px;
    }
    .pbs-group-name {
        max-width: calc((75vw - 115px));
        word-break: break-all;
    }
}
.user-list-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 210px;
    font-weight: 650;
    margin-top: 20px;
    margin-right: 5px;
    margin-left: 20px;
    margin-bottom: 20px;
}
.group-list-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 210px;
    font-weight: 650;
    margin-top: 20px;
    margin-right: 5px;
    margin-left: 20px;
    margin-bottom: 20px;
}
.add-user-button {
    width: 103px;
}
</style>
