import localStorageAuthService from '@/common/authStorage';
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-class-component';
import { ImportOption, ResourceType } from '../constants';

export class Planning4DMixin extends mixins(UtilMixins) {
    resourceType = ResourceType;
    importOption = ImportOption;
    get planningPermissions() {
        return localStorageAuthService.getPlanningPermissions().permissions;
    }

    get planningPath() {
        return localStorageAuthService.getPlanningPermissions().path;
    }
}
