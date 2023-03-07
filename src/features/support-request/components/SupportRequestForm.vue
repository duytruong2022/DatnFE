<template>
    <BaseRightDrawer
        :title="$t('supportRequest.form.title.create')"
        size="50%"
        @onClosed="closePopup"
        @onOpen="openForm"
        v-model:value="isShowSupportRequestForm"
        customClass="support-request-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button @click="onClickResetButton" type="danger">{{
                    $t('supportRequest.button.reset')
                }}</el-button>
                <el-button @click="onClickSaveButton" type="primary">{{
                    $t('supportRequest.button.sendToSupport')
                }}</el-button>
            </div>
            <div class="row">
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseSingleSelect
                        v-model:value="form.email"
                        :options="emailOptions"
                        :label="$t('supportRequest.form.email.label')"
                        :placeholder="$t('supportRequest.form.email.placeholder')"
                        :error="translateYupError(form.errors.email)"
                        :is-disabled="!isAdminUserRole"
                        :is-required="true"
                        :filterable="true"
                        @change="onChange"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseInputText
                        v-model:value="form.lastName"
                        :label="$t('supportRequest.form.lastName.label')"
                        :placeholder="$t('supportRequest.form.lastName.placeholder')"
                        :error="translateYupError(form.errors.lastName)"
                        :is-disabled="!isAdminUserRole"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseInputText
                        v-model:value="form.firstName"
                        :label="$t('supportRequest.form.firstName.label')"
                        :placeholder="$t('supportRequest.form.firstName.placeholder')"
                        :error="translateYupError(form.errors.firstName)"
                        :is-disabled="!isAdminUserRole"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseSingleSelect
                        v-model:value="form.category"
                        :options="categoryOptions"
                        :label="$t('supportRequest.form.category.label')"
                        :placeholder="$t('supportRequest.form.category.placeholder')"
                        :error="translateYupError(form.errors.category)"
                        :is-required="true"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseSingleSelect
                        v-model:value="form.priority"
                        :options="priorityOptions"
                        :label="$t('supportRequest.form.priority.label')"
                        :placeholder="$t('supportRequest.form.priority.placeholder')"
                        :error="translateYupError(form.errors.priority)"
                        :is-required="true"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseInputText
                        v-model:value="form.version"
                        :label="$t('supportRequest.form.version.label')"
                        :placeholder="$t('supportRequest.form.version.placeholder')"
                        :error="translateYupError(form.errors.version)"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseInputText
                        v-model:value="form.object"
                        :label="$t('supportRequest.form.object.label')"
                        :placeholder="$t('supportRequest.form.object.placeholder')"
                        :error="translateYupError(form.errors.object)"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseInputText
                        v-model:value="form.reference"
                        :label="$t('supportRequest.form.reference.label')"
                        :placeholder="$t('supportRequest.form.reference.placeholder')"
                        :error="translateYupError(form.errors.reference)"
                    />
                </div>
                <div class="col-xl-12 col-md-12 col-12">
                    <div class="upload-file-help">
                        <BaseUploadFile
                            ref="uploadFile"
                            @upload-file="uploadFile"
                            :label="$t('supportRequest.form.file.label')"
                            :placeholder="$t('supportRequest.form.file.placeholder')"
                        />
                    </div>
                </div>
                <div class="col-xl-12 col-md-12 col-12">
                    <BaseInputTextarea
                        v-model:value="form.detail"
                        :label="$t('supportRequest.form.detail.label')"
                        :placeholder="$t('supportRequest.form.detail.placeholder')"
                        :isHorizontal="false"
                        :error="translateYupError(form.errors.detail)"
                    />
                </div>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { supportRequestModule } from '../store';
import { initValues, setupSupportRequestForm } from '../composition/supportRequestForm';
import { IDropDownOption, IDropDownOrderOption } from '@/common/interfaces';
import {
    parseLanguageSelectOptions,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { categoryOptions, priorityOptions } from '../contanst';
import { supportRequestService } from '../services/api.service';
import { ElLoading } from 'element-plus';
import { IUser } from '@/features/user/interfaces';
import localStorageAuthService from '@/common/authStorage';
import { AccessModuleOptions, AccessModules, UserRoles } from '@/common/constants';
import { commonService } from '@/common/services/common.service';

interface UploadFile {
    fileNameUpload: string;
}

@Options({
    components: {},
})
export default class SupportRequestForm extends mixins(UtilMixins) {
    form = setup(() => setupSupportRequestForm());
    userList: IUser[] = [];

    get isAdminUserRole() {
        return this.checkUserRole();
    }

    get emailOptions(): IDropDownOption[] {
        return this.userList.map((user) => {
            return {
                label: user.email,
                value: user.email,
            };
        });
    }

    get isShowSupportRequestForm(): boolean {
        return supportRequestModule.isShowSupportRequestForm || false;
    }

    get categoryOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(categoryOptions);
    }

    get siteOptions(): IDropDownOption[] {
        let userAccessModuleOptions: IDropDownOrderOption[] = [];
        const userAccessModules = localStorageAuthService.getUser()?.accessModules || [];

        if (
            userAccessModules.some(
                (userAccessModule) =>
                    userAccessModule.module === AccessModules.SPACIALYTIC_PLATFORM,
            )
        ) {
            userAccessModuleOptions = AccessModuleOptions;
        } else {
            userAccessModules.forEach((userAccessModule) => {
                const accessModules = AccessModuleOptions.filter((accessModule) => {
                    return accessModule.value === userAccessModule.module;
                });
                userAccessModuleOptions = userAccessModuleOptions.concat(accessModules);
            });
        }

        userAccessModuleOptions.sort((a, b) => (a.order > b.order ? 1 : -1));
        return parseLanguageSelectOptions(userAccessModuleOptions);
    }

    get priorityOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(priorityOptions);
    }

    closePopup() {
        supportRequestModule.setIsShowSupportRequestForm(false);
        supportRequestModule.setSelectedSupportRequest(null);
        (this.form.resetForm as () => void)();
    }

    onClickSaveButton() {
        this.form.onSubmit();
    }

    async uploadFile(file: File) {
        const loading = ElLoading.service({
            target: '.support-request-form',
        });
        const response = await supportRequestService.uploadFile(file);
        loading.close();
        if (response.success) {
            supportRequestModule.setUploadFile(response.data);
        }
    }

    checkUserRole() {
        const userAccessModules = localStorageAuthService
            .getUser()
            ?.accessModules?.find((accessModule) => {
                return (
                    accessModule.module ===
                    localStorageAuthService.getSelectedAccessModule()
                );
            });
        return userAccessModules?.roles.includes(UserRoles.ADMIN);
    }

    onChange(email: string) {
        const user = this.userList.find((user) => {
            return user.email === email;
        });
        this.form.firstName = user?.firstName || '';
        this.form.lastName = user?.lastName || '';
    }

    async getUserList() {
        const loading = ElLoading.service({
            target: '.main-wrapper',
        });
        const response = await commonService.getUserList({
            accessModules: [localStorageAuthService.getSelectedAccessModule()],
        });
        loading.close();
        if (response.success) {
            this.userList = response.data.items;
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    async openForm() {
        if (this.checkUserRole()) {
            this.getUserList();
        }
        supportRequestModule.setUploadFile(null);
        await this.form.openForm();
    }
    onClickResetButton() {
        const user = localStorageAuthService.getUser();
        this.form.resetForm({
            values: {
                ...initValues,
                email: user.email,
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
            },
        });
        supportRequestModule.setUploadFile(null);
        (this.$refs.uploadFile as UploadFile).fileNameUpload = '';
    }
}
</script>
<style lang="scss" scoped></style>
