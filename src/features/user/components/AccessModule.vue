<template>
    <div class="title">
        {{ $t('userForm.accessModule.title') }}
    </div>
    <hr class="horizontal-line" />
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
        <el-checkbox-group class="col-md-8" v-model="specialistic3DWebviewRoles">
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
                    />
                </div>
            </div>
        </el-checkbox-group>
    </div>
    <div class="row">
        <div class="col-md-4">
            {{ $t('userForm.accessModule.specialisticConstellation') }}
        </div>
        <el-radio-group class="col-md-8" v-model="specialisticConstellationRole">
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
                    />
                </div>
            </div>
        </el-radio-group>
    </div>
    <div class="row">
        <div class="col-md-4">
            {{ $t('userForm.accessModule.specialisticPlatform') }}
        </div>
        <el-radio-group class="col-md-8" v-model="specialisticPlatformRole">
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
                    />
                </div>
            </div>
        </el-radio-group>
    </div>
</template>

<script lang="ts">
import { UserRoles } from '@/common/constants';
import { parseLanguageSelectOptions } from '@/common/helpers';
import { IDropDownOption } from '@/common/interfaces';
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-class-component';
import { accessModuleRoleOptions } from '../constant';
import { userModule } from '../store';

export default class AccessModule extends mixins(UtilMixins) {
    get specialistic3DWebviewRoles() {
        return userModule.specialistic3DWebviewRoles;
    }

    set specialistic3DWebviewRoles(specialistic3DWebview: UserRoles[]) {
        const noneRole = UserRoles.NONE;
        const noneRoleIndex = specialistic3DWebview.findIndex(
            (specialistic3D) => specialistic3D === noneRole,
        );
        const oldNoneRoleIndex = userModule.specialistic3DWebviewRoles.findIndex(
            (specialistic3D) => specialistic3D === noneRole,
        );
        if (
            !specialistic3DWebview.length ||
            (oldNoneRoleIndex === -1 && noneRoleIndex !== -1)
        ) {
            specialistic3DWebview = [noneRole];
        }
        if (oldNoneRoleIndex !== -1 && noneRoleIndex !== -1) {
            specialistic3DWebview.splice(noneRoleIndex, noneRoleIndex + 1);
        }
        userModule.setSpecialistic3DWebviewRoles(specialistic3DWebview);
    }

    get specialisticConstellationRole() {
        return userModule.specialisticConstellationRole;
    }

    set specialisticConstellationRole(specialisticConstellation: UserRoles) {
        userModule.setSpecialisticConstellationRole(specialisticConstellation);
    }

    get specialisticPlatformRole() {
        return userModule.specialisticPlatformRole;
    }

    set specialisticPlatformRole(specialisticPlatform: UserRoles) {
        userModule.setSpecialisticPlatformRole(specialisticPlatform);
    }

    get accessModuleRoleOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(accessModuleRoleOptions);
    }
}
</script>
<style lang="scss" scoped>
.title {
    font-weight: 700;
    font-size: 17px;
    text-transform: uppercase;
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
