<template>
    <div class="select-profile-group">
        <BaseSingleSelect
            :isRequired="true"
            :options="options"
            :placeholder="placeholder"
            v-model:value="selected"
            @change="changeProfile"
            :filterable="true"
        />
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { Model, Prop } from 'vue-property-decorator';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { HttpStatus } from '@/common/constants';
import { UtilMixins } from '@/mixins/utilMixins';
import { projectGroupModule } from '../store';
import { projectGroupService } from '../services/api.services';

@Options({ components: {} })
export default class SelectProjectProfile extends mixins(UtilMixins) {
    @Prop({ default: '' }) readonly options!: string;
    @Prop({ default: '' }) readonly projectGroupId!: string;
    @Prop({ default: '' }) readonly placeholder!: string;

    @Model('value', { type: [String, Number] })
    inputValue!: string;

    selectedValue = '';

    get selected(): string {
        this.selectedValue = this.inputValue || '';
        return this.selectedValue;
    }

    set selected(value: string) {
        this.selectedValue = value;
    }

    async changeProfile(): Promise<void> {
        const loading = ElLoading.service({
            target: '.project-group-table-wrapper',
        });

        const response = await projectGroupService.updateProjectGroupProfile(
            this.projectGroupId,
            {
                projectProfileId: this.selectedValue,
            },
        );

        if (response.success) {
            showSuccessNotificationFunction(
                i18n.global.t('projectGroup.message.update.success') as string,
            );

            await projectGroupModule.getGroupList();
            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                await projectGroupModule.getGroupList();
                loading.close();
            }
        }
    }
}
</script>

<style scoped lang="scss">
.select-profile-group {
    :deep(.position-relative) {
        height: 32px !important;
        .el-input {
            height: 35px;
        }
    }
}

.action-icon {
    height: 16px;
    width: 16px;
}
</style>
