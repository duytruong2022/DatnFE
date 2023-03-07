<template>
    <div :style="{ textAlign: 'right' }">
        <el-button
            type="primary"
            @click="onClickSaveButton"
            :isDisabled="!canCreateActivityCode"
            >{{ $t('planning.buttons.save') }}</el-button
        >
        <el-button type="danger" @click="onClickCancelButton">{{
            $t('planning.buttons.cancel')
        }}</el-button>
    </div>
    <div class="row">
        <div class="col-6">
            <BaseInputText
                v-model:value="form.name"
                :label="$t('planning.activityCode.label.name')"
                :placeholder="$t('planning.activityCode.placeholder.name')"
                :error="translateYupError(form.errors.name as string)"
                :isRequired="true"
                :maxLength="maxLength"
            />
        </div>
        <div class="col-6">
            <BaseSingleTreeSelect
                :label="$t('planning.activityCode.label.parent')"
                v-model:value="form.parentId"
                :props="activityCodeValueTreeSelectProps"
                checkStricky
                defaultExpandAll
                lazy
                :load="nodeLoad"
                :error="translateYupError(form.errors.parentId as  string)"
                :placeholder="$t('planning.activityCode.placeholder.parent')"
            />
        </div>
        <div class="col-6">
            <BaseColorPicker
                v-model:value="form.colorCode"
                :label="$t('planning.activityCode.label.color')"
                :placeholder="$t('planning.activityCode.placeholder.color')"
                :error="translateYupError(form.errors.colorCode as string)"
                :isRequired="true"
            />
        </div>
        <div class="col-12">
            <BaseInputTextarea
                v-model:value="form.description"
                :label="$t('planning.activityCode.label.description')"
                :placeholder="$t('planning.activityCode.placeholder.description')"
                :autosize="{ minRows: 2, maxRows: 4 }"
                :error="translateYupError(form.errors.description as string)"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import { mixins, Options, setup } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { setupActivityCodeValueForm } from '../../compositions/activityCodeValueForm';
import { IActivityCodeValueItem } from '../../interfaces';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';

@Options({
    components: {},
})
export default class ActivityCodeValueForm extends mixins(Planning4DMixin) {
    @Prop({ default: [] }) readonly activityCodeValueList!: IActivityCodeValueItem[] | [];

    form = setup(() => setupActivityCodeValueForm());

    activityCodeValueTreeSelectProps = {
        label: 'label',
        children: 'children',
        isLeaf: 'isLeaf',
    };

    get maxLength() {
        const activityCodeId =
            projectPlanningModule.activityCodePopupParam.activityCodeIdSelected;
        return (
            projectPlanningModule.activityCodeList.find((activityCode) => {
                return activityCode._id === activityCodeId;
            })?.maxLength || 0
        );
    }

    get canCreateActivityCode() {
        return this.planningPermissions.includes(
            ProjectSecurityPermissions['4DPLANNING_CREATE_ACTIVITY_CODE'],
        );
    }
    async onClickSaveButton() {
        const response = await this.form.onSubmit();
        const isCreate = projectPlanningModule.activityCodePopupParam.isCreate;
        if (response) {
            this.$emit('close-activity-code-value-form');
            if (!isCreate) {
                this.$emit('updated-activity-code-value');
                showSuccessNotificationFunction(
                    this.$t(
                        'planning.activityCode.message.updateActivityCodeValueSuccess',
                    ),
                );
            } else {
                showSuccessNotificationFunction(
                    this.$t(
                        'planning.activityCode.message.createActivityCodeValueSuccess',
                    ),
                );
            }
        }
    }

    onClickCancelButton() {
        this.form.resetForm({ values: this.form.initValues });
        this.$emit('close-activity-code-value-form');
    }

    nodeLoad(
        node:
            | {
                  isLeaf: boolean;
                  level: number;
                  data: { value: string; label: string; isLeaf: boolean };
              }
            | undefined,
        resolve: any,
    ): void {
        if (node?.isLeaf) {
            return resolve([]);
        }
        if (node?.level === 0) {
            return resolve(
                this.activityCodeValueList
                    .filter((activityCodeValue) => {
                        return activityCodeValue.parentId === null;
                    })
                    .map((activityCodeValue) => ({
                        value: activityCodeValue._id,
                        label: activityCodeValue.name,
                        isLeaf:
                            this.activityCodeValueList.findIndex(
                                (item) => item.parentId === activityCodeValue._id,
                            ) === -1,
                    })),
            );
        }

        resolve(
            this.activityCodeValueList
                .filter((activityCodeValue) => {
                    return activityCodeValue.parentId === node?.data?.value;
                })
                .map((activityCodeValue) => ({
                    value: activityCodeValue._id,
                    label: activityCodeValue.name,
                    isLeaf:
                        this.activityCodeValueList.findIndex(
                            (item) => item.parentId === activityCodeValue._id,
                        ) === -1,
                })),
        );
    }

    async created() {
        const activityCodeValue =
            projectPlanningModule.activityCodePopupParam.activityCodeValueSelected;
        const isCreate = projectPlanningModule.activityCodePopupParam.isCreate;
        if (activityCodeValue) {
            if (isCreate) {
                this.form.setFieldValue('parentId', activityCodeValue);
            } else {
                const response = await projectPlanningService.getActivityCodeValue(
                    activityCodeValue,
                );
                if (response.success) {
                    this.form.setValues({
                        name: response.data.name,
                        parentId: response.data.parentId,
                        description: response.data.description,
                        colorCode: response.data.colorCode,
                    });
                } else {
                    showErrorNotificationFunction(response.message);
                }
            }
        }
    }
}
</script>
