<template>
    <el-dialog
        v-model="open"
        :title="$t('planning.buttons.baseLine')"
        width="60%"
        @open="hanldeOpen"
        @close="handleClose"
    >
        <div v-if="isShowBaselineForm">
            <div class="row">
                <div class="col-md-12">
                    <div class="save-baseline-button">
                        <el-button type="primary" @click="handleSubmit">{{
                            !isCreate
                                ? $t('planning.buttons.save')
                                : $t('planning.buttons.updateName')
                        }}</el-button>
                        <el-button @click="onClickCancel">{{
                            $t('planning.buttons.cancel')
                        }}</el-button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <BaseInputText
                        :isRequired="true"
                        v-model:value="baselineForm.name"
                        @on-enter="handleSubmit"
                        :label="$t('planning.baselineForm.baselineName.label')"
                        :placeholder="
                            $t('planning.baselineForm.baselineName.placeholder')
                        "
                        :error="translateYupError(baselineForm.errors.name)"
                    />
                </div>
            </div>

            <hr />
        </div>

        <div class="baseline-btn-group-control d-flex justify-content-between">
            <div class="create-baseline-button">
                <el-button type="primary" @click="createBaseline" v-if="canCreateBase">{{
                    $t('planning.buttons.createBaseline')
                }}</el-button>
                <el-button type="danger" @click="onClickResetBaseline">{{
                    $t('planning.buttons.reset')
                }}</el-button>
            </div>
            <div>
                <el-button
                    text
                    @click="settingBaselineVisible = true"
                    class="setting-button"
                >
                    <span>
                        {{ $t('planning.buttons.settingBaseline') }}
                    </span>
                    <el-icon :size="22" class="el-icon--right">
                        <SettingIcon />
                    </el-icon>
                </el-button>
                <el-dialog
                    v-model="settingBaselineVisible"
                    width="350px"
                    append-to-body
                    :title="$t('planning.buttons.settingBaseline')"
                    @open="handleOpenSettingBaseline"
                >
                    <div class="setting-baseline-item">
                        <span class="me-2">
                            {{ $t('planning.buttons.displayBaseline') }}
                        </span>
                        <el-switch
                            v-model="baselineConfiguration.display"
                            inline-prompt
                            :active-value="true"
                            :inactive-value="false"
                        />
                    </div>
                    <div class="setting-baseline-item">
                        <span class="me-2">
                            {{ $t('planning.buttons.colorBaseline') }}
                        </span>
                        <el-color-picker v-model="baselineConfiguration.color" />
                    </div>
                    <div class="setting-baseline-item">
                        <span class="me-2">
                            {{ $t('planning.buttons.positionBaseline') }}
                        </span>
                        <el-select
                            v-model="baselineConfiguration.position"
                            placeholder="Select"
                        >
                            <el-option
                                v-for="item in optionsPositionBaseline"
                                :key="item.value"
                                :label="$t(item.label)"
                                :value="item.value"
                            />
                        </el-select>
                    </div>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button type="primary" @click="onSaveBaselineSettings">{{
                                $t('planning.buttons.save')
                            }}</el-button>
                        </span>
                    </template>
                </el-dialog>
            </div>
        </div>

        <div class="form-group d-flex flex-column">
            <el-radio-group
                @change="onChangeBaseline"
                v-model="baselineSelected"
                class="ml-4"
            >
                <div
                    class="baseline-option"
                    v-for="option in baselineOptions"
                    :key="option.value"
                >
                    <el-radio :label="option.value" size="size">{{
                        option.label
                    }}</el-radio>

                    <div class="action-icon-wrapper">
                        <el-tooltip
                            effect="dark"
                            :content="$t('planning.buttons.edit')"
                            placement="top"
                            v-if="canCreateBase"
                        >
                            <el-button
                                type="warning"
                                size="mini"
                                @click="onClickButtonEdit(option.value)"
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
                                @click.stop="deleteBaseline(option.value)"
                            >
                                <DeleteIcon class="action-icon" />
                            </el-button>
                        </el-tooltip>
                    </div>
                </div>
            </el-radio-group>
            <BaseEmptyData v-if="totalBaselineItems == 0" />
            <div class="block pagination-container">
                <el-pagination
                    :hide-on-single-page="false"
                    layout="prev, pager, next"
                    :page-size="LIMIT_PER_PAGE"
                    :total="totalBaselineItems"
                    v-model:currentPage="currentPage"
                    popper-class="pagination-select"
                    v-if="totalBaselineItems > LIMIT_PER_PAGE"
                    @current-change="handlePaginate"
                >
                </el-pagination>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { projectPlanningModule } from '../store';
import { setupBaselineForm } from '../compositions/baselineForm';
import { IBodyResponse, IDropDownOption } from '@/common/interfaces';
import { projectPlanningService } from '../services/planning.service';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Setting as SettingIcon,
} from '@element-plus/icons-vue';
import { DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import { IBaselinePlanning } from '../interfaces';
import cloneDeep from 'lodash/cloneDeep';
import { PositionBaselineOptions } from '../constants';
import { ElLoading } from 'element-plus';
import { Planning4DMixin } from '../mixins/mixin';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';

@Options({
    components: { DeleteIcon, EditIcon, SettingIcon },
})
export default class BaselineFormPopup extends mixins(Planning4DMixin) {
    LIMIT_PER_PAGE = LIMIT_PER_PAGE;
    baselineForm = setup(() => setupBaselineForm());
    isShowBaselineForm = false;

    optionsPositionBaseline = PositionBaselineOptions;

    settingBaselineVisible = false;

    baselineConfiguration = cloneDeep(projectPlanningModule.baselineConfiguration);

    get canCreateBase() {
        return this.planningPermissions.includes(
            ProjectSecurityPermissions['4DPLANNING_CREATE_BASELINE'],
        );
    }

    get open(): boolean {
        return projectPlanningModule.isShowBaselinePopup;
    }

    get baselineSelected() {
        return projectPlanningModule.baselineIdSelected;
    }

    get baselineOptions(): IDropDownOption[] {
        return projectPlanningModule.baselineList.map((baseline) => {
            return {
                value: baseline._id,
                label: baseline.name,
            };
        });
    }

    get totalBaselineItems(): number {
        return projectPlanningModule.totalBaselineItems;
    }

    get isCreate() {
        return projectPlanningModule.selectedBaselineIdToUpdate;
    }

    get currentPage(): number {
        return projectPlanningModule.baselineListQueryString.page || DEFAULT_FIRST_PAGE;
    }

    handleOpenSettingBaseline() {
        this.baselineConfiguration = cloneDeep(
            projectPlanningModule.baselineConfiguration,
        );
    }

    async handleSubmit() {
        const isSuccess = await this.baselineForm.onSubmit();
        if (isSuccess) {
            this.isShowBaselineForm = false;
        }
    }

    async hanldeOpen() {
        projectPlanningModule.resetBaselineList();
        projectPlanningModule.setBaselineListQueryString({
            page: DEFAULT_FIRST_PAGE,
        });
        const baselineResponse = await projectPlanningModule.getBaselineList();
        if (!baselineResponse.success) {
            showErrorNotificationFunction(baselineResponse.message);
        }
    }

    handleClose() {
        projectPlanningModule.setIsShowBaselinePopup(false);
        this.baselineForm.resetForm();
        this.isShowBaselineForm = false;
    }

    async createBaseline() {
        this.baselineForm.resetForm({
            values: this.baselineForm.initValues,
        });
        this.isShowBaselineForm = true;
        projectPlanningModule.setSelectedBaslineIdToUpdate(null);
    }

    onClickCancel() {
        this.isShowBaselineForm = false;
        this.baselineForm.resetForm();
        projectPlanningModule.setSelectedBaslineIdToUpdate(null);
    }

    onChangeBaseline(baselineId: string) {
        projectPlanningModule.setBaselinePlanningSelected(baselineId);
        this.isShowBaselineForm = false;
        projectPlanningModule.setIsShowBaselinePopup(false);
        this.$emit('onChangeBaseline', baselineId);
    }

    handlePaginate(pageNumber: number) {
        projectPlanningModule.setBaselineListQueryString({
            page: pageNumber,
        });
        projectPlanningModule.getBaselineList();
    }

    async onClickButtonEdit(baselineId: string) {
        this.baselineForm.resetForm();
        const response = (await projectPlanningService.getBaselineDetail(
            baselineId,
        )) as IBodyResponse<IBaselinePlanning>;
        if (response.success) {
            this.baselineForm.resetForm({
                values: {
                    name: response?.data?.name,
                },
            });
            projectPlanningModule.setSelectedBaslineIdToUpdate(baselineId);
            this.isShowBaselineForm = true;
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    async deleteBaseline(baselineId: string) {
        if (baselineId === projectPlanningModule.baselineIdSelected) {
            showErrorNotificationFunction(
                this.$t('planning.baselineForm.message.delete.cannotDelete'),
            );
            return;
        }

        const isConfirm = await showConfirmPopUpFunction(
            this.$t('planning.baselineForm.message.delete.confirmAsk') as string,
            this.$t('planning.baselineForm.message.delete.title') as string,
            {},
        );
        if (!isConfirm) return;

        const response = await projectPlanningService.deleteBaseline(baselineId);
        if (response.success) {
            showSuccessNotificationFunction(
                this.$t('planning.baselineForm.message.deleteSuccess'),
            );
        } else {
            showErrorNotificationFunction(response.message);
        }
        this.isShowBaselineForm = false;
        this.baselineForm.resetForm();
        projectPlanningModule.setBaselineListQueryString({
            page: DEFAULT_FIRST_PAGE,
        });
        projectPlanningModule.getBaselineList();
    }

    async onClickResetBaseline() {
        const response = await projectPlanningService.resetBaseline(
            projectPlanningModule.planning?._id || '',
        );
        if (response.success) {
            projectPlanningModule.setBaselinePlanningSelected('');
            showSuccessNotificationFunction(
                this.$t('planning.baselineForm.message.resetSuccess'),
            );
            this.$emit('onResetBaseline');
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    async onSaveBaselineSettings() {
        const baselineConfigurationBody = {
            display: this.baselineConfiguration.display,
            color: this.baselineConfiguration.color,
            position: this.baselineConfiguration.position,
        };
        const loading = ElLoading.service({});
        const response = await projectPlanningService.updateBaselineConfiguration(
            this.baselineConfiguration._id,
            baselineConfigurationBody,
        );
        loading.close();
        if (response.success) {
            this.settingBaselineVisible = false;
            showSuccessNotificationFunction(
                this.$t('planning.baseline.messages.updatedBaselineConfiguration'),
            );

            const oldConfiguration = projectPlanningModule.baselineConfiguration;
            projectPlanningModule.setBaselineConfiguration({
                ...oldConfiguration,
                ...baselineConfigurationBody,
            });
            this.$emit('onChangeSettingBaseline');
        } else {
            showErrorNotificationFunction(response.message);
        }
    }
}
</script>

<style lang="scss" scoped>
.create-baseline-button {
    margin-bottom: 16px;
    text-align: left;
}

.save-baseline-button {
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

:deep(.el-radio-group) {
    width: 100% !important;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.label {
    word-break: break-word;
    width: 25%;
}
.action-icon {
    height: 16px;
    width: 16px;
}

.baseline-option {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin: 4px 0 4px 0;
    align-items: center;
    :deep(.el-radio) {
        height: 100%;
        white-space: normal;
    }
}

.setting-baseline-item {
    line-height: 32px;
    padding: 6px 0;
}

:deep(.el-button.is-text.setting-button) {
    border: inherit !important;
    padding-right: 0 !important;
}

.form-group {
    margin-bottom: 0;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}
.action-icon-wrapper {
    display: flex;
}
</style>
