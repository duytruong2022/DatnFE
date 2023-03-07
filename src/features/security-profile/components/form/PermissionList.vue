<template>
    <div>
        <div class="fw-bold" :style="{ marginTop: '30px' }">
            {{ $t('securityProfile.drawer.permission.list') }}
            <span class="mark-required">*</span>
        </div>
        <div
            v-for="(permission, index) in permissionList"
            :key="permission"
            :style="{ display: 'flex', justifyContent: 'space-between' }"
        >
            <el-checkbox
                v-model="selectedPermissionList[index]"
                :label="$t(`securityProfile.permissions.${permission}`)"
                @change="(value) => onChange(value, permission, index)"
            ></el-checkbox>
        </div>
        <div class="invalid-feedback text-start d-block">
            {{ error }}
        </div>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { Prop } from 'vue-property-decorator';
import { ManageUsersGroupsPermissions, SecurityPermissions } from '../../constants';
import { ISecurityProfile } from '../../interface';
import { securityProfileModule } from '../../store';
export default class PermissionList extends UtilMixins {
    @Prop({ type: String })
    readonly error!: string;
    selectedPermissionList: boolean[] = Object.values(SecurityPermissions).map(
        () => false,
    );

    manageUsersGroupsPermissionIndex = 0;
    manageUsersGroupsPermissionChildrenIndexList: number[] = [];
    accessProjectLogAndReportPermissionIndex = 0;
    accessProjectLogPermissionIndex = 0;

    get permissionList(): SecurityPermissions[] {
        return Object.values(SecurityPermissions);
    }

    onChange(value: boolean, permission: SecurityPermissions, index: number) {
        this.selectedPermissionList[index] = value;
        this.$emit('on-change', value, permission);
        if (ManageUsersGroupsPermissions.includes(permission)) {
            // Check permissions relative => Check MANAGE_USERS_GROUPS
            if (value) {
                this.selectedPermissionList[this.manageUsersGroupsPermissionIndex] =
                    value;
                this.$emit('on-change', value, SecurityPermissions.MANAGE_USERS_GROUPS);
            } else {
                // Uncheck permissions relative => check exist permission relative other Check => Check MANAGE_USERS_GROUPS
                const isCheckManageUsersGroups =
                    this.manageUsersGroupsPermissionChildrenIndexList.some((index) => {
                        return this.selectedPermissionList[index] === true;
                    });
                this.selectedPermissionList[this.manageUsersGroupsPermissionIndex] =
                    isCheckManageUsersGroups;
                this.$emit(
                    'on-change',
                    isCheckManageUsersGroups,
                    SecurityPermissions.MANAGE_USERS_GROUPS,
                );
            }
            // Uncheck MANAGE_USERS_GROUPS => uncheck all permission relative
        } else if (permission === SecurityPermissions.MANAGE_USERS_GROUPS && !value) {
            this.manageUsersGroupsPermissionChildrenIndexList.forEach((index) => {
                this.selectedPermissionList[index] = value;
                this.$emit('on-change', value, this.permissionList[index]);
            });
        } else if (
            permission === SecurityPermissions.ACCESS_PROJECT_LOGS_REPORTS &&
            value
        ) {
            this.selectedPermissionList[this.accessProjectLogPermissionIndex] = value;
            this.$emit('on-change', value, SecurityPermissions.ACCESS_PROJECT_LOGS);
        } else if (permission === SecurityPermissions.ACCESS_PROJECT_LOGS && !value) {
            this.selectedPermissionList[this.accessProjectLogAndReportPermissionIndex] =
                value;
            this.$emit(
                'on-change',
                value,
                SecurityPermissions.ACCESS_PROJECT_LOGS_REPORTS,
            );
        }
    }

    get securityProfile(): ISecurityProfile | null {
        return securityProfileModule.securityProfile;
    }

    get isOpenSecurityProfileForm(): boolean {
        return securityProfileModule.isOpenSecurityProfileForm;
    }

    created() {
        this.manageUsersGroupsPermissionIndex = this.permissionList.findIndex(
            (item) => item === SecurityPermissions.MANAGE_USERS_GROUPS,
        );
        this.accessProjectLogAndReportPermissionIndex = this.permissionList.findIndex(
            (item) => item === SecurityPermissions.ACCESS_PROJECT_LOGS_REPORTS,
        );
        this.accessProjectLogPermissionIndex = this.permissionList.findIndex(
            (item) => item === SecurityPermissions.ACCESS_PROJECT_LOGS,
        );
        this.manageUsersGroupsPermissionChildrenIndexList = [];
        ManageUsersGroupsPermissions.forEach((permission) => {
            let index = this.permissionList.findIndex((item) => item === permission);
            if (index >= 0) {
                this.manageUsersGroupsPermissionChildrenIndexList.push(index);
            }
        });

        this.selectedPermissionList = this.permissionList.map(() => false);
        if (this.isOpenSecurityProfileForm) {
            const permissions = this.securityProfile?.permissions;
            permissions?.forEach((permission) => {
                const index = this.permissionList.findIndex(
                    (item) => item === permission,
                );
                this.selectedPermissionList[index] = true;
            });
        }
    }
}
</script>

<style scoped>
.mark-required {
    color: red;
}
</style>
