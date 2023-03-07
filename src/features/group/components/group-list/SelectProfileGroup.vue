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
import { GroupMixin } from '../../mixins/GroupMixins';
import { Plus as PlusIcon } from '@element-plus/icons-vue';
import { Model, Prop } from 'vue-property-decorator';
import { groupModule } from '../../store';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { groupService } from '../../services/api.services';
import { ElLoading } from 'element-plus';
import { AccessModules, HttpStatus } from '@/common/constants';

@Options({ components: { PlusIcon } })
export default class SelectProfileGroup extends mixins(GroupMixin) {
    @Prop({ default: '' }) readonly options!: string;
    @Prop({ default: '' }) readonly groupId!: string;
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
            target: '.group-form',
        });

        const response =
            this.currentAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION
                ? await groupService.updateGroupProfile(this.groupId as string, {
                      securityProfileId: this.selectedValue,
                  })
                : await groupService.updateGroupProfile(this.groupId as string, {
                      viewer3dProfileId: this.selectedValue,
                  });

        if (response.success) {
            showSuccessNotificationFunction(
                i18n.global.t('group.message.update.success') as string,
            );

            await groupModule.getGroupList();
            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                await groupModule.getGroupList();
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
