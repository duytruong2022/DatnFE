<template>
    <BaseRightDrawer
        :title="
            !form.isCreate
                ? $t('user.title.updateUserTitle')
                : $t('user.title.createUserTitle')
        "
        size="50%"
        v-model:value="isShowUserForm"
        @onOpen="openUserForm"
        @onClosed="closePopup"
        customClass="user-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button
                    :disabled="isDisabledSaveButton"
                    type="primary"
                    @click="onClickSaveButton"
                >
                    {{ $t('userForm.button.save') }}
                </el-button>
            </div>
            <div class="row">
                <div :class="form.isCreate ? 'col-md-6' : 'col-md-12'">
                    <BaseInputText
                        v-model:value="form.email"
                        :label="$t('userForm.title.email')"
                        :placeholder="$t('userForm.placeholder.email')"
                        :error="translateYupError(form.errors.email)"
                        :is-disabled="!form.isCreate"
                        :is-required="true"
                    />
                </div>
                <div class="col-md-6" v-if="!form.isCreate">
                    <BaseInputText
                        v-model:value="form.ldapUsername"
                        :label="$t('userForm.title.ldapUsername')"
                        :is-disabled="!form.isCreate"
                    />
                </div>
                <div class="col-md-6">
                    <BaseInputText
                        v-model:value="form.phoneNumber"
                        :label="$t('userForm.title.phoneNumber')"
                        :placeholder="$t('userForm.placeholder.phoneNumber')"
                        :error="translateYupError(form.errors.phoneNumber)"
                    />
                </div>
                <div class="col-md-6">
                    <BaseInputText
                        v-model:value="form.firstName"
                        :label="$t('userForm.title.firstName')"
                        :placeholder="$t('userForm.placeholder.firstName')"
                        :error="translateYupError(form.errors.firstName)"
                        :is-required="true"
                    />
                </div>
                <div class="col-md-6">
                    <BaseInputText
                        v-model:value="form.lastName"
                        :label="$t('userForm.title.lastName')"
                        :placeholder="$t('userForm.placeholder.lastName')"
                        :error="translateYupError(form.errors.lastName)"
                        :is-required="true"
                    />
                </div>
                <div class="col-md-6">
                    <BaseSingleSelect
                        v-model:value="form.company"
                        :options="companyOptions"
                        :filterable="true"
                        :allowCreate="true"
                        :defaultFirstOption="true"
                        :label="$t('userForm.title.company')"
                        :placeholder="$t('userForm.placeholder.company')"
                        :error="translateYupError(form.errors.company)"
                    />
                </div>
                <div class="col-md-6">
                    <BaseInputText
                        v-model:value="form.jobTitle"
                        :label="$t('userForm.title.jobTitle')"
                        :placeholder="$t('userForm.placeholder.jobTitle')"
                        :error="translateYupError(form.errors.jobTitle)"
                    />
                </div>
                <div class="col-md-6">
                    <BaseSingleSelect
                        v-model:value="form.countryId"
                        :options="countryOptions"
                        :label="$t('userForm.title.country')"
                        :placeholder="$t('userForm.placeholder.country')"
                        :error="translateYupError(form.errors.countryId)"
                        :is-required="true"
                        :filterable="true"
                    />
                </div>
                <div class="col-md-6">
                    <BaseInputText
                        v-model:value="form.city"
                        :label="$t('userForm.title.city')"
                        :placeholder="$t('userForm.placeholder.city')"
                        :error="translateYupError(form.errors.city)"
                    />
                </div>
                <div class="col-md-6">
                    <BaseSingleSelect
                        v-model:value="form.language"
                        :options="languageOptions"
                        :label="$t('userForm.title.language')"
                        :placeholder="$t('userForm.placeholder.language')"
                        :error="translateYupError(form.errors.language)"
                    />
                </div>
                <div class="col-md-6">
                    <BaseSingleSelect
                        v-model:value="form.timezone"
                        :label="$t('userForm.title.timezone')"
                        :placeholder="$t('userForm.placeholder.timezone')"
                        :error="translateYupError(form.errors.timezone)"
                        :options="timezoneOptions"
                        :filterable="true"
                    />
                </div>
                <div
                    class="col-md-6"
                    v-if="selectedAccessModule !== accessModules.SPACIALYTIC_PLATFORM"
                >
                    <BaseMultipleSelect
                        v-model:value="form.groupIds"
                        :label="$t('userForm.title.groups')"
                        :placeholder="$t('userForm.placeholder.groups')"
                        :error="translateYupError(form.errors.groupIds)"
                        :options="!selectedProjectId ? groupOptions : projectGroupOptions"
                        :isDisabled="!canAssignSecurityProfileAndProjectToUser"
                        :filterable="true"
                    />
                </div>
                <div
                    class="col-md-6"
                    v-if="
                        selectedAccessModule ===
                            accessModules.SPACIALYTIC_CONSTELLATION && !selectedProjectId
                    "
                >
                    <BaseMultipleSelect
                        v-model:value="form.securityProfileIds"
                        :label="$t('userForm.title.securityProfiles')"
                        :placeholder="$t('userForm.placeholder.securityProfiles')"
                        :error="translateYupError(form.errors.securityProfileIds)"
                        :options="securityProfileOptions"
                        :isDisabled="!canAssignSecurity"
                        :filterable="true"
                    />
                </div>
                <div
                    class="col-md-6"
                    v-if="
                        selectedAccessModule ===
                            accessModules.SPACIALYTIC_CONSTELLATION && selectedProjectId
                    "
                >
                    <BaseMultipleSelect
                        v-model:value="form.projectProfileIds"
                        :label="$t('userForm.title.projectProfiles')"
                        :placeholder="$t('userForm.placeholder.projectProfiles')"
                        :error="translateYupError(form.errors.projectProfileIds)"
                        :options="projectProfileOptions"
                        :filterable="true"
                    />
                </div>
                <div
                    class="col-md-6"
                    v-if="selectedAccessModule === accessModules.SPACIALYTIC_3DWEBVIEWER"
                >
                    <BaseMultipleSelect
                        v-model:value="form.viewer3dProfileIds"
                        :label="$t('userForm.title.viewer3dProfiles')"
                        :placeholder="$t('userForm.placeholder.viewer3dProfiles')"
                        :error="translateYupError(form.errors.viewer3dProfileIds)"
                        :options="viewer3dProfileOptions"
                        :filterable="true"
                    />
                </div>
                <div class="col-md-12">
                    <BaseInputTextarea
                        v-model:value="form.address"
                        :label="$t('userForm.title.address')"
                        :placeholder="$t('userForm.placeholder.address')"
                        :error="translateYupError(form.errors.address)"
                    />
                </div>
            </div>
            <div v-if="selectedAccessModule === accessModules.SPACIALYTIC_PLATFORM">
                <AccessModule />
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { userModule } from '../store';
import { initUser, setupUserForm } from '../composition/userForm';
import { UtilMixins } from '@/mixins/utilMixins';
import AccessModule from './AccessModule.vue';
import { IDropDownOption } from '@/common/interfaces';
import { AccessModules, LanguageOptions, TimezonesOptions } from '@/common/constants';
import {
    hasPermissionToAccessRouteInConstellation,
    parseLanguageSelectOptions,
} from '@/common/helpers';
import { authModule } from '@/features/auth/store';
import { SecurityPermissions } from '@/features/security-profile/constants';
import { projectModule } from '@/features/project/store';

@Options({ components: { AccessModule } })
export default class UserForm extends mixins(UtilMixins) {
    form = setup(() => setupUserForm());

    get selectedUser() {
        return userModule.selectedUser;
    }

    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    get selectedProjectId(): string | null {
        return projectModule.selectedProjectId;
    }

    get isDisabledSaveButton(): boolean {
        return userModule.isDisableSaveButton;
    }

    get isShowUserForm(): boolean {
        return userModule.isShowUserForm || false;
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

    get languageOptions() {
        return parseLanguageSelectOptions(LanguageOptions);
    }

    get timezoneOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(TimezonesOptions);
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

    get canAssignSecurity(): boolean {
        return hasPermissionToAccessRouteInConstellation([
            SecurityPermissions.ASSIGN_SECURITY_PROFILE,
        ]);
    }

    get canAssignSecurityProfileAndProjectToUser(): boolean {
        return (
            hasPermissionToAccessRouteInConstellation([
                SecurityPermissions.ASSIGN_SECURITY_PROFILE,
            ]) &&
            hasPermissionToAccessRouteInConstellation([
                SecurityPermissions.ASSIGN_USER_GROUP_TO_PROJECT,
            ])
        );
    }

    closePopup(): void {
        userModule.setIsShowUserForm(false);
        this.form.resetForm({
            values: { ...initUser },
        });
        userModule.setSelectedUser(null);
    }

    async onClickSaveButton(): Promise<void> {
        userModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        userModule.setIsDisableSaveButton(false);
    }

    async openUserForm() {
        userModule.getCompanyList();
        await this.form.openUserForm();
    }
}
</script>
<style lang="scss" scoped>
.securityProfile {
    margin-top: 10px;
}
.user-email {
    font-size: 13px;
    font-weight: 600;
}
</style>
