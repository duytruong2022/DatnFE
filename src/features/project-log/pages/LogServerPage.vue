<template>
    <div class="content-wrapper filter-wrapper">
        <FilterFormLogServer />
    </div>
    <div class="content-wrapper">
        <LogFileTable />
    </div>
    <LogServerDetailPopup />
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import moment from 'moment';
import { mixins, Options } from 'vue-class-component';
import LogFileTable from '../components/LogServerTable.vue';
import FilterFormLogServer from '../components/FilterFormLogServer.vue';
import LogServerDetailPopup from '../components/LogServerDetailPopup.vue';
import { LogServerType } from '../constant';
import { projectLogModule } from '../store';

@Options({ components: { LogFileTable, LogServerDetailPopup, FilterFormLogServer } })
export default class LogServerPage extends mixins(UtilMixins) {
    created() {
        projectLogModule.setLogServerFileListQueryString({
            type: LogServerType.INSTANCE_LOG,
            date: moment().subtract(1, 'days').fmFullTimeString(),
        });
        projectLogModule.getLogServerFileList();
    }
}
</script>
<style lang="scss" scoped>
.content-wrapper {
    margin: 20px 25px;
    padding: 20px 25px;
    padding-bottom: 30px;
    background-color: white;
    border-radius: 15px;
}

.filter-wrapper {
    margin-top: 0;
}
</style>
