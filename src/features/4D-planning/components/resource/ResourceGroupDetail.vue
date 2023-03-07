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
        <div class="col-6">
            <BaseInputText
                v-model:value="form.name"
                :label="$t('planning.resourceGroup.resourceGroupList.name')"
                :placeholder="$t('planning.resourceGroup.placeholder.name')"
                :error="translateYupError(form.errors.name)"
                :is-required="true"
            />
        </div>
        <div class="col-6">
            <BaseMultipleSelect
                v-model:value="form.resourceIds"
                :label="$t('planning.resourceGroup.resourceGroupList.resources')"
                :placeholder="$t('planning.resourceGroup.placeholder.resources')"
                :error="translateYupError(form.errors.resourceIds)"
                :options="resourceOptions"
                :filterable="true"
            />
        </div>
        <div class="col-12">
            <BaseInputTextarea
                v-model:value="form.description"
                :label="$t('planning.resourceGroup.resourceGroupList.description')"
                :placeholder="$t('planning.resourceGroup.placeholder.description')"
                :error="translateYupError(form.errors.description)"
                :is-required="false"
            />
        </div>
    </div>
    <BaseTableLayout
        v-if="selectedResourceGroup?.resources?.length"
        :data="selectedResourceGroup?.resources"
        :totalItems="selectedResourceGroup?.resources?.length"
        :isShowPagination="false"
    >
        <template #table-columns>
            <el-table-column
                :label="$t('planning.resourceGroup.resourceGroupList.name')"
                min-width="150"
            >
                <template #default="scope">
                    {{ scope.row.name }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('planning.resource.resourceList.type')"
                min-width="150"
            >
                <template #default="scope">
                    {{ $t(`planning.resource.resourceType.${scope.row.type}`) }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('planning.resourceGroup.resourceGroupList.description')"
                min-width="250"
            >
                <template #default="scope">
                    {{ scope.row.description }}
                </template>
            </el-table-column>
        </template>
    </BaseTableLayout>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import {
    innitResourceGroup,
    setupResourceGroupForm,
} from '../../compositions/resourceGroupForm';
import { projectPlanningModule } from '../../store';
import { Planning4DMixin } from '../../mixins/mixin';

@Options({ components: {} })
export default class ResourceGroupDetail extends mixins(Planning4DMixin) {
    form = setup(() => setupResourceGroupForm());

    get resourceOptions() {
        return projectPlanningModule.resourceList.map((resource) => ({
            label: resource.name,
            value: resource._id,
        }));
    }

    get selectedResourceGroup() {
        return projectPlanningModule.selectedResourceGroup;
    }

    async onClickSaveButton() {
        projectPlanningModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        projectPlanningModule.setIsDisableSaveButton(false);
    }

    async onClickCancelButton() {
        projectPlanningModule.setSelectedResourceGroup(null);
        projectPlanningModule.setIsShowResourceGroupDetailForm(false);
        this.form.resetForm({ values: { ...innitResourceGroup } });
    }

    created() {
        if (projectPlanningModule.selectedResourceGroup) {
            this.form.resetForm({
                values: {
                    name: this.selectedResourceGroup?.name || '',
                    resourceIds: this.selectedResourceGroup?.resourceIds || [],
                    description: this.selectedResourceGroup?.description || '',
                },
            });
        }
    }

    @Watch('selectedResourceGroup')
    resetForm() {
        this.form.resetForm({
            values: {
                name: this.selectedResourceGroup?.name || '',
                resourceIds: this.selectedResourceGroup?.resourceIds || [],
                description: this.selectedResourceGroup?.description || '',
            },
        });
    }
}
</script>
