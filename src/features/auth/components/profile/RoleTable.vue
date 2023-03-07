<template>
    <div class="title">
        {{ $t('userForm.accessModule.title') }}
    </div>
    <div class="row">
        <div class="col-md-4"></div>
        <div class="col-md-8">
            <div class="row">
                <div
                    class="col-md-4 text-center"
                    v-for="accessModuleRole in accessModuleRoleOptions"
                    :key="accessModuleRole"
                >
                    {{ accessModuleRole.label }}
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-4">
            {{ $t('userForm.accessModule.specialistic3DViewer') }}
        </div>
        <el-checkbox-group :model-value="valueSpecialistic3DViewer" class="col-md-8">
            <div class="row">
                <div
                    class="col-md-4 text-center"
                    v-for="accessModuleRole in accessModuleRoleOptions"
                    :key="accessModuleRole.value"
                >
                    <el-checkbox
                        class="checkbox"
                        :class="`webview-${accessModuleRole.value}`"
                        :label="accessModuleRole.value"
                        disabled
                    />
                </div>
            </div>
        </el-checkbox-group>
    </div>
    <div class="row">
        <div class="col-md-4">
            {{ $t('userForm.accessModule.specialisticConstellation') }}
        </div>
        <el-radio-group :model-value="valueSpecialConstellation" class="col-md-8">
            <div class="row" :style="{ width: '100%', flexGrow: 1 }">
                <div
                    class="col-4 text-center"
                    v-for="accessModuleRole in accessModuleRoleOptions"
                    :key="accessModuleRole.value"
                >
                    <el-radio
                        class="checkbox"
                        :class="`constellation-${accessModuleRole.value}`"
                        :label="accessModuleRole.value"
                        disabled
                    />
                </div>
            </div>
        </el-radio-group>
    </div>
    <div class="row">
        <div class="col-md-4">
            {{ $t('userForm.accessModule.specialisticPlatform') }}
        </div>
        <el-radio-group :model-value="valueSpecialPlatform" class="col-md-8">
            <div class="row" :style="{ width: '100%', flexGrow: 1 }">
                <div
                    class="col-4 text-center"
                    v-for="accessModuleRole in accessModuleRoleOptions"
                    :key="accessModuleRole.value"
                >
                    <el-radio
                        :class="`platform-${accessModuleRole.value}`"
                        class="checkbox"
                        :label="accessModuleRole.value"
                        disabled
                    />
                </div>
            </div>
        </el-radio-group>
    </div>
</template>

<script lang="ts">
import { AccessModules, UserRoles } from '@/common/constants';
import { parseLanguageSelectOptions } from '@/common/helpers';
import { IDropDownOption } from '@/common/interfaces';
import { accessModuleRoleOptions } from '@/features/user/constant';
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-class-component';
import { IUserAccessModule } from '../../interfaces';
import { authModule } from '../../store';

export default class RoleTable extends mixins(UtilMixins) {
    get accessModule(): IUserAccessModule[] {
        return authModule.profile?.accessModules || [];
    }

    get accessModuleRoleOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(accessModuleRoleOptions);
    }

    get userRole(): string[] {
        return [UserRoles.ADMIN, UserRoles.NORMAL_USER, 'none'];
    }

    checkValueSpecialistic3DViewer(role: UserRoles): boolean {
        return !!this.accessModule.find((item) => item.roles.includes(role))?.module;
    }

    get valueSpecialistic3DViewer() {
        return (
            this.accessModule.find(
                (item) => item.module === AccessModules.SPACIALYTIC_3DWEBVIEWER,
            )?.roles || [UserRoles.NONE]
        );
    }

    get valueSpecialConstellation(): string {
        return (
            this.accessModule.find(
                (item) => item.module === AccessModules.SPACIALYTIC_CONSTELLATION,
            )?.roles[0] || UserRoles.NONE
        );
    }

    get valueSpecialPlatform(): string {
        return (
            this.accessModule.find(
                (item) => item.module === AccessModules.SPACIALYTIC_PLATFORM,
            )?.roles[0] || UserRoles.NONE
        );
    }
}
</script>
<style lang="scss" scoped>
.title {
    font-weight: 700;
    font-size: 16px;
}
.platform-normal_user {
    visibility: hidden;
}
:deep(.el-radio__label) {
    display: none !important;
}
:deep(.el-checkbox__label) {
    display: none !important;
}
</style>
