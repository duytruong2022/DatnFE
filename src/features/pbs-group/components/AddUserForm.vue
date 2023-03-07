<template>
    <BaseRightDrawer
        :title="$t('pbsGroup.title.addUser')"
        size="50%"
        v-model:value="isShowAddUserForm"
        @onOpen="openAddUserForm"
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
                        v-model:value="form.userIds"
                        :options="userOptions"
                        :label="$t('pbsGroup.label.user')"
                        :placeholder="$t('pbsGroup.placeholder.user')"
                        :error="
                            translateYupError(form.errors.userId)
                                ? translateYupError(form.errors.userId)
                                : userIdError
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
import { setupAddUserForm } from '../composition/addUserForm';
import { pbsGroupModule } from '../store';

@Options({ components: {} })
export default class AddUserForm extends mixins(UtilMixins) {
    form = setup(() => setupAddUserForm());
    isOpenForm = true;
    userIdError = '';
    get isDisableSaveButton() {
        return pbsGroupModule.isDisableSaveButton;
    }

    get userOptions() {
        return pbsGroupModule.userList
            .filter(
                (user) => !pbsGroupModule.selectedPbsGroup?.userIds?.includes(user._id),
            )
            .map((user) => ({
                label: user.email,
                value: user._id,
            }));
    }

    get userIds(): string[] {
        return this.form.userIds as string[];
    }

    get isShowAddUserForm() {
        return pbsGroupModule.isShowAddUserForm;
    }

    closePopup(): void {
        pbsGroupModule.setIsShowAddUserForm(false);
        (this.form.resetForm as () => void)();
    }

    async onClickSaveButton(): Promise<void> {
        if (!this.userIds.length) {
            this.userIdError = this.$t('pbsGroup.message.userRequired');
            pbsGroupModule.setIsDisableSaveButton(true);
            return;
        }
        pbsGroupModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        pbsGroupModule.setIsDisableSaveButton(false);
    }

    openAddUserForm() {
        pbsGroupModule.getSelectedPbsGroup(pbsGroupModule.selectedPbsGroup?._id || '');
        pbsGroupModule.setIsDisableSaveButton(false);
        this.userIdError = '';
        this.isOpenForm = true;
        this.form.openAddUserForm();
    }

    @Watch('userIds')
    validateUserId() {
        this.userIdError = '';
        pbsGroupModule.setIsDisableSaveButton(false);
        if (!this.isOpenForm) {
            if (!this.userIds.length) {
                this.userIdError = this.$t('pbsGroup.message.userRequired');
                pbsGroupModule.setIsDisableSaveButton(true);
            }
        } else {
            this.isOpenForm = false;
        }
    }
}
</script>
