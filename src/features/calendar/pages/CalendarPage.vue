<template>
    <div class="calendar-page-container">
        <div class="header">
            <h4>{{ $t('calendar.list.title') }}</h4>
            <el-button
                @click="onClickCreateCalendar"
                class="create-button"
                v-if="canCreateCalendar"
                >{{ $t('calendar.list.button.create') }}</el-button
            >
        </div>
        <div v-if="totalCalendars > 0">
            <el-pagination
                :hide-on-single-page="false"
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="totalCalendars"
                v-model:currentPage="currentPage"
                popper-class="pagination-select"
                @current-change="handlePaginate"
            >
            </el-pagination>
            <div class="row">
                <div
                    class="col-md-3"
                    v-for="calendar in calendarList"
                    :key="calendar._id"
                >
                    <CalendarCard :calendar="calendar" />
                </div>
            </div>
        </div>
        <BaseEmptyData v-else />
        <CalendarFormPopup />
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { ElLoading } from 'element-plus';
import { calendarModule } from '../store';
import {
    hasPermissionToAccessRouteInProject,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import CalendarCard from '../components/calendar/CalendarCard.vue';
import { ICalendar } from '../interfaces';
import CalendarFormPopup from '../components/calendar/CalendarFormPopup.vue';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import { LIMIT_PER_PAGE } from '@/common/constants';

@Options({ components: { CalendarCard, CalendarFormPopup } })
export default class CalendarPage extends mixins(UtilMixins) {
    pageSize = LIMIT_PER_PAGE;
    get currentPage() {
        return calendarModule.currentPage;
    }

    set currentPage(value: number) {
        calendarModule.setCurrentPage(value);
    }

    get calendarList(): ICalendar[] {
        return calendarModule.calendarList;
    }

    get canCreateCalendar() {
        return hasPermissionToAccessRouteInProject([
            ProjectSecurityPermissions.GENERAL_CREATE_CALENDAR,
        ]);
    }

    get totalCalendars(): number {
        return calendarModule.totalCalendar;
    }

    async created() {
        this.initData();
    }

    async initData() {
        calendarModule.setSelectedCalendarId('');
        const loading = ElLoading.service({ target: '.main-wrapper' });
        const response = await calendarModule.getCalendarList(
            projectModule.selectedProjectId || '',
        );
        loading.close();
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        }
    }
    onClickCreateCalendar() {
        calendarModule.setIsShowCalendarFormPopup(true);
    }
    handlePaginate() {
        this.initData();
    }
}
</script>

<style lang="scss" scoped>
.calendar-page-container {
    padding: 0 24px;
}
.header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 15px;
}
</style>
