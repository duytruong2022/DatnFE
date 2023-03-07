<template>
    <div>
        <BaseInputText
            :isRequired="true"
            :placeholder="$t('planning.taskFields.placeholder.fieldName')"
            :label="$t('planning.taskFields.labels.name')"
            v-model:value="taskFieldForm.name"
            :error="translateYupError(taskFieldForm.errors.name)"
        />
        <BaseSingleSelect
            :isRequired="true"
            :label="$t('planning.taskFields.labels.dataType')"
            :placeholder="$t('planning.taskFields.placeholder.dataType')"
            :isDisabled="updating"
            v-model:value="taskFieldForm.dataType"
            :options="dataTypeOptions"
            :error="translateYupError(taskFieldForm.errors.dataType)"
        />
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { Folder, CaretRight } from '@element-plus/icons-vue';
import { UtilMixins } from '@/mixins/utilMixins';
import { TaskFieldDataType } from '../../constants';
import { projectPlanningModule } from '../../store';
import { Prop } from 'vue-property-decorator';
import { TaskActions } from '../../interfaces';

@Options({
    components: {
        Folder,
        CaretRight,
    },
})
export default class TaskFieldFormPopup extends mixins(UtilMixins) {
    @Prop({})
    readonly taskFieldForm!: any;
    TaskFieldDataType = TaskFieldDataType;
    booleanOptions: { label: string; value: boolean }[] = [];

    created() {
        this.booleanOptions = [
            { label: this.$t('planning.taskFields.labels.true'), value: true },
            { label: this.$t('planning.taskFields.labels.false'), value: false },
        ];
    }

    get dataTypeOptions() {
        return Object.values(TaskFieldDataType).map((item) => {
            return {
                label: this.$t(`planning.taskFields.dataType.${item}`),
                value: item,
            };
        });
    }

    get updating(): boolean {
        return projectPlanningModule.taskFieldsParams.action === TaskActions.UPDATE;
    }
}
</script>

<style lang="scss" scoped></style>
