<template>
    <BaseRightDrawer
        :title="$t('pbsGroup.title.addGroup')"
        size="50%"
        v-model:value="isShowAddGroupForm"
        @onOpen="openAddGroupForm"
        @onClosed="closePopup"
        customClass="pbs-group-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button
                    type="primary"
                    @click="onClickSaveButton"
                    :disabled="isDisableSaveButton"
                >
                    {{ $t('pbsGroup.button.save') }}
                </el-button>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <BaseMultipleSelect
                        v-model:value="form.groupIds"
                        :options="groupOptions"
                        :label="$t('pbsGroup.label.group')"
                        :placeholder="$t('pbsGroup.placeholder.group')"
                        :error="
                            translateYupError(form.errors.groupId)
                                ? translateYupError(form.errors.groupId)
                                : groupIdError
                        "
                        :is-required="true"
                        :filterable="true"
                    />
                </div>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { Watch } from 'vue-property-decorator';
import { mixins, Options, setup } from 'vue-class-component';
import { setupAddGroupForm } from '../composition/addGroupForm';
import { pbsGroupModule } from '../store';

@Options({ components: {} })
export default class AddGroupForm extends mixins(UtilMixins) {
    form = setup(() => setupAddGroupForm());
    isOpenForm = true;
    groupIdError = '';
    get isDisableSaveButton() {
        return pbsGroupModule.isDisableSaveButton;
    }

    get groupOptions() {
        return pbsGroupModule.projectGroupList
            .filter(
                (group) =>
                    !pbsGroupModule.selectedPbsGroup?.groupIds?.includes(group._id),
            )
            .map((group) => ({
                label: group.name,
                value: group._id,
            }));
    }

    get groupIds(): string[] {
        return this.form.groupIds as string[];
    }

    get isShowAddGroupForm() {
        return pbsGroupModule.isShowAddGroupForm;
    }

    closePopup(): void {
        pbsGroupModule.setIsShowAddGroupForm(false);
        (this.form.resetForm as () => void)();
    }

    async onClickSaveButton(): Promise<void> {
        if (!this.groupIds.length) {
            this.groupIdError = this.$t('pbsGroup.message.groupRequired');
            pbsGroupModule.setIsDisableSaveButton(true);
            return;
        }
        pbsGroupModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        pbsGroupModule.setIsDisableSaveButton(false);
    }

    openAddGroupForm() {
        pbsGroupModule.getSelectedPbsGroup(pbsGroupModule.selectedPbsGroup?._id || '');
        pbsGroupModule.setIsDisableSaveButton(false);
        this.groupIdError = '';
        this.isOpenForm = true;
        this.form.openAddGroupForm();
    }

    @Watch('groupIds')
    validateGroupId() {
        this.groupIdError = '';
        pbsGroupModule.setIsDisableSaveButton(false);
        if (!this.isOpenForm) {
            if (!this.groupIds.length) {
                this.groupIdError = this.$t('pbsGroup.message.groupRequired');
                pbsGroupModule.setIsDisableSaveButton(true);
            }
        } else {
            this.isOpenForm = false;
        }
    }
}
</script>
