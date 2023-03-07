<template>
    <BaseRightDrawer
        :title="drawerTitle"
        @onClosed="onClosed"
        @onOpened="form.onOpen"
        v-model:value="isShowProjectForm"
        customClass="project-form"
        size="100%"
    >
        <template #body>
            <div class="text-right">
                <div class="d-flex justify-content-end footer">
                    <el-button type="danger" @click="form.onDelete" v-if="!isCreate">
                        {{ $t('project.projectForm.delete') }}
                    </el-button>
                    <el-button type="primary" @click="form.onSubmit">
                        {{ $t('project.projectForm.save') }}
                    </el-button>
                </div>
            </div>
            <BaseInputText
                v-model:value="form.name"
                :label="$t('project.projectForm.name.label')"
                :placeholder="$t('project.projectForm.name.placeholder')"
                name="name"
                :isRequired="true"
                :error="translateYupError(form.errors.name)"
            />
            <BaseInputTextarea
                v-model:value="form.description"
                :autosize="{ minRows: 2, maxRows: 4 }"
                :label="$t('project.projectForm.description.label')"
                :placeholder="$t('project.projectForm.description.placeholder')"
                name="description"
                :error="translateYupError(form.errors.description)"
            />
            <BaseSingleSelect
                v-model:value="form.category"
                :error="translateYupError(form.errors.category)"
                :label="$t('project.projectForm.category.label')"
                :placeholder="$t('project.projectForm.category.placeholder')"
                :options="categoryOptions"
                :filterable="true"
                :clearable="true"
                :isRequired="true"
            />
            <BaseSingleSelect
                v-model:value="templateProjectId"
                :label="$t('project.projectForm.selectFromExistingProject.label')"
                :placeholder="
                    $t('project.projectForm.selectFromExistingProject.placeholder')
                "
                :options="projectOptions"
                :filterable="true"
                :clearable="true"
            />
            <BaseInputText
                v-model:value="form.postalCode"
                :label="$t('project.projectForm.postalCode.label')"
                :placeholder="$t('project.projectForm.postalCode.placeholder')"
                name="postalCode"
                :isRequired="true"
                :error="translateYupError(form.errors.postalCode)"
                @keyup.enter="getCoordinatesFromPostalCode"
            />
            <BaseInputNumber
                v-model:value="form.latitude"
                :label="$t('project.projectForm.latitude.label')"
                :placeholder="$t('project.projectForm.latitude.placeholder')"
                name="latitude"
                :isRequired="true"
                :allowDecimal="true"
                :error="translateYupError(form.errors.latitude)"
            />
            <BaseInputNumber
                v-model:value="form.longitude"
                :label="$t('project.projectForm.longitude.label')"
                :placeholder="$t('project.projectForm.longitude.placeholder')"
                name="longitude"
                :isRequired="true"
                :allowDecimal="true"
                :error="translateYupError(form.errors.longitude)"
            />
            <BaseSingleSelect
                v-model:value="form.adminId"
                :options="userOptions"
                :label="$t('project.projectForm.adminId.label')"
                :placeholder="$t('project.projectForm.adminId.placeholder')"
                :error="translateYupError(form.errors.adminId)"
                :is-required="true"
                :filterable="true"
            />
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { setupProjectForm } from '../composition/projectForm';
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { projectModule } from '../store';
import { ElLoading } from 'element-plus';
import { DEFAULT_COUNTRY_CODE, ProjectCategoryOptions } from '../constants';
import {
    parseLanguageSelectOptions,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { IDropDownOption } from '@/common/interfaces';
import { ICoordinates, IProject } from '../interfaces';
import { Watch } from 'vue-property-decorator';
import { commonService } from '@/common/services/common.service';
@Options({})
export default class ProjectForm extends mixins(UtilMixins) {
    form = setup(() => setupProjectForm());
    templateProjectId = '';

    get isCreate() {
        return !projectModule.selectedProjectIdToEdit;
    }
    get drawerTitle() {
        return this.isCreate
            ? this.$t('project.projectForm.title.create')
            : this.$t('project.projectForm.title.update');
    }
    get isShowProjectForm() {
        return projectModule.isShowProjectForm;
    }
    set isShowProjectForm(value: boolean) {
        projectModule.setIsShowProjectForm(value);
    }

    get projectOptions(): IDropDownOption[] {
        return projectModule.projectList.map((project) => ({
            label: project.name,
            value: project._id,
        }));
    }

    get selectedProject(): IProject | undefined {
        return projectModule.projectList.find(
            (project) => project._id === this.templateProjectId,
        );
    }

    get categoryOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(ProjectCategoryOptions);
    }

    get selectedCoordinates(): ICoordinates {
        return projectModule.selectedCoordinates;
    }

    set selectedCoordinates(selectedCoordinates: ICoordinates) {
        projectModule.setSelectedCoordinates(selectedCoordinates);
    }

    get selectedPostalCode(): string {
        return projectModule.selectedPostalCode;
    }

    get formCoordinates(): ICoordinates {
        return {
            latitude: this.form.latitude as number,
            longitude: this.form.longitude as number,
        };
    }

    get userOptions() {
        return projectModule.userList.map((user) => ({
            label: user.email,
            value: user._id,
        }));
    }

    unmounted() {
        projectModule.setIsShowProjectForm(false);
    }

    onClosed(): void {
        this.isShowProjectForm = false;
        this.templateProjectId = '';
        this.selectedCoordinates = {
            latitude: NaN,
            longitude: NaN,
        };
        projectModule.setSelectedProjectIdToEdit(null);
    }

    async getCoordinatesFromPostalCode() {
        const loading = ElLoading.service({
            target: '.project-form-popup',
        });
        const response = await commonService.getCoordinatesFromPostalCode(
            this.form.postalCode as string,
            DEFAULT_COUNTRY_CODE,
        );
        loading.close();
        if (response.success) {
            this.form.latitude = response.data?.coordinates?.latitude;
            this.form.longitude = response.data?.coordinates?.longitude;
            this.selectedCoordinates = {
                latitude: response.data?.coordinates?.latitude,
                longitude: response.data?.coordinates?.longitude,
            };
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    @Watch('selectedProject')
    onChangeSelectedProject(selectedProject: IProject) {
        if (selectedProject?._id) {
            this.form.adminId = selectedProject?.adminId;
            this.form.postalCode = selectedProject?.postalCode;
            this.form.latitude = selectedProject?.latitude;
            this.form.longitude = selectedProject?.longitude;
            this.form.category = selectedProject?.category;
        }
    }

    @Watch('selectedPostalCode')
    onChangeSelectedPostalCode(postalCode: string) {
        if (postalCode?.length) {
            this.form.postalCode = postalCode;
        }
    }

    @Watch('selectedCoordinates', { deep: true })
    onChangeSelectedCoordinates(selectedCoordinates: ICoordinates) {
        if (selectedCoordinates.latitude || selectedCoordinates.latitude) {
            this.form.latitude = selectedCoordinates.latitude;
            this.form.longitude = selectedCoordinates.longitude;
        }
    }

    @Watch('formCoordinates', { deep: true })
    onChangeFormCoordinates(formCoordinates: ICoordinates) {
        if (formCoordinates.latitude && formCoordinates.latitude) {
            projectModule.setSelectedCoordinates(formCoordinates);
        }
    }

    @Watch('isCreate')
    onChangeIsCreate(isCreate: boolean) {
        this.form.setFieldValue('isCreate', isCreate);
    }
}
</script>
<style lang="scss" scoped></style>
