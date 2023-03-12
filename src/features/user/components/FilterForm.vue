<template>
    <div class="filter-form-wrapper">
        <BaseFilterFormLayout
            @search="handleFilter"
            @reset="resetFilter"
            @keyup.enter="handleFilter"
            :createButtonText="$t('user.filterForm.create')"
            :isShowCreateButton="canCreateUser"
            @create="onClickButtonCreate"
        >
            <slot>
                <div class="row">
                    <div
                        class="col-md-12 col-12"
                        :class="
                            accessModule === accessModules.SPACIALYTIC_PLATFORM
                                ? 'col-xl-4'
                                : 'col-xl-6'
                        "
                    >
                        <BaseInputText
                            v-model:value="filterForm.keyword"
                            :label="$t('user.filterForm.keyword.label')"
                            :placeholder="$t('user.filterForm.keyword.placeholder')"
                        />
                    </div>
                    <div
                        class="col-md-12 col-12"
                        :class="
                            accessModule === accessModules.SPACIALYTIC_PLATFORM
                                ? 'col-xl-4'
                                : 'col-xl-6'
                        "
                    >
                        <BaseMultipleSelect
                            v-model:value="filterForm.status"
                            :options="userStatusOptions"
                            :filterable="true"
                            :label="$t('user.filterForm.status.label')"
                            :placeholder="$t('user.filterForm.status.placeholder')"
                        />
                    </div>
                    <div
                        class="col-xl-4 col-md-12 col-12"
                        v-if="accessModule === accessModules.SPACIALYTIC_PLATFORM"
                    >
                        <BaseMultipleSelect
                            v-model:value="filterForm.accessModules"
                            :options="accessModuleOptions"
                            :filterable="true"
                            :label="$t('user.filterForm.accessModule.label')"
                            :placeholder="$t('user.filterForm.accessModule.placeholder')"
                        />
                    </div>
                    <div
                        class="col-xl-4 col-md-12 col-12"
                        v-if="accessModule === accessModules.SPACIALYTIC_PLATFORM"
                    >
                        <BaseMultipleSelect
                            v-model:value="filterForm.companies"
                            :options="companyOptions"
                            :filterable="true"
                            :label="$t('user.filterForm.company.label')"
                            :placeholder="$t('user.filterForm.company.placeholder')"
                        />
                    </div>
                    <div
                        class="col-xl-4 col-md-12 col-12"
                        v-if="accessModule === accessModules.SPACIALYTIC_PLATFORM"
                    >
                        <BaseMultipleSelect
                            v-model:value="filterForm.countryIds"
                            :options="countryOptions"
                            :filterable="true"
                            :label="$t('user.filterForm.country.label')"
                            :placeholder="$t('user.filterForm.country.placeholder')"
                        />
                    </div>
                    <div
                        class="col-xl-4 col-md-12 col-12"
                        v-if="accessModule === accessModules.SPACIALYTIC_PLATFORM"
                    >
                        <BaseMultipleSelect
                            v-model:value="filterForm.registrationFrom"
                            :options="registrationFromOptions"
                            :filterable="true"
                            :label="$t('user.filterForm.registrationFrom.label')"
                            :placeholder="
                                $t('user.filterForm.registrationFrom.placeholder')
                            "
                        />
                    </div>
                    <div
                        class="col-xl-6 col-md-12 col-12"
                        v-if="accessModule !== accessModules.SPACIALYTIC_PLATFORM"
                    >
                        <BaseMultipleSelect
                            v-model:value="filterForm.groupIds"
                            :options="
                                !selectedProjectId ? groupOptions : projectGroupOptions
                            "
                            :filterable="true"
                            :label="$t('user.filterForm.group.label')"
                            :placeholder="$t('user.filterForm.group.placeholder')"
                        />
                    </div>
                    <div
                        class="col-xl-6 col-md-12 col-12"
                        v-if="
                            accessModule === accessModules.SPACIALYTIC_CONSTELLATION &&
                            !selectedProjectId
                        "
                    >
                        <BaseMultipleSelect
                            v-model:value="filterForm.constellationProfileIds"
                            :options="securityProfileOptions"
                            :filterable="true"
                            :label="$t('user.filterForm.constellationProfile.label')"
                            :placeholder="
                                $t('user.filterForm.constellationProfile.placeholder')
                            "
                        />
                    </div>
                    <div
                        class="col-xl-6 col-md-12 col-12"
                        v-if="
                            accessModule === accessModules.SPACIALYTIC_CONSTELLATION &&
                            selectedProjectId
                        "
                    >
                        <BaseMultipleSelect
                            v-model:value="filterForm.projectProfileIds"
                            :options="projectProfileOptions"
                            :filterable="true"
                            :label="$t('user.filterForm.projectProfile.label')"
                            :placeholder="
                                $t('user.filterForm.projectProfile.placeholder')
                            "
                        />
                    </div>
                    <div
                        class="col-xl-6 col-md-12 col-12"
                        v-if="accessModule === accessModules.SPACIALYTIC_3DWEBVIEWER"
                    >
                        <BaseMultipleSelect
                            v-model:value="filterForm.viewer3dProfileIds"
                            :options="viewer3dProfileOptions"
                            :filterable="true"
                            :label="$t('user.filterForm.viewer3dProfile.label')"
                            :placeholder="
                                $t('user.filterForm.viewer3dProfile.placeholder')
                            "
                        />
                    </div>
                </div>
            </slot>
            <template #custom-button>
                <el-button size="mini" class="import-button" @click="onClickButtonUpload">
                    {{ $t('common.importFiles.import') }}
                </el-button>
                <el-button
                    size="mini"
                    @click="onClickAddUser"
                    v-if="isShowAddUser"
                    type="primary"
                >
                    {{ $t('user.filterForm.addUser') }}
                </el-button>
            </template>
        </BaseFilterFormLayout>
        <AddUserToProjectForm v-if="isShowAddUser" />
    </div>
</template>

<script lang="ts">
import { Options } from 'vue-class-component';

import { mixins } from 'vue-class-component';
import { userModule, initQueryString } from '../store';
import { AccessModules, DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import { IUserListQueryString } from '../interfaces';
import { ElLoading } from 'element-plus';
import { Watch } from 'vue-property-decorator';
import { IDropDownOption } from '@/common/interfaces';
import {
    hasPermissionToAccessRouteInConstellation,
    hasPermissionToAccessRouteInProject,
    parseLanguageSelectOptions,
} from '@/common/helpers';
import { RegistrationFromOptions, UserStatusOptions } from '../constant';
import { authModule } from '@/features/auth/store';
import { projectModule } from '@/features/project/store';
import AddUserToProjectForm from './forms/AddUserToProjectForm.vue';
import { UtilMixins } from '@/mixins/utilMixins';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import { SecurityPermissions } from '@/features/security-profile/constants';
@Options({
    components: { AddUserToProjectForm },
})
export default class FilterForm extends mixins(UtilMixins) {
    filterForm = {
        keyword: '',
        status: [],
        companies: [],
        countryIds: [],
        registrationFrom: [],
        accessModules: [],
        groupIds: [],
        constellationProfileIds: [],
        viewer3dProfileIds: [],
        projectProfileIds: [],
    };

    get selectedProjectId() {
        return projectModule.selectedProjectId;
    }

    get userStatusOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(UserStatusOptions);
    }

    get registrationFromOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(RegistrationFromOptions);
    }

    get countryOptions() {
        return userModule.countryList.map((country) => ({
            label: country.name,
            value: country._id,
        }));
    }

    get companyOptions() {
        return userModule.companyList.map((company) => ({
            label: company,
            value: company,
        }));
    }

    get accessModuleOptions(): IDropDownOption[] {
        return Object.values(AccessModules).map((accessModule) => {
            return {
                value: accessModule,
                label: this.$t(`app.accessModule.${accessModule}`),
            };
        });
    }

    get groupOptions() {
        return userModule.groupList.map((group) => ({
            label: group.name,
            value: group._id,
        }));
    }

    get projectGroupOptions() {
        return userModule.projectGroupList.map((group) => ({
            label: group.name,
            value: group._id,
        }));
    }

    get securityProfileOptions() {
        return userModule.securityProfileList.map((securityProfile) => ({
            label: securityProfile.name,
            value: securityProfile._id,
        }));
    }

    get projectProfileOptions() {
        return userModule.projectProfileList.map((projectProfile) => ({
            label: projectProfile.name,
            value: projectProfile._id,
        }));
    }

    get viewer3dProfileOptions() {
        return userModule.viewer3dProfileList.map((viewer3dProfile) => ({
            label: viewer3dProfile.name,
            value: viewer3dProfile._id,
        }));
    }

    get canCreateUser(): boolean {
        if (projectModule.selectedProjectId) {
            return hasPermissionToAccessRouteInProject([
                ProjectSecurityPermissions.GENERAL_MANAGE_USER_GROUP_OF_PROJECT,
            ]);
        } else if (
            authModule.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION
        ) {
            return hasPermissionToAccessRouteInConstellation([
                SecurityPermissions.MANAGE_USERS_GROUPS,
            ]);
        }
        return true;
    }

    get isShowAddUser(): boolean {
        return !!projectModule.selectedProjectId;
    }

    async resetFilter(): Promise<void> {
        Object.assign(this.filterForm, {
            keyword: '',
            status: [],
            companies: [],
            countryIds: [],
            registrationFrom: [],
            groupIds: [],
            constellationProfileIds: [],
            viewer3dProfileIds: [],
            projectProfileIds: [],
            accessModules:
                this.accessModule === AccessModules.SPACIALYTIC_PLATFORM
                    ? []
                    : [this.accessModule],
        });
        userModule.setUserListQueryString(initQueryString);
        await this.handleFilter();
    }

    get accessModule() {
        return authModule.selectedAccessModule;
    }

    async handleFilter(): Promise<void> {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        let constellationGroupIds: string[] = [];
        let projectGroupIds: string[] = [];
        let viewer3dGroupIds: string[] = [];
        if (
            this.accessModule === AccessModules.SPACIALYTIC_CONSTELLATION &&
            !this.selectedProjectId
        ) {
            constellationGroupIds = this.filterForm.groupIds;
        } else if (
            this.accessModule === AccessModules.SPACIALYTIC_CONSTELLATION &&
            this.selectedProjectId
        ) {
            projectGroupIds = this.filterForm.groupIds;
        } else if (this.accessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER) {
            viewer3dGroupIds = this.filterForm.groupIds;
        }
        const query: IUserListQueryString = {
            page: DEFAULT_FIRST_PAGE,
            limit: LIMIT_PER_PAGE,
            keyword: this.filterForm.keyword,
            status: this.filterForm.status,
            companies: this.filterForm.companies,
            countryIds: this.filterForm.countryIds,
            registrationFrom: this.filterForm.registrationFrom,
            accessModules: this.filterForm.accessModules,
            constellationGroupIds,
            viewer3dGroupIds,
            projectGroupIds,
            constellationProfileIds: this.filterForm.constellationProfileIds,
            viewer3dProfileIds: this.filterForm.viewer3dProfileIds,
            projectProfileIds: this.filterForm.projectProfileIds,
        };
        if (
            authModule.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION &&
            projectModule.selectedProjectId
        ) {
            query.projectId = projectModule.selectedProjectId;
        } else {
            query.projectId = null;
        }
        userModule.setUserListQueryString(query);
        const loading = ElLoading.service({
            target: '.content',
        });
        await userModule.getUserList();
        loading.close();
    }

    onClickButtonCreate() {
        userModule.setIsShowUserForm(true);
    }

    onClickButtonUpload() {
        userModule.setIsShowImportUserFileForm(true);
    }

    onClickButtonLDAP(): void {
        userModule.setIsShowLdapUserForm(true);
    }

    onClickAddUser() {
        userModule.setIsShowAddUserToProjectForm(true);
    }

    @Watch('accessModule')
    async onchangeAccessModule() {
        await this.resetFilter();
        await userModule.getGroupList();
    }

    created() {
        this.resetFilter();
    }
}
</script>

<style lang="scss" scoped>
.filter-form-wrapper {
    background-color: #fff;
    border-radius: 1rem;
}
.import-button {
    border-color: var(--el-color-primary) !important;
    &:hover {
        border-color: var(--el-color-primary) !important;
        background-color: rgb(245, 245, 245) !important;
    }
}
</style>
