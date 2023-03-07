<template>
    <div :style="{ textAlign: 'right' }">
        <el-button
            :disabled="isDisabledSaveButton"
            type="primary"
            @click="onClickSaveButton"
        >
            {{ $t('planning.buttons.save') }}
        </el-button>
        <el-button
            :disabled="isDisabledSaveButton"
            type="danger"
            @click="onClickCancelButton"
        >
            {{ $t('planning.buttons.cancel') }}
        </el-button>
    </div>
    <div class="row">
        <div class="col-12">
            <BaseInputText
                v-model:value="form.name"
                :label="$t('planning.appearanceProfile.appearanceProfileList.name')"
                :placeholder="$t('planning.appearanceProfile.placeholder.name')"
                :error="translateYupError(form.errors.name)"
                :is-required="true"
            />
        </div>
        <div class="col-6">
            <BaseSingleSelect
                v-model:value="form.type"
                :label="$t('planning.appearanceProfile.appearanceProfileList.type')"
                :placeholder="$t('planning.appearanceProfile.placeholder.type')"
                :error="translateYupError(form.errors.type)"
                :options="appearanceTypeOptions"
                :filterable="true"
                :is-required="true"
            />
        </div>
        <div class="col-6">
            <BaseSingleSelect
                v-model:value="form.growthSimulation"
                :label="
                    $t(
                        'planning.appearanceProfile.appearanceProfileList.growthSimulation',
                    )
                "
                :placeholder="
                    $t('planning.appearanceProfile.placeholder.growthSimulation')
                "
                :error="translateYupError (form.errors.growthSimulation as string)"
                :options="growthSimulationOptions"
                :filterable="true"
                :is-required="true"
            />
        </div>
        <div class="col-12">
            <AppearanceTypeDetail
                :appearanceProfileType="form.type"
                @change-active="onChangeActive"
                @change-start="onChangeStart"
                @change-end="onChangeEnd"
                :errorStartAppearance="
                    translateYupError(form.errors['startAppearanceProfile.transparencyValue'] ||'' as string)
                "
                :errorStartAppearanceColor="
                    translateYupError(form.errors['startAppearanceProfile.colorValue'] || '' as string)
                "
                :errorActiveAppearanceStartTransparency="
                    translateYupError(form.errors['activeAppearanceProfile.transparencyStartValue']|| '' as string)
                "
                :errorActiveAppearanceEndTransparency="
                    translateYupError(form.errors['activeAppearanceProfile.transparencyEndValue'] || '' as string)
                "
                :errorActiveAppearanceColor="
                    translateYupError(form.errors['activeAppearanceProfile.colorValue'] ||'' as string)
                "
                :errorEndAppearance="
                    translateYupError(form.errors['endAppearanceProfile.transparencyValue'] || '' as string)
                "
                :errorEndAppearanceColor="
                    translateYupError(form.errors['endAppearanceProfile.colorValue'] ||'' as string)
                "
            />
        </div>
        <div class="col-12">
            <BaseSingleSelect
                v-model:value="selectedResourceId"
                :label="$t('planning.resourceGroup.resourceGroupList.resources')"
                :placeholder="$t('planning.resourceGroup.placeholder.resources')"
                :options="resourceOptions"
                :filterable="true"
            />
        </div>
    </div>
    <BaseTableLayout
        v-if="selectedResource?.files?.length"
        :data="selectedResource?.files"
        :totalItems="selectedResource?.files?.length"
        :isShowPagination="false"
        @selection-change="handleSelectionChange"
        :rowSelectionIds="selectedAppearanceProfile?.assignFileIds"
    >
        <template #table-columns>
            <el-table-column type="selection" width="55" />
            <el-table-column
                :label="$t('planning.resource.fileList.name')"
                min-width="250"
            >
                <template #default="scope">
                    {{ scope.row.name }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('planning.resource.fileList.createdBy')"
                prop="fullName"
                min-width="210"
            >
                <template #default="scope">
                    {{ scope.row.user?.firstName || '' }}
                    {{ scope.row.user?.lastName || '' }}
                </template>
            </el-table-column>
        </template>
    </BaseTableLayout>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import {
    innitAppearanceProfile,
    setupAppearanceProfileForm,
} from '../../compositions/appearanceProfileForm';
import { projectPlanningModule } from '../../store';
import { Planning4DMixin } from '../../mixins/mixin';
import { parseLanguageSelectOptions } from '@/common/helpers';
import {
    AppearanceOptions,
    AppearanceTypeOptions,
    GrowthSimulationOptions,
} from '../../constants';
import { projectPlanningService } from '../../services/planning.service';
import { IProjectFile } from '@/common/interfaces';
import AppearanceTypeDetail from './AppearanceTypeDetail.vue';

@Options({ components: { AppearanceTypeDetail } })
export default class AppearanceProfileDetail extends mixins(Planning4DMixin) {
    rowSelectionIds: string[] = [];
    multipleSelectionFile = [];
    selectedResourceId = '';
    form = setup(() => setupAppearanceProfileForm());

    get selectedAppearanceProfile() {
        return projectPlanningModule.selectedAppearanceProfile;
    }

    get appearanceTypeOptions() {
        return parseLanguageSelectOptions(AppearanceTypeOptions);
    }

    get growthSimulationOptions() {
        return parseLanguageSelectOptions(GrowthSimulationOptions);
    }

    get resourceOptions() {
        return projectPlanningModule.resourceList.map((resource) => ({
            label: resource.name,
            value: resource._id,
        }));
    }

    get selectedResource() {
        return projectPlanningModule.selectedResource;
    }

    async onClickSaveButton() {
        projectPlanningModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        projectPlanningModule.setIsDisableSaveButton(false);
    }

    async onClickCancelButton() {
        projectPlanningModule.setSelectedAppearanceProfile(null);
        projectPlanningModule.setIsShowAppearanceProfileDetailForm(false);
        this.form.resetForm({ values: { ...innitAppearanceProfile } });
    }

    created() {
        if (projectPlanningModule.selectedAppearanceProfile) {
            this.form.resetForm({
                values: {
                    name: this.selectedAppearanceProfile?.name || '',
                    type: this.selectedAppearanceProfile?.type || '',
                    growthSimulation:
                        this.selectedAppearanceProfile?.growthSimulation || '',
                    assignFileIds: this.selectedAppearanceProfile?.assignFileIds || [],
                    startAppearanceProfile: this.selectedAppearanceProfile
                        ?.startAppearanceProfile || {
                        colorType: AppearanceOptions.ORIGINAL,
                        colorValue: '',
                        transparencyType: AppearanceOptions.ORIGINAL,
                        transparencyValue: 0,
                    },
                    activeAppearanceProfile: this.selectedAppearanceProfile
                        ?.activeAppearanceProfile || {
                        colorType: AppearanceOptions.ORIGINAL,
                        colorValue: '',
                        transparencyType: AppearanceOptions.ORIGINAL,
                        transparencyStartValue: 0,
                        transparencyInterpolation: false,
                        transparencyEndValue: 0,
                    },
                    endAppearanceProfile: this.selectedAppearanceProfile
                        ?.endAppearanceProfile || {
                        colorType: AppearanceOptions.ORIGINAL,
                        colorValue: '',
                        transparencyType: AppearanceOptions.ORIGINAL,
                        transparencyValue: 0,
                    },
                },
            });
        }
        projectPlanningModule.setSelectedResource(null);
    }

    handleSelectionChange(files: IProjectFile[]) {
        this.form.assignFileIds = files.map((file) => file._id);
    }

    onChangeActive(
        colorType: AppearanceOptions,
        colorValue: string,
        transparencyType: AppearanceOptions,
        transparencyStartValue: number,
        transparencyInterpolation: boolean,
        transparencyEndValue: number,
    ) {
        this.form.activeAppearanceProfile = {
            colorType,
            colorValue,
            transparencyType,
            transparencyStartValue,
            transparencyInterpolation,
            transparencyEndValue,
        };
    }

    onChangeStart(
        colorType: AppearanceOptions,
        colorValue: string,
        transparencyType: AppearanceOptions,
        transparencyValue: number,
    ) {
        this.form.startAppearanceProfile = {
            colorType,
            colorValue,
            transparencyType,
            transparencyValue,
        };
    }

    onChangeEnd(
        colorType: AppearanceOptions,
        colorValue: string,
        transparencyType: AppearanceOptions,
        transparencyValue: number,
    ) {
        this.form.endAppearanceProfile = {
            colorType,
            colorValue,
            transparencyType,
            transparencyValue,
        };
    }

    @Watch('selectedAppearanceProfile')
    resetForm() {
        this.form.resetForm({
            values: {
                name: this.selectedAppearanceProfile?.name || '',
                type: this.selectedAppearanceProfile?.type || '',
                growthSimulation: this.selectedAppearanceProfile?.growthSimulation || '',
                assignFileIds: this.selectedAppearanceProfile?.assignFileIds || [],
                startAppearanceProfile: this.selectedAppearanceProfile
                    ?.startAppearanceProfile || {
                    colorType: AppearanceOptions.ORIGINAL,
                    colorValue: '',
                    transparencyType: AppearanceOptions.ORIGINAL,
                    transparencyValue: 0,
                },
                activeAppearanceProfile: this.selectedAppearanceProfile
                    ?.activeAppearanceProfile || {
                    colorType: AppearanceOptions.ORIGINAL,
                    colorValue: '',
                    transparencyType: AppearanceOptions.ORIGINAL,
                    transparencyStartValue: 0,
                    transparencyInterpolation: false,
                    transparencyEndValue: 0,
                },
                endAppearanceProfile: this.selectedAppearanceProfile
                    ?.endAppearanceProfile || {
                    colorType: AppearanceOptions.ORIGINAL,
                    colorValue: '',
                    transparencyType: AppearanceOptions.ORIGINAL,
                    transparencyValue: 0,
                },
            },
        });
        projectPlanningModule.setSelectedResource(null);
    }

    @Watch('selectedResourceId')
    async getSelectedResource() {
        const resource = await projectPlanningService.getResourceDetail(
            this.selectedResourceId,
        );
        if (resource.success) {
            projectPlanningModule.setSelectedResource(resource.data);
        }
    }
}
</script>
