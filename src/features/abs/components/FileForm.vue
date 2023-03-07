<template>
    <BaseRightDrawer
        :title="$t('abs.fileForm.title.update')"
        @onClosed="onClosed"
        @onOpen="onOpen"
        v-model:value="isShowFileForm"
        customClass="file-form"
        size="300px"
    >
        <template #body>
            <div class="text-right">
                <div class="d-flex justify-content-end footer">
                    <el-button type="primary" @click="handleSubmit">
                        {{ $t('abs.fileForm.save') }}
                    </el-button>
                </div>
            </div>
            <BaseInputText
                v-model:value="form.name"
                :label="$t('abs.fileForm.name.label')"
                :placeholder="$t('abs.fileForm.name.placeholder')"
                :isRequired="true"
                :error="translateYupError(form.errors.name as string)"
            />
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { absModule } from '../store';
import { setupFileForm } from '../composition/fileForm';
import { Watch } from 'vue-property-decorator';
import { DATE_TIME_FORMAT, FTPDataType } from '@/common/constants';
import { ElLoading } from 'element-plus';
import { ABSUploadedFileExtensions } from '../constants';
import { projectModule } from '@/features/project/store';
import { projectPlanningService } from '@/features/4D-planning/services/planning.service';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import localStorageAuthService from '@/common/authStorage';
import moment from 'moment';
@Options({})
export default class FileForm extends mixins(UtilMixins) {
    form = setup(() => setupFileForm());

    get isShowFileForm() {
        return absModule.isShowFileForm;
    }
    get seletedFilePath(): string {
        return absModule.selectedFilePath;
    }
    get selectedFileName(): string {
        return absModule.selectedFileName;
    }
    getFileName(name: string) {
        const nameSplited = name.split('.');
        return nameSplited.slice(0, nameSplited.length - 1).join('.');
    }

    onOpen() {
        if (absModule.selectedFileName.length) {
            this.form.name = this.getFileName(absModule.selectedFileName);
        }
        this.form.path = absModule.selectedFilePath;
        this.form.type = FTPDataType.FILE;
    }

    onClosed() {
        absModule.setIsShowFileForm(false);
        this.form.resetForm();
    }

    async handleSubmit() {
        if (absModule.selectedFileType === ABSUploadedFileExtensions.PLANNING) {
            const loading = ElLoading.service({
                target: '.create-folder-form',
            });
            const splitPath = absModule.selectedFilePath?.split('/') || [''];
            const planningResponse = await projectPlanningService.getPlanning(
                projectModule.selectedProjectId as string,
                // {
                //     name: absModule.selectedFileName.split('.')?.[0],
                //     planningFilePath:
                //         splitPath.slice(0, splitPath.length - 1).join('/') || '/',
                //     path: localStorageAuthService.getPlanningPermissions().path || '',
                //     projectId: projectModule.selectedProjectId || '',
                // },
            );
            if (planningResponse.success) {
                const response = await projectPlanningService.updatePlanning(
                    planningResponse.data._id,
                    {
                        name: this.form.name as string,
                        currency: planningResponse.data.currency,
                        durationType: planningResponse.data.durationType,
                        durationFormat: planningResponse.data.durationFormat,
                        defaultDuration: planningResponse.data.defaultDuration,
                        activityType: planningResponse.data.activityType,
                        defaultCalendar: planningResponse.data.defaultCalendar,
                        percentageCompletion: planningResponse.data.percentageCompletion,
                        autoScheduling: planningResponse.data.autoScheduling,
                    },
                );
                if (response.success) {
                    showSuccessNotificationFunction(
                        this.$t('abs.folderForm.success.update') as string,
                    );
                    absModule.setIsShowFileForm(false);
                    await absModule.getFolderFiles({
                        projectId: projectModule.selectedProjectId as string,
                        path: absModule.currentPath,
                    });
                } else if (!response.isRequestError) {
                    showErrorNotificationFunction(response.message);
                }
            }
            loading.close();
        } else {
            this.form.onSubmit();
        }
    }

    @Watch('selectedFilePath')
    onChangeSelectedFilePath(selectedFilePath: string) {
        this.form.path = selectedFilePath;
    }

    @Watch('selectedFileName')
    onChangeSelectedFileName(selectedFileName: string) {
        this.form.name = this.getFileName(selectedFileName);
    }
}
</script>
<style lang="scss" scoped></style>
