<template>
    <div class="table-layout">
        <div class="block pagination-container" v-if="totalPages > 1 && isShowPagination">
            <el-pagination
                :hide-on-single-page="false"
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="totalItems"
                v-model:currentPage="currentPage"
                popper-class="pagination-select"
                @current-change="handlePaginate"
            >
            </el-pagination>
        </div>
        <el-table
            header-row-class-name="table-header"
            :data="data"
            :header-cell-style="headerStyle"
            :span-method="objectSpanMethod"
            :style="style"
            :border="border"
            :stripe="stripe"
            :cell-style="cellStyle"
            :max-height="680"
            @sort-change="sortChange"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
            fit
            v-if="totalItems > 0"
            ref="refTable"
            :row-key="rowKey"
            :default-expand-all="defaultExpandAll"
        >
            <slot name="table-columns" />
        </el-table>
        <BaseEmptyData v-else />
    </div>
</template>

<script lang="ts">
import { LIMIT_PER_PAGE } from '@/common/constants';
import { IELColumnSort } from '@/common/interfaces';
import { TableRefs } from 'element-plus/es/components/table/src/table/defaults';
import { Model, Prop, Vue, Watch } from 'vue-property-decorator';

export default class TableLayout extends Vue {
    @Prop({
        default: {
            fontWeight: 700,
            backgroundColor: 'rgb(131, 146, 171)',
            fontSize: '10px',
            cursor: 'pointer',
        },
    })
    readonly headerStyle!: Record<string, string>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Prop({ default: null }) readonly data!: any;
    @Prop({
        default: '',
    })
    readonly style!: Record<string, string>;

    @Prop({ default: false }) readonly border!: boolean;
    @Prop({ default: false }) readonly stripe!: boolean;
    @Prop({ default: null }) readonly cellStyle!: unknown;
    @Prop({ default: null }) readonly maxHeight!: string;
    @Prop({ default: true }) readonly isShowPagination!: boolean;
    @Prop({ default: [] }) readonly rowSelectionIds!: string[];
    @Prop({ default: '_id' }) readonly rowKey!: string;
    @Prop({ default: true }) readonly defaultExpandAll!: boolean;
    @Prop({
        default: {
            rowspan: 0,
            colspan: 0,
        },
    })
    readonly objectSpanMethod!: unknown;
    @Prop({ default: 0 }) readonly totalItems!: number;
    pageSize = LIMIT_PER_PAGE;

    @Model('selectedPage', { type: Number }) currentPage!: number;

    @Watch('totalPages')
    onChangeData() {
        if (this.$refs.refTable) {
            (this.$refs.refTable as TableRefs).setScrollLeft(0);
        }
        this.currentPage = 1;
    }

    get totalPages() {
        return Math.ceil(this.totalItems / this.pageSize);
    }

    sortChange(column: IELColumnSort): void {
        this.$emit('sort-change', column);
    }

    handlePaginate(pageNumber: number): void {
        (this.$refs.refTable as TableRefs).setScrollLeft(0);
        this.$emit('handlePaginate', pageNumber);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleRowClick(row: any): void {
        this.$emit('row-click', row);
    }

    handleSelectionChange(row: unknown): void {
        this.$emit('selection-change', row);
    }

    created() {
        if (this.data && this.rowSelectionIds?.length) {
            this.data
                .filter((item: any) => this.rowSelectionIds.includes(item._id))
                .forEach((item: any) => {
                    setTimeout(() => {
                        (this.$refs.refTable as TableRefs).toggleRowSelection(
                            item,
                            undefined,
                        );
                    }, 10);
                });
        }
    }

    clearSelection() {
        (this.$refs.refTable as TableRefs).clearSelection();
    }

    @Watch('rowSelectionIds')
    onChangeRowSelectionIds() {
        if (this.rowSelectionIds?.length) {
            this.data
                .filter((item: any) => this.rowSelectionIds.includes(item._id))
                .forEach((item: any) => {
                    setTimeout(() => {
                        (this.$refs.refTable as TableRefs).toggleRowSelection(
                            item,
                            undefined,
                        );
                    }, 10);
                });
        }
    }

    @Watch('data')
    onUpdateData() {
        if (this.rowSelectionIds?.length) {
            this.data
                .filter((item: any) => this.rowSelectionIds.includes(item._id))
                .forEach((item: any) => {
                    setTimeout(() => {
                        (this.$refs.refTable as TableRefs).toggleRowSelection(
                            item,
                            undefined,
                        );
                    }, 10);
                });
        }
    }
}
</script>

<style scoped lang="scss">
.table-layout {
    align-items: center;
    min-height: 100%;
    overflow: hidden;
    /* width */
    &::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
        border-radius: 10px;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: rgb(180, 179, 179);
        border-radius: 10px;
    }
    .el-table__body {
        width: 100% !important;
    }
}
.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-right: 20px;
    margin-bottom: 20px;
}
</style>
