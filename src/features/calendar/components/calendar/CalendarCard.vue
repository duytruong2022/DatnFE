<template>
    <router-link :to="`/project/calendar/${calendar._id}`" class="calendar-link">
        <div class="calendar-card">
            <div class="options">
                <el-dropdown>
                    <span class="el-dropdown-link">
                        <setting-icon class="icon" />
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="onClickEdit">{{
                                $t('calendar.list.option.edit')
                            }}</el-dropdown-item>
                            <el-dropdown-item
                                @click="onClickSetDefault"
                                v-if="!calendar.isDefaultCalendar"
                                >{{
                                    $t('calendar.list.option.setAsDefault')
                                }}</el-dropdown-item
                            >
                            <el-dropdown-item @click="onClickUnsetDefault" v-else>{{
                                $t('calendar.list.option.unsetDefault')
                            }}</el-dropdown-item>
                            <el-dropdown-item @click="onClickDelete">{{
                                $t('calendar.list.option.delete')
                            }}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div class="header">
                <h4>{{ calendar.name }}</h4>
                <el-tag v-if="calendar?.isDefaultCalendar">Default</el-tag>
            </div>
        </div>
    </router-link>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { Prop } from 'vue-property-decorator';
import { ICalendar } from '../../interfaces';
import { Setting as SettingIcon } from '@element-plus/icons-vue';
import { calendarModule } from '../../store';
import { ElLoading } from 'element-plus';
import { calendarService } from '../../services/calendar.service';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';

@Options({
    components: { SettingIcon },
})
export default class CalendarCard extends mixins(UtilMixins) {
    @Prop({ required: true }) calendar!: ICalendar;

    onClickEdit() {
        calendarModule.setSelectedCalendarId(this.calendar._id);
        calendarModule.setIsShowCalendarFormPopup(true);
    }

    async onClickSetDefault() {
        const loading = ElLoading.service({ target: '.main-wrapper' });
        const response = await calendarService.setDefaultCalendar(this.calendar._id);
        if (response.success) {
            showSuccessNotificationFunction(
                this.$t('calendar.list.message.setDefault.success'),
            );
            await calendarModule.getCalendarList(projectModule.selectedProjectId || '');
        } else {
            showErrorNotificationFunction(response.message);
        }
        loading.close();
    }

    async onClickUnsetDefault() {
        const loading = ElLoading.service({ target: '.main-wrapper' });
        const response = await calendarService.unsetDefaultCalendar(this.calendar._id);
        if (response.success) {
            showSuccessNotificationFunction(
                this.$t('calendar.list.message.unsetDefault.success'),
            );
            await calendarModule.getCalendarList(projectModule.selectedProjectId || '');
        } else {
            showErrorNotificationFunction(response.message);
        }
        loading.close();
    }

    async onClickDelete() {
        const confirm = await showConfirmPopUpFunction(
            this.$t('calendar.list.message.delete.confirm.message'),
            this.$t('calendar.list.message.delete.confirm.title'),
        );
        if (confirm) {
            const loading = ElLoading.service({ target: '.main-wrapper' });
            const response = await calendarService.delete(this.calendar._id);
            if (response.success) {
                showSuccessNotificationFunction(
                    this.$t('calendar.list.message.delete.success'),
                );
                await calendarModule.getCalendarList(
                    projectModule.selectedProjectId || '',
                );
            } else {
                showErrorNotificationFunction(response.message);
            }
            loading.close();
        }
    }
}
</script>

<style lang="scss" scoped>
.calendar-link {
    text-decoration: none;
}
.calendar-card {
    background-color: #ffffff;
    padding: 20px 30px;
    margin-bottom: 24px;
    border-radius: 10px;
    position: relative;
    text-decoration: none;
    .header {
        display: flex;
        align-items: center;
        gap: 5px;
        h4 {
            color: #344767;
            margin-bottom: 0;
        }
    }
    .options {
        position: absolute;
        top: 5px;
        right: 5px;

        .icon {
            width: 24px;
        }
    }
}
</style>
