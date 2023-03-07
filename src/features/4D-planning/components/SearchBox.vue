<template>
    <div class="wrapper">
        <!-- <BaseSingleSelect
            size="large"
            :options="searchColumnOptions"
            v-model:value="searchColumn"
            filterable
            :placeholder="$t('planning.task.search.column.placeholder')"
        />
        <BaseSingleSelect
            size="large"
            :options="searchTypeOptions"
            v-model:value="searchType"
            :placeholder="$t('planning.task.search.option.placeholder')"
        /> -->
        <BaseInputText
            v-model:value="searchValue"
            size="large"
            :placeholder="$t('planning.task.search.value.placeholder')"
            @onEnter="onClickSearch"
            :max="INPUT_TEXT_MAX_LENGTH"
            className="search-box"
        />
        <el-button type="primary" @click="onClickSearch">{{
            $t('planning.searchBox.button.search')
        }}</el-button>
    </div>
</template>

<script lang="ts">
import { INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import ganttChartStorage from '@/common/ganttChartStorage';
import { mixins } from 'vue-class-component';
import { GanttColumn, SearchTaskOption } from '../constants';
import { IGanttGridDisplayingStatus } from '@/features/4D-planning/interfaces';

export default class SearchBox extends mixins() {
    searchValue = '';
    INPUT_TEXT_MAX_LENGTH = INPUT_TEXT_MAX_LENGTH;
    searchType = SearchTaskOption.APPROPRIATE;
    searchColumn = GanttColumn.NAME;

    get searchTypeOptions() {
        return Object.values(SearchTaskOption).map((item) => ({
            label: this.$t(`planning.task.search.option.${item}`),
            value: item,
        }));
    }

    get searchColumnOptions() {
        let gridSettings = ganttChartStorage.getGanttDisplayingStatus();
        if (!gridSettings) {
            gridSettings = { [GanttColumn.NAME]: true };
        } else if (!gridSettings[GanttColumn.NAME]) {
            gridSettings[GanttColumn.NAME] = true;
        }
        return [
            ...Object.keys(gridSettings || {}).filter(
                (item) => gridSettings?.[item as keyof IGanttGridDisplayingStatus],
            ),
        ].map((column: string) => ({
            label: this.$t(`planning.gantt.columns.${column}`),
            value: column,
        }));
    }

    onClickSearch() {
        this.$emit('search', {
            searchValue: this.searchValue,
            searchColumn: this.searchColumn,
            searchType: this.searchType,
        });
    }
}
</script>

<style lang="scss" scoped>
.wrapper {
    margin-left: 1px;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
}

:deep(.search-box) {
    .validation-error {
        display: none;
    }
}
:deep(.validation-error) {
    display: none;
}
</style>
