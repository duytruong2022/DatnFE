<template>
    <div class="link-list">
        <div class="col-12">
            <h6>{{ title }}</h6>
            <el-table :data="linkList" style="width: 100%" max-height="350">
                <el-table-column
                    fixed
                    :label="$t('planning.linkForm.linkListColumn.dependency')"
                    width="140"
                    ><template #default="scope">
                        {{
                            scope.row?.dependency === LinkDependency.PREDECESSOR
                                ? $t('planning.linkForm.dependency.predecessor')
                                : $t('planning.linkForm.dependency.successor')
                        }}
                    </template>
                </el-table-column>

                <el-table-column
                    :label="$t('planning.linkForm.linkListColumn.linkType')"
                    width="150"
                >
                    <template #default="scope">
                        {{ $t(`planning.linkForm.linkType.${scope.row?.type}`) }}
                    </template>
                </el-table-column>

                <el-table-column
                    :label="$t('planning.linkForm.linkListColumn.delay')"
                    width="100"
                >
                    <template #default="scope">
                        {{ scope.row?.taskLag }}
                    </template>
                </el-table-column>

                <el-table-column
                    :label="$t('planning.linkForm.linkListColumn.id')"
                    width="150"
                    ><template #default="scope">
                        {{ scope.row?.taskLinkToGanttId }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('planning.linkForm.linkListColumn.name')"
                    width="250"
                    ><template #default="scope">
                        {{ scope.row?.taskLinkToName }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('planning.linkForm.linkListColumn.start')"
                    width="150"
                >
                    <template #default="scope">
                        {{ formatModifiedDate(scope.row?.taskLinkToStart) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('planning.linkForm.linkListColumn.finish')"
                    width="150"
                >
                    <template #default="scope">
                        {{ formatModifiedDate(scope.row?.taskLinkToFinish) }}
                    </template>
                </el-table-column>
                <slot name="action"> </slot>
            </el-table>
        </div>
    </div>
</template>

<script lang="ts">
import moment from 'moment';
import { mixins, Options } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { object } from 'yup';
import { LinkDependency } from '../../constants';
import { Planning4DMixin } from '../../mixins/mixin';

@Options({
    components: {},
})
export default class LinkList extends mixins(Planning4DMixin) {
    @Prop({ type: Array(object), default: [] })
    readonly linkList!: [];
    @Prop({ type: String, default: '' })
    readonly title!: [];
    LinkDependency = LinkDependency;

    formatModifiedDate(timestamp: number) {
        if (timestamp) {
            return moment(timestamp).fmDayString();
        }
        return;
    }
}
</script>

<style scoped lang="scss">
.link-list {
    margin-top: 20px;
    flex: 5;
    overflow: auto;
}
</style>
