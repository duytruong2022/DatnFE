<template>
    <el-dialog
        v-model="isShowFieldSettingFormPopup"
        @open="onOpen"
        :title="$t('project.dashboard.popup.title')"
        width="25%"
        custom-class="field-setting-form-popup"
    >
        <div>
            <div class="item-wrapper" v-for="(key, index) in settingFields" :key="index">
                <span>{{ $t(`project.dashboard.popup.${key}`) }}</span>
                <el-checkbox v-model="fieldConfig[key]"></el-checkbox>
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="onClickCancel">{{
                    $t('planning.buttons.cancel')
                }}</el-button>
                <el-button type="primary" @click="onSubmit">{{
                    $t('planning.buttons.save')
                }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { projectModule } from '../store';
import { DashboardField, initProjectFieldSetting } from '../constants';
import { ElLoading } from 'element-plus';
import { projectService } from '../services/project.service';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';

export default class FieldSettingFormPopup extends Vue {
    fieldConfig = {
        ...initProjectFieldSetting,
    };
    get isShowFieldSettingFormPopup(): boolean {
        return projectModule.isShowFieldSettingsFormPopup;
    }

    set isShowFieldSettingFormPopup(isShowFieldSettingFormPopup: boolean) {
        projectModule.setIsShowFieldSettingFormPopup(isShowFieldSettingFormPopup);
    }

    get settingFields(): string[] {
        return Object.values(DashboardField);
    }

    get userProjectFieldSetting() {
        return projectModule.userProjectFieldSetting;
    }

    async onOpen() {
        const loading = ElLoading.service({ target: '.field-setting-form-popup' });
        const response = await projectService.getProjectFieldSetting(
            projectModule.selectedProjectId || '',
        );
        loading.close();
        if (response.success) {
            if (response.data) {
                this.fieldConfig = { ...response.data.settings };
                projectModule.setUserProjectFieldSetting({ ...response.data });
            }
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    async onSubmit() {
        const loading = ElLoading.service({ target: '.field-setting-form-popup' });
        const response = await projectService.setProjectFieldSetting(
            projectModule.selectedProjectId || '',
            this.fieldConfig,
        );
        loading.close();
        if (response.success) {
            this.fieldConfig = { ...response.data.settings };
            projectModule.setUserProjectFieldSetting({ ...response.data });
            showSuccessNotificationFunction(this.$t('project.dashboard.popup.success'));
            this.isShowFieldSettingFormPopup = false;
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    onClickCancel() {
        this.isShowFieldSettingFormPopup = false;
    }
}
</script>

<style lang="scss" scoped>
.item-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
