<template>
    <BaseRightDrawer
        :title="formTitle"
        @onClosed="onClosed"
        @onOpened="onOpened"
        @before-unmount="beforeDrawerUnmount"
        size="50%"
        v-model:value="isOpenSecurityProfileForm"
        customClass="security-profile-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button @click="onSave" type="primary">{{
                    $t('securityProfile.form.button.save')
                }}</el-button>
            </div>
            <div>
                <BaseInputText
                    v-model:value="form.name"
                    :isRequired="true"
                    :error="translateYupError(form.errors.name)"
                    :label="$t('securityProfile.table.labels.name')"
                    :placeholder="$t('securityProfile.form.placeholder.name')"
                />
                <BaseInputTextarea
                    v-model:value="form.description"
                    :label="$t('securityProfile.table.labels.description')"
                    :error="translateYupError(form.errors.description)"
                    :placeholder="$t('securityProfile.form.placeholder.description')"
                />
                <div class="fw-bold" :style="{ display: 'flex', alignItems: 'center' }">
                    <div
                        :style="{
                            marginRight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                        }"
                    >
                        {{ $t('securityProfile.drawer.permission.defaultCheck') }}
                    </div>
                    <el-checkbox v-model="form.isDefaultSelect"></el-checkbox>
                </div>
            </div>
            <el-divider></el-divider>
            <PermissionList
                @onChange="onChangePermission"
                :error="translateYupError(form.errors.permissions)"
            />
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { Options, setup } from 'vue-class-component';
import { setupSecurityProfileForm } from '../../composition/form';
import { SecurityPermissions } from '../../constants';
import { ISecurityProfile } from '../../interface';
import { securityProfileModule } from '../../store';
import PermissionList from './PermissionList.vue';

@Options({
    components: {
        PermissionList,
    },
})
export default class SecurityProfileForm extends UtilMixins {
    form = setup(() => setupSecurityProfileForm());

    get securityProfile(): ISecurityProfile | null {
        return securityProfileModule.securityProfile;
    }

    get permissionList(): SecurityPermissions[] {
        return Object.values(SecurityPermissions);
    }

    onChangePermission(value: boolean, permission: SecurityPermissions) {
        if (value) {
            this.form.setFieldValue('permissions', [
                ...(this.form.values.permissions as SecurityPermissions[]),
                permission,
            ]);
        } else {
            this.form.setFieldValue('permissions', [
                ...(this.form.values.permissions as SecurityPermissions[]).filter(
                    (item) => item !== permission,
                ),
            ]);
        }
    }

    get isOpenSecurityProfileForm(): boolean {
        return securityProfileModule.isOpenSecurityProfileForm;
    }

    set isOpenSecurityProfileForm(value: boolean) {
        securityProfileModule.setIsOpenSecurityProfileForm(value);
    }

    get formTitle(): string {
        if (securityProfileModule.securityProfile?._id) {
            return this.$t('securityProfile.drawer.title.update');
        }
        return this.$t('securityProfile.drawer.title.create');
    }

    onClosed() {
        securityProfileModule.setIsOpenSecurityProfileForm(false);
        this.form.resetForm({
            values: {
                name: '',
                description: '',
                permissions: [],
                isDefaultSelect: false,
            },
        });
    }

    onSave() {
        this.form.onSubmit();
    }

    onOpened(): void {
        if (
            this.isOpenSecurityProfileForm &&
            securityProfileModule.securityProfile?._id
        ) {
            this.form.setFieldValue('name', securityProfileModule.securityProfile.name);
            this.form.setFieldValue(
                'description',
                securityProfileModule.securityProfile.description,
            );
            this.form.setFieldValue(
                'isDefaultSelect',
                securityProfileModule.securityProfile.isDefaultSelect,
            );
            this.form.setFieldValue(
                'permissions',
                securityProfileModule.securityProfile.permissions,
            );
        }
    }

    beforeDrawerUnmount() {
        securityProfileModule.setSecurityProfile(null);
    }
}
</script>
