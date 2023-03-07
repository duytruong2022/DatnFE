<template>
    <BaseFilterFormLayout
        @search="handleFilter"
        @reset="resetFilter"
        @keyup.enter="handleFilter"
        :isShowCreateButton="false"
    >
        <div class="row">
            <div class="col-xl-6 col-md-12 col-12">
                <BaseDatePicker
                    v-model:value="filterForm.date"
                    :label="$t('projectLog.logServer.header.date')"
                    :placeholder="$t('projectLog.logServer.placeholder.date')"
                    :clearable="false"
                />
            </div>
            <div class="col-xl-6 col-md-12 col-12">
                <BaseSingleSelect
                    v-model:value="filterForm.type"
                    :options="logServerTypeOptions"
                    :label="$t('projectLog.logServer.header.type')"
                    :placeholder="$t('projectLog.logServer.placeholder.type')"
                    :clearable="false"
                />
            </div>
        </div>
    </BaseFilterFormLayout>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component';

import { ElLoading } from 'element-plus';
import { IDropDownOption } from '@/common/interfaces';
import { projectLogModule } from '../store';
import { UtilMixins } from '@/mixins/utilMixins';
import { parseLanguageSelectOptions } from '@/common/helpers';
import { Prop } from 'vue-property-decorator';
import { IGetListLogServerFileQueryString } from '../interfaces';
import { LogServerType, LogServerTypeOptions, ProjectLogType } from '../constant';
import moment from 'moment';

export default class FilterFormLogServer extends mixins(UtilMixins) {
    @Prop() readonly actionOptions!: IDropDownOption[];
    @Prop() readonly projectLogType!: ProjectLogType;

    filterForm = {
        date: '',
        type: LogServerType.INSTANCE_LOG,
    };

    get logServerTypeOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(LogServerTypeOptions);
    }

    created() {
        projectLogModule.setLogServerFileListQueryString({
            type: LogServerType.INSTANCE_LOG,
            date: moment().subtract(1, 'days').fmFullTimeString(),
        });
        this.filterForm = projectLogModule.logServerQueryString;
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            date: moment().subtract(1, 'days').fmFullTimeString(),
            type: LogServerType.INSTANCE_LOG,
        };

        projectLogModule.setLogServerFileListQueryString({ ...this.filterForm });
        await this.handleFilter();
    }

    async handleFilter(): Promise<void> {
        this.filterForm.date = moment(this.filterForm.date).fmFullTimeString();
        const query: IGetListLogServerFileQueryString = {
            date: this.filterForm.date,
            type: this.filterForm.type,
        };
        projectLogModule.setLogServerFileListQueryString({ ...query });
        const loading = ElLoading.service({
            target: '.content',
        });
        await projectLogModule.getLogServerFileList();

        loading.close();
    }
}
</script>

<style lang="scss" scoped></style>
