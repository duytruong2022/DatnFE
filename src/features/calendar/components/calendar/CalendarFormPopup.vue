<template>
    <el-dialog
        width="500px"
        lock-scroll
        v-model="isShowCalendarFormPopup"
        @open="onOpen"
        @closed="onClosed"
        custom-class="calendar-config-form-popup"
        destroy-on-close
    >
        <template #header>
            <h3 class="text-start">
                {{ title }}
            </h3>
        </template>
        <div>
            <BaseInputText
                v-model:value="form.name"
                :label="$t('calendar.list.popup.name.label')"
                :placeholder="$t('calendar.list.popup.name.placeholder')"
                :isRequired="true"
                :maxLength="FILE_NAME_MAX_LENGTH"
                :error="translateYupError(form.errors.name)"
            />
        </div>
        <div class="btn-upload d-flex justify-content-end">
            <el-button @click="isShowCalendarFormPopup = false">
                {{ $t('calendar.list.popup.button.cancel') }}
            </el-button>
            <el-button type="primary" @click="onSubmit">
                {{ $t('calendar.list.popup.button.save') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { Download as DownloadIcon } from '@element-plus/icons-vue';
import { calendarModule } from '../../store';
import { IDayType } from '../../interfaces';
import { UtilMixins } from '@/mixins/utilMixins';
import { calendarForm } from '../../compositions/calendarForm';

@Options({
    components: { DownloadIcon },
})
export default class CalendarFormPopup extends mixins(UtilMixins) {
    form = setup(() => calendarForm());
    workingDayTypes: IDayType[] = [];
    totalTimeBlocks = 0;

    get title() {
        return calendarModule.selectedCalendarId.length
            ? this.$t('calendar.list.popup.title.update')
            : this.$t('calendar.list.popup.title.create');
    }

    get isShowCalendarFormPopup(): boolean {
        return calendarModule.isShowCalendarFormPopup;
    }

    set isShowCalendarFormPopup(isShowCalendarFormPopup: boolean) {
        calendarModule.setIsShowCalendarFormPopup(isShowCalendarFormPopup);
    }

    async onSubmit(): Promise<void> {
        this.form.onSubmit();
    }

    async onOpen() {
        this.form.onOpen();
    }

    onClosed(): void {
        calendarModule.setSelectedCalendarId('');
        calendarModule.setIsShowCalendarFormPopup(false);
    }
}
</script>

<style lang="scss" scoped>
:deep(.el-radio) {
    width: 100% !important;
}
</style>
