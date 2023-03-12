<template>
    <div class="profile-form">
        <div class="title d-flex align-items-center justify-content-between">
            <div class="title">
                {{ title }}
            </div>
            <el-button @click="form.onSubmit" type="primary">
                {{ $t('3dViewerProfile.profileForm.form.buttons.save') }}
            </el-button>
        </div>
        <hr class="horizontal-line" />
        <div class="form mt-5">
            <div class="mt-3">
                <BaseInputText
                    v-model:value="form.name"
                    :isRequired="true"
                    :label="$t('3dViewerProfile.profileForm.form.labels.name')"
                    :placeholder="$t('3dViewerProfile.profileForm.form.placeholder.name')"
                    :isHorizontal="true"
                    :error="translateYupError(form.errors.name)"
                />
            </div>
            <div class="mt-3">
                <BaseInputTextarea
                    v-model:value="form.description"
                    :placeholder="
                        $t('3dViewerProfile.profileForm.form.placeholder.description')
                    "
                    :label="$t('3dViewerProfile.profileForm.form.labels.description')"
                    :isHorizontal="true"
                />
            </div>
            <div class="d-flex mt-3">
                <div class="w-25 text-left fw-bold">
                    {{ $t('3dViewerProfile.profileForm.form.labels.default') }}
                </div>
                <div class="w-75">
                    <el-checkbox v-model="form.isDefaultSelect" />
                </div>
            </div>
            <div class="d-flex mt-3">
                <div class="w-25 text-left d-flex fw-bold">
                    {{ $t('3dViewerProfile.profileForm.form.labels.permissions')
                    }}<span class="mark-red">*</span>
                </div>
                <div class="w-75">
                    <ProfilePermissionForm
                        :error="translateYupError(form.errors.permissions)"
                        @onCheckNode="onChangePermission"
                        v-model:value="selectedPermissions"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import ProfilePermissionForm from './ProfilePermissionForm.vue';
import { initProfileValue, setupProfileForm } from '../../composition/form';
import { ProfilePermissionCategories, ProjectSecurityPermissions } from '../../constants';
import { profileModule } from '../../store';
import { Watch } from 'vue-property-decorator';
import { projectModule } from '@/features/project/store';
import { AccessModules } from '@/common/constants';
import { authModule } from '@/features/auth/store';
import { IProfile } from '../../interfaces';

@Options({
    components: {
        ProfilePermissionForm,
    },
})
export default class ProfileForm extends mixins(UtilMixins) {
    form = setup(() => setupProfileForm());

    get title(): string {
        return this.selectedProfile?._id?.length
            ? this.$t('3dViewerProfile.profileForm.form.title.update')
            : this.$t('3dViewerProfile.profileForm.form.title.create');
    }

    get selectedPermissions(): ProjectSecurityPermissions[] {
        return this.form.permissions as ProjectSecurityPermissions[];
    }

    set selectedPermissions(value: ProjectSecurityPermissions[]) {
        this.form.setFieldValue('permissions', value);
    }

    get selectedProfile() {
        return profileModule.selectedProfile;
    }

    get selectedProjectId(): string {
        return projectModule.selectedProjectId || '';
    }

    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    created() {
        this.form.projectId = projectModule.selectedProjectId || '';
        this.form.accessModule = authModule.selectedAccessModule;
    }

    onChangePermission(permissions: string[]) {
        const categories = Object.values(ProfilePermissionCategories);
        const selectedPermissions = permissions.filter(
            (item) => !categories.includes(item as ProfilePermissionCategories),
        );
        this.form.setFieldValue('permissions', selectedPermissions);
    }

    @Watch('selectedProfile')
    onChangeSelectedProfile(value: IProfile | null, oldValue: IProfile | null) {
        if (!value && oldValue) {
            this.form.resetForm({
                values: {
                    ...initProfileValue,
                    projectId: oldValue.projectId || '',
                    accessModule: authModule.selectedAccessModule as string,
                },
                errors: {
                    description: undefined,
                    name: undefined,
                    permissions: undefined,
                    isDefaultSelect: undefined,
                },
            });
        } else if (value) {
            this.form.resetForm({
                values: {
                    ...initProfileValue,
                    permissions: value?.permissions || [],
                    name: value?.name || '',
                    description: value?.description || '',
                    projectId: value?.projectId || '',
                    isDefaultSelect: value?.isDefaultSelect || false,
                    accessModule: authModule.selectedAccessModule as string,
                },
                errors: {
                    description: undefined,
                    name: undefined,
                    permissions: undefined,
                    isDefaultSelect: undefined,
                },
            });
        }
    }

    @Watch('selectedAccessModule')
    onChangeSelectedAccessModule(selectedAccessModule: AccessModules) {
        this.form.accessModule = selectedAccessModule;
    }
}
</script>

<style scoped lang="scss">
.title {
    font-size: 16px;
    font-weight: 650;
}

.mark-red {
    color: red;
}

.profile-form {
    background-color: #fff;
    border-radius: 16px;
    padding: 30px 25px;
    // min-height: calc(100vh - 90px);
}
</style>
