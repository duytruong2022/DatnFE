<template>
    <BaseRightDrawer
        :title="
            form.isCreate
                ? $t('pbsGroup.title.createPbsGroup')
                : $t('pbsGroup.title.updatePbsGroup')
        "
        size="50%"
        v-model:value="isShowPbsGroupForm"
        @onOpened="form.openPbsGroupForm"
        @onClosed="closePopup"
        customClass="pbs-group-form"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button type="primary" @click="onClickSaveButton">
                    {{ $t('pbsGroup.button.save') }}
                </el-button>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <BaseInputText
                        v-model:value="form.name"
                        :label="$t('pbsGroup.label.pbsGroupName')"
                        :placeholder="$t('pbsGroup.placeholder.pbsGroupName')"
                        :error="translateYupError(form.errors.name)"
                        :isRequired="true"
                    />
                </div>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { setupPbsGroupForm } from '../composition/pbsGroupForm';
import { pbsGroupModule } from '../store';

@Options({ components: {} })
export default class PbsGroupForm extends mixins(UtilMixins) {
    form = setup(() => setupPbsGroupForm());

    get isShowPbsGroupForm() {
        return pbsGroupModule.isShowPbsGroupForm;
    }

    closePopup(): void {
        pbsGroupModule.setIsShowPbsGroupForm(false);
        (this.form.resetForm as () => void)();
        pbsGroupModule.setIsCreatePbsGRoup(false);
        pbsGroupModule.setSelectedParentPbs(null);
    }

    async onClickSaveButton(): Promise<void> {
        pbsGroupModule.setIsDisableSaveButton(true);
        await this.form.onSubmit();
        pbsGroupModule.setIsDisableSaveButton(false);
    }
}
</script>
