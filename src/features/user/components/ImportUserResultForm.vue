<template>
    <BaseRightDrawer
        :title="$t(`user.title.importUserResult`)"
        v-model:value="isShowImportUserResultPopUp"
        size="80%"
        customClass="import-user-result-form"
        @onClosed="closePopup"
        @onOpen="openPopup"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button
                    :disabled="isDisabledSaveButton || hasError"
                    type="primary"
                    @click="onClickSaveButton"
                >
                    {{ $t('userForm.button.save') }}
                </el-button>
            </div>
            <BaseTableLayout
                :data="importUserList"
                :totalItems="importUserList?.length"
                :isShowPagination="false"
            >
                <template #table-columns>
                    <el-table-column :label="$t('userForm.title.email')" min-width="230">
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.email"
                                placement="top"
                                v-if="errors[scope.row?.index]?.email"
                            >
                                <div class="error w-100">{{ scope.row.email }}&nbsp;</div>
                            </el-tooltip>
                            <div v-else>{{ scope.row.email }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.firstName')"
                        min-width="170"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.firstName"
                                placement="top"
                                v-if="errors[scope.row?.index]?.firstName"
                            >
                                <div class="error w-100">
                                    {{ scope.row.firstName }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div v-else>{{ scope.row.firstName }}&nbsp;</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.lastName')"
                        min-width="170"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.lastName"
                                placement="top"
                                v-if="errors[scope.row?.index]?.lastName"
                            >
                                <div class="error w-100">
                                    {{ scope.row.lastName }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div v-else>
                                {{ scope.row.lastName }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.phoneNumber')"
                        min-width="170"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.phoneNumber"
                                placement="top"
                                v-if="errors[scope.row?.index]?.phoneNumber"
                            >
                                <div class="error w-100">
                                    {{ scope.row.phoneNumber }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div v-else>
                                {{ scope.row.phoneNumber }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.company')"
                        min-width="170"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.company"
                                placement="top"
                                v-if="errors[scope.row?.index]?.company"
                            >
                                <div class="error w-100">
                                    {{ scope.row.company }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div v-else>
                                {{ scope.row.company }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.jobTitle')"
                        min-width="170"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.jobTitle"
                                placement="top"
                                v-if="errors[scope.row?.index]?.jobTitle"
                            >
                                <div class="error w-100">
                                    {{ scope.row.jobTitle }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div v-else>
                                {{ scope.row.jobTitle }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.country')"
                        min-width="170"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.country"
                                placement="top"
                                v-if="errors[scope.row?.index]?.country"
                            >
                                <div class="error w-100">
                                    {{ scope.row.country }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div v-else>
                                {{ scope.row.country }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('userForm.title.city')" min-width="170">
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.city"
                                placement="top"
                                v-if="errors[scope.row?.index]?.city"
                            >
                                <div class="error w-100">{{ scope.row.city }}&nbsp;</div>
                            </el-tooltip>
                            <div v-else>
                                {{ scope.row.city }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.language')"
                        min-width="170"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.language"
                                placement="top"
                                v-if="errors[scope.row?.index]?.language"
                            >
                                <div class="error w-100">
                                    {{ scope.row.language }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div v-else>
                                {{ scope.row.language }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.timezone')"
                        min-width="170"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.timezone"
                                placement="top"
                                v-if="errors[scope.row?.index]?.timezone"
                            >
                                <div class="error w-100">
                                    {{ scope.row.timezone }}&nbsp;
                                </div>
                            </el-tooltip>
                            <div v-else>
                                {{ scope.row.timezone }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.securityProfiles')"
                        min-width="200"
                        v-if="
                            selectedAccessModule ===
                                accessModules.SPACIALYTIC_CONSTELLATION &&
                            !selectedProjectId
                        "
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.securityProfiles"
                                placement="top"
                                v-if="errors[scope.row?.index]?.securityProfiles"
                            >
                                <div class="error w-100">
                                    <ul
                                        v-for="securityProfile in scope.row
                                            .securityProfiles"
                                        :key="securityProfile"
                                        class="profiles"
                                    >
                                        <li>
                                            {{ securityProfile }}
                                        </li>
                                    </ul>
                                </div>
                            </el-tooltip>
                            <div v-else>
                                <ul
                                    v-for="securityProfile in scope.row.securityProfiles"
                                    :key="securityProfile"
                                    class="profiles"
                                >
                                    <li>
                                        {{ securityProfile }}
                                    </li>
                                </ul>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.projectProfiles')"
                        min-width="200"
                        v-if="
                            selectedAccessModule ===
                                accessModules.SPACIALYTIC_CONSTELLATION &&
                            selectedProjectId
                        "
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.projectProfiles"
                                placement="top"
                                v-if="errors[scope.row?.index]?.projectProfiles"
                            >
                                <div class="error w-100">
                                    <ul
                                        v-for="projectProfile in scope.row
                                            .projectProfiles"
                                        :key="projectProfile"
                                        class="profiles"
                                    >
                                        <li>
                                            {{ projectProfile }}
                                        </li>
                                    </ul>
                                </div>
                            </el-tooltip>
                            <div v-else>
                                <ul
                                    v-for="projectProfile in scope.row.projectProfiles"
                                    :key="projectProfile"
                                    class="profiles"
                                >
                                    <li>
                                        {{ projectProfile }}
                                    </li>
                                </ul>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.viewer3dProfiles')"
                        min-width="200"
                        v-if="
                            selectedAccessModule === accessModules.SPACIALYTIC_3DWEBVIEWER
                        "
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.viewer3dProfiles"
                                placement="top"
                                v-if="errors[scope.row?.index]?.viewer3dProfiles"
                            >
                                <div class="error w-100">
                                    <ul
                                        v-for="viewer3dProfile in scope.row
                                            .viewer3dProfiles"
                                        :key="viewer3dProfile"
                                        class="profiles"
                                    >
                                        <li>
                                            {{ viewer3dProfile }}
                                        </li>
                                    </ul>
                                </div>
                            </el-tooltip>
                            <div v-else>
                                <ul
                                    v-for="viewer3dProfile in scope.row.viewer3dProfiles"
                                    :key="viewer3dProfile"
                                    class="profiles"
                                >
                                    <li>
                                        {{ viewer3dProfile }}
                                    </li>
                                </ul>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('userForm.title.groups')"
                        min-width="200"
                        v-if="selectedAccessModule !== accessModules.SPACIALYTIC_PLATFORM"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="errors[scope.row?.index]?.groups"
                                placement="top"
                                v-if="errors[scope.row?.index]?.groups"
                            >
                                <div class="error w-100">
                                    <ul
                                        v-for="group in scope.row.groups"
                                        :key="group"
                                        class="groups"
                                    >
                                        <li>
                                            {{ group }}
                                        </li>
                                    </ul>
                                </div>
                            </el-tooltip>
                            <div v-else>
                                <ul
                                    v-for="group in scope.row.groups"
                                    :key="group"
                                    class="groups"
                                >
                                    <li>
                                        {{ group }}
                                    </li>
                                </ul>
                            </div>
                        </template>
                    </el-table-column>
                </template>
            </BaseTableLayout>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { UtilMixins } from '@/mixins/utilMixins';
import {
    AccessModules,
    FORM_VALIDATION,
    INPUT_TEXT_MAX_LENGTH,
    SUPPORT_LANGUAGE,
    TEXTAREA_MAX_LENGTH,
    Timezones,
} from '@/common/constants';
import { ElLoading } from 'element-plus';
import { userModule } from '../store';
import { userService } from '../services/api.services';
import {
    hasPermissionToAccessRouteInConstellation,
    parseImportErrors,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { authModule } from '@/features/auth/store';
import { IBulkCreateUser } from '../interfaces';
import { projectModule } from '@/features/project/store';
import { IMPORT_USER_GROUP_MAX_AMOUNT, INPUT_NAME_MAX_LENGTH } from '../constant';
import { SecurityPermissions } from '@/features/security-profile/constants';

@Options({})
export default class ImportUserResultPopup extends mixins(UtilMixins) {
    isDisabledSaveButton = false;

    errors = {};
    hasError = false;

    get importUserList(): IBulkCreateUser[] {
        return userModule.importUsers;
    }

    get isShowImportUserResultPopUp(): boolean {
        return userModule.isShowImportUserResultPopUp;
    }

    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    get selectedProjectId(): string | null {
        return projectModule.selectedProjectId;
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

    validateData(): void {
        this.hasError = false;
        this.errors = {};
        userModule.importUsers.forEach((importUser) => {
            if (importUser.index !== undefined) {
                const userCountry = userModule.countryList.find(
                    (country) =>
                        country?.name.toLocaleLowerCase() ===
                            importUser?.country?.toLocaleLowerCase() ||
                        country?.code.toLocaleLowerCase() ===
                            importUser?.country?.toLocaleLowerCase(),
                );

                if (userCountry) {
                    importUser.country = userCountry.name;
                } else {
                    this.hasError = true;
                }

                const firstNameError = this.validateFirstName(importUser.firstName);
                const lastNameError = this.validateLastName(importUser.lastName);
                const emailError = this.validateEmail(importUser.email, importUser.index);
                const phoneNumberError = this.validatePhoneNumber(importUser.phoneNumber);
                const companyError = this.validateCompany(importUser.company);
                const jobTitleError = this.validateJobTitle(importUser.jobTitle);
                const countryError = this.validateCountry(importUser.country);
                const cityError = this.validateCity(importUser.city);
                const languageError = this.validateLanguage(importUser.language);
                const timezoneError = this.validateTimezone(importUser.timezone);
                const groupsError = this.validateGroups(importUser.groups as string[]);
                const securityProfilesError = this.validateSecurityProfiles(
                    importUser.securityProfiles as string[],
                );
                const viewer3dProfilesError = this.validateViewer3dProfiles(
                    importUser.viewer3dProfiles as string[],
                );
                const projectProfilesError = this.validateProjectProfiles(
                    importUser.projectProfiles as string[],
                );
                this.errors = {
                    ...this.errors,
                    [importUser.index]: {
                        email: emailError,
                        firstName: firstNameError,
                        lastName: lastNameError,
                        phoneNumber: phoneNumberError,
                        company: companyError,
                        jobTitle: jobTitleError,
                        country: countryError,
                        city: cityError,
                        language: languageError,
                        timezone: timezoneError,
                        groups: groupsError,
                        securityProfiles: securityProfilesError,
                        viewer3dProfiles: viewer3dProfilesError,
                        projectProfiles: projectProfilesError,
                    },
                };

                if (
                    emailError ||
                    firstNameError ||
                    lastNameError ||
                    phoneNumberError ||
                    companyError ||
                    jobTitleError ||
                    countryError ||
                    cityError ||
                    languageError ||
                    timezoneError ||
                    groupsError ||
                    securityProfilesError ||
                    viewer3dProfilesError ||
                    projectProfilesError
                ) {
                    this.hasError = true;
                }
            }
        });
    }

    validateEmail(email: string, index: number): string {
        if (!email) {
            return this.$t('userForm.importUsers.email.required');
        }
        if (!FORM_VALIDATION.email.test(email)) {
            return this.$t('userForm.importUsers.email.formatError');
        }
        if (email?.length > INPUT_TEXT_MAX_LENGTH) {
            return this.$t('userForm.importUsers.email.maxLength');
        }
        if (
            this.importUserList.some(
                (importUser) => importUser.email === email && importUser.index !== index,
            )
        ) {
            return this.$t('userForm.importUsers.email.uniqueError');
        }
        return '';
    }

    validateFirstName(firstName: string): string {
        if (!firstName) {
            return this.$t('userForm.importUsers.firstName.required');
        }
        if (firstName?.length > INPUT_NAME_MAX_LENGTH) {
            return this.$t('userForm.importUsers.firstName.maxLength');
        }
        return '';
    }

    validateLastName(lastName: string): string {
        if (!lastName) {
            return this.$t('userForm.importUsers.lastName.required');
        }
        if (lastName?.length > INPUT_NAME_MAX_LENGTH) {
            return this.$t('userForm.importUsers.lastName.maxLength');
        }
        return '';
    }

    validatePhoneNumber(phoneNumber: string): string {
        if (!phoneNumber) {
            return '';
        }
        if (!FORM_VALIDATION.phoneRegExp.test(phoneNumber)) {
            return this.$t('userForm.importUsers.phoneNumber.invalid');
        }
        return '';
    }

    validateCompany(company: string): string {
        if (!company) {
            return '';
        }
        if (company?.length > INPUT_TEXT_MAX_LENGTH) {
            return this.$t('userForm.importUsers.company.maxLength');
        }
        return '';
    }

    validateJobTitle(jobTitle: string): string {
        if (!jobTitle) {
            return '';
        }
        if (jobTitle?.length > INPUT_TEXT_MAX_LENGTH) {
            return this.$t('userForm.importUsers.jobTitle.maxLength');
        }
        return '';
    }

    validateCountry(country: string): string {
        if (!country) {
            return this.$t('userForm.importUsers.country.required');
        }
        if (country?.length > INPUT_TEXT_MAX_LENGTH) {
            return this.$t('userForm.importUsers.country.maxLength');
        }
        if (!userModule.countryList.map((country) => country.name).includes(country)) {
            return this.$t('userForm.importUsers.country.invalid');
        }
        return '';
    }

    validateCity(city: string): string {
        if (!city) {
            return '';
        }
        if (city?.length > INPUT_TEXT_MAX_LENGTH) {
            return this.$t('userForm.importUsers.city.maxLength');
        }
        return '';
    }

    validateLanguage(language: SUPPORT_LANGUAGE): string {
        if (!language) {
            return '';
        }
        if (
            !Object.values(SUPPORT_LANGUAGE).includes(
                language.toLowerCase() as SUPPORT_LANGUAGE,
            )
        ) {
            return this.$t('userForm.importUsers.language.invalid');
        }
        return '';
    }

    validateTimezone(timezone: Timezones): string {
        if (!timezone) {
            return '';
        }
        if (!Object.values(Timezones).includes(timezone)) {
            return this.$t('userForm.importUsers.timezone.invalid');
        }
        return '';
    }

    validateAddress(address: string): string {
        if (!address) {
            return '';
        }
        if (address.length > TEXTAREA_MAX_LENGTH) {
            return this.$t('userForm.importUsers.address.maxLength');
        }
        return '';
    }

    validateGroups(groups: string[]): string {
        if (this.selectedAccessModule !== AccessModules.SPACIALYTIC_PLATFORM) {
            if (groups.length > IMPORT_USER_GROUP_MAX_AMOUNT) {
                return this.$t('userForm.importUsers.group.tooMany');
            }

            for (let group of groups) {
                if (group && group.length > INPUT_TEXT_MAX_LENGTH) {
                    return this.$t('userForm.importUsers.group.maxLength');
                }
            }
        }

        if (
            this.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION &&
            groups?.length &&
            !this.canAssignSecurityProfileAndProjectToUser
        ) {
            return this.$t('userForm.importUsers.group.permission');
        }
        return '';
    }

    validateSecurityProfiles(securityProfiles: string[]): string {
        if (
            this.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION &&
            !this.selectedProjectId
        ) {
            for (let securityProfile of securityProfiles) {
                if (securityProfile && securityProfile.length > INPUT_TEXT_MAX_LENGTH) {
                    return this.$t('userForm.importUsers.securityProfile.maxLength');
                }
            }
        }
        if (securityProfiles?.length && !this.canAssignSecurity) {
            return this.$t('userForm.importUsers.securityProfile.permission');
        }
        return '';
    }

    validateViewer3dProfiles(viewer3dProfiles: string[]): string {
        if (
            this.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION &&
            this.selectedProjectId
        ) {
            for (let viewer3dProfile of viewer3dProfiles) {
                if (viewer3dProfile && viewer3dProfile.length > INPUT_TEXT_MAX_LENGTH) {
                    return this.$t('userForm.importUsers.viewer3dProfile.maxLength');
                }
            }
        }
        return '';
    }

    validateProjectProfiles(projectProfiles: string[]): string {
        if (this.selectedAccessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER) {
            for (let projectProfile of projectProfiles) {
                if (projectProfile && projectProfile.length > INPUT_TEXT_MAX_LENGTH) {
                    return this.$t('userForm.importUsers.projectProfile.maxLength');
                }
            }
        }
        return '';
    }

    async onClickSaveButton(): Promise<void> {
        this.isDisabledSaveButton = true;
        const importUsers = this.importUserList.map((importUser) => {
            delete importUser.securityProfileNames;
            delete importUser.viewer3dProfileNames;
            delete importUser.projectProfileNames;
            delete importUser.groupNames;

            if (this.selectedAccessModule === AccessModules.SPACIALYTIC_PLATFORM) {
                delete importUser.securityProfiles;
                delete importUser.groups;
            }

            return {
                ...importUser,
                language: importUser.language?.toLowerCase() as SUPPORT_LANGUAGE,
            };
        });

        const response = await userService.importUsers({
            users: importUsers,
            accessModule: this.selectedAccessModule,
            projectId: projectModule.selectedProjectId || '',
        });

        if (response.success) {
            const importUserResponses = response.data.results;

            if (
                !Object.keys(importUserResponses).find(
                    (key) => !importUserResponses[key].isValid,
                )
            ) {
                showSuccessNotificationFunction(
                    this.$t('userForm.message.importUserSuccess') as string,
                );
                userModule.setIsShowImportUserResultPopup(false);
                const loading = ElLoading.service({
                    target: '.content',
                });
                await userModule.getUserList();
                await userModule.getCompanyList();
                loading.close();
                this.isDisabledSaveButton = false;
            } else {
                this.errors = parseImportErrors(importUserResponses);
                this.scrollToError('error');
            }
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    }

    openPopup(): void {
        this.isDisabledSaveButton = false;
        this.validateData();
        this.scrollToError('error');
    }

    closePopup(): void {
        userModule.setIsShowImportUserResultPopup(false);
        userModule.setImportUsers([]);
    }

    scrollToError(className: string): void {
        setTimeout(() => {
            const collectionElement = Array.from(
                document.getElementsByClassName(className),
            );

            if (collectionElement[0]) {
                collectionElement[0].scrollIntoView({
                    block: 'start',
                    inline: 'start',
                });
            }
        }, 0);
    }
}
</script>

<style lang="scss" scoped>
.error {
    color: rgb(219, 58, 104) !important;
    background-color: rgb(255, 203, 193);
}
.w-100 {
    height: 100%;
    width: 100%;
    padding: 8px 12px;
}
:deep(td.el-table__cell) {
    padding: 0px !important;
    :deep(.cell) {
        height: 100%;
        width: 100%;
        padding: 0px !important;
    }
}
.profiles,
.groups {
    margin-bottom: 0px;
    padding: 4px 16px;
}
</style>
