import { mixins } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { ProjectCategories } from './constants';
export class ProjectMixins extends mixins(UtilMixins) {
    ProjectCategories = ProjectCategories;
    getCategoryName(category: ProjectCategories) {
        return this.$t(`project.categories.${category}`);
    }
}
