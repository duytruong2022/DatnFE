<template>
    <BaseRightDrawer
        :title="
            form.isCreate
                ? $t('group.groupForm.title.create')
                : $t('group.groupForm.title.update')
        "
        @onClosed="closePopup"
        @onOpened="form.openPopup"
        size="50%"
        v-model:value="isShowGroupForm"
        customClass="group-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button @click="onClickCancel">{{
                    $t('group.groupForm.button.cancel')
                }}</el-button>
                <el-button @click="onClickSaveButton" type="primary">{{
                    $t('group.groupForm.button.save')
                }}</el-button>
            </div>

            <div>
                <BaseInputText
                    class="mb-4"
                    v-model:value="form.name"
                    :label="$t('group.groupForm.name.label')"
                    :placeholder="$t('group.groupForm.name.placeholder')"
                    :error="translateYupError(form.errors.name)"
                    :is-required="true"
                />
                <BaseSingleSelect
                    class="mb-4"
                    :filterable="true"
                    v-model:value="form.profileId"
                    :error="translateYupError(form.errors.profileId)"
                    :options="profileOptions"
                    :clearable="true"
                    :isDisabled="!canAssignSecurity"
                    :label="$t(`group.groupForm.profile.${currentAccessModule}.label`)"
                    :placeholder="
                        $t(`group.groupForm.profile.${currentAccessModule}.placeholder`)
                    "
                />
                <BaseInputTextarea
                    class="mb-4"
                    v-model:value="form.description"
                    :label="$t('group.groupForm.description.label')"
                    :placeholder="$t('group.groupForm.description.placeholder')"
                    :error="translateYupError(form.errors.description)"
                    :is-required="true"
                />
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { hasPermissionToAccessRouteInConstellation } from '@/common/helpers';
import { SecurityPermissions } from '@/features/security-profile/constants';
import { ElLoading } from 'element-plus';
import { mixins, setup } from 'vue-class-component';
import { setupGroupForm } from '../../composition/groupForm';
import { GroupMixin } from '../../mixins/GroupMixins';
import { groupModule } from '../../store';

export default class GroupForm extends mixins(GroupMixin) {
    form = setup(() => setupGroupForm());

    get isDisabledSaveButton(): boolean {
        return groupModule.isDisableSaveButton;
    }

    get isShowGroupForm(): boolean {
        return groupModule.isShowGroupPopUp || false;
    }

    set isShowGroupForm(val: boolean) {
        groupModule.setIsShowGroupForm(val);
    }

    get canAssignSecurity(): boolean {
        return hasPermissionToAccessRouteInConstellation([
            SecurityPermissions.ASSIGN_SECURITY_PROFILE,
        ]);
    }

    onClickCancel(): void {
        groupModule.setIsShowGroupForm(false);
    }

    async closePopup(): Promise<void> {
        groupModule.setIsShowGroupForm(false);
        groupModule.setSelectedGroup(null);
        (this.form.resetForm as () => void)();
    }

    async onClickSaveButton(): Promise<void> {
        groupModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        groupModule.setIsDisableSaveButton(false);
    }

    async initData() {
        const loading = ElLoading.service({ target: '.page-wrapper' });
        await this.getProfileList();
        loading.close();
    }

    async created() {
        this.initData();
    }
}
</script>
