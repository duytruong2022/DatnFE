<template>
    <BaseRightDrawer
        :title="
            isShowAppearanceProfileDetailsForm
                ? selectedAppearanceProfile?._id
                    ? $t(`planning.appearanceProfile.title.appearanceProfileDetail`)
                    : $t(`planning.appearanceProfile.title.createAppearanceProfile`)
                : $t(`planning.appearanceProfile.title.appearanceProfileList`)
        "
        v-model:value="isShowAppearanceProfilePopup"
        size="50%"
        customClass="appearance-profile-form"
        @onClosed="closePopup"
        @onOpen="openPopup"
    >
        <template #body>
            <div v-if="!isShowAppearanceProfileDetailsForm">
                <div :style="{ textAlign: 'right' }">
                    <el-button
                        type="primary"
                        @click="onClickSaveButton"
                        v-if="canCreateAppearanceProfile"
                    >
                        {{ $t('planning.buttons.create') }}
                    </el-button>
                </div>
                <BaseTableLayout
                    :data="appearanceProfileList"
                    :totalItems="appearanceProfileList?.length"
                    :isShowPagination="false"
                >
                    <template #table-columns>
                        <el-table-column
                            :label="
                                $t(
                                    'planning.appearanceProfile.appearanceProfileList.name',
                                )
                            "
                            min-width="150"
                        >
                            <template #default="scope">
                                {{ scope.row.name }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="
                                $t(
                                    'planning.appearanceProfile.appearanceProfileList.type',
                                )
                            "
                            prop="fullName"
                            min-width="150"
                        >
                            <template #default="scope">
                                {{
                                    $t(
                                        `planning.appearanceProfile.appearanceType.${scope.row.type}`,
                                    )
                                }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="
                                $t(
                                    'planning.appearanceProfile.appearanceProfileList.growthSimulation',
                                )
                            "
                            prop="fullName"
                            min-width="150"
                        >
                            <template #default="scope">
                                {{
                                    $t(
                                        `planning.appearanceProfile.growthSimulation.${scope.row.growthSimulation}`,
                                    )
                                }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            fixed="right"
                            align="center"
                            :label="
                                $t(
                                    'planning.appearanceProfile.appearanceProfileList.action',
                                )
                            "
                            width="170"
                        >
                            <template #default="scope">
                                <div class="button-group">
                                    <el-tooltip
                                        effect="dark"
                                        :content="$t('planning.buttons.edit')"
                                        placement="top"
                                    >
                                        <el-button
                                            type="warning"
                                            size="mini"
                                            @click="onClickButtonEdit(scope.row._id)"
                                            v-if="canCreateAppearanceProfile"
                                        >
                                            <EditIcon class="action-icon" />
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip
                                        effect="dark"
                                        :content="$t('planning.buttons.delete')"
                                        placement="top"
                                    >
                                        <el-button
                                            type="danger"
                                            size="mini"
                                            @click.stop="
                                                onClickButtonDelete(scope.row._id)
                                            "
                                        >
                                            <DeleteIcon class="action-icon" />
                                        </el-button>
                                    </el-tooltip>
                                </div>
                            </template>
                        </el-table-column>
                    </template>
                </BaseTableLayout>
            </div>
            <AppearanceProfileDetail v-else />
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { projectPlanningModule } from '../../store';
import AppearanceProfileDetail from './AppearanceProfileDetail.vue';
import { Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
import { projectPlanningService } from '../../services/planning.service';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { HttpStatus } from '@/common/constants';
import { Planning4DMixin } from '../../mixins/mixin';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import localStorageAuthService from '@/common/authStorage';
import { projectModule } from '@/features/project/store';

@Options({ components: { AppearanceProfileDetail, EditIcon, DeleteIcon } })
export default class AppearanceProfilePopup extends mixins(Planning4DMixin) {
    get isShowAppearanceProfilePopup() {
        return projectPlanningModule.isShowAppearanceProfilePopup;
    }

    get isShowAppearanceProfileDetailsForm() {
        return projectPlanningModule.isShowAppearanceProfileDetailForm;
    }

    get appearanceProfileList() {
        return projectPlanningModule.appearanceProfileList;
    }

    get selectedAppearanceProfile() {
        return projectPlanningModule.selectedAppearanceProfile;
    }

    get canCreateAppearanceProfile() {
        return this.planningPermissions.includes(
            ProjectSecurityPermissions['4DPLANNING_CREATE_APPEARANCE_PROFILE'],
        );
    }

    get planningPath() {
        return localStorageAuthService.getPlanningPermissions().path;
    }

    onClickSaveButton() {
        projectPlanningModule.setIsShowAppearanceProfileDetailForm(true);
    }

    openPopup() {
        projectPlanningModule.getAppearanceProfileList({
            planningId: projectPlanningModule.planning?._id || '',
        });
        projectPlanningModule.setIsShowAppearanceProfileDetailForm(false);
        projectPlanningModule.setSelectedAppearanceProfile(null);
        projectPlanningModule.getResourceList({
            planningId: projectPlanningModule.planning?._id || '',
            projectId: projectModule.selectedProjectId || '',
            path: this.planningPath || '',
        });
    }

    closePopup() {
        projectPlanningModule.setIsShowAppearanceProfilePopup(false);
    }

    async onClickButtonEdit(id: string) {
        const appearanceProfile = await projectPlanningService.getAppearanceProfileDetail(
            id,
        );
        if (appearanceProfile.success) {
            projectPlanningModule.setSelectedAppearanceProfile(appearanceProfile.data);
            projectPlanningModule.setIsShowAppearanceProfileDetailForm(true);
        }
    }

    async onClickButtonDelete(id: string) {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('planning.appearanceProfile.message.confirmAsk') as string,
            i18n.global.t(
                'planning.appearanceProfile.title.deleteAppearanceProfile',
            ) as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.appearanceProfile-form',
            });
            const response = await projectPlanningService.deleteAppearanceProfile(id);
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    i18n.global.t(
                        'planning.appearanceProfile.message.deleteSuccess',
                    ) as string,
                );
                const loading = ElLoading.service({
                    target: '.appearanceProfile-form',
                });
                await projectPlanningModule.getAppearanceProfileList({
                    planningId: projectPlanningModule.planning?._id || '',
                });
                loading.close();
                this.$emit('delete-appearanceProfile-success');
                projectPlanningModule.setNeedReload3DViewer(true);
            } else {
                showErrorNotificationFunction(response.message as string);
                if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                    const loading = ElLoading.service({
                        target: '.main-wrapper',
                    });
                    await projectPlanningModule.getAppearanceProfileList({
                        planningId: projectPlanningModule.planning?._id || '',
                    });
                    loading.close();
                }
            }
        }
    }
}
</script>

<style scoped lang="scss">
.action-icon {
    height: 16px;
    width: 16px;
}
</style>
