import { DialogType } from './../features/3D-viewer/constant';
import { Vue } from 'vue-class-component';
import { translateYupErrorHelper } from '@/common/helpers';
import moment from 'moment';
import {
    AccessModules,
    DATE_TIME_FORMAT,
    FILE_NAME_MAX_LENGTH,
    SUPPORT_LANGUAGE,
    UserRoles,
} from '@/common/constants';
import localStorageAuthService from '@/common/authStorage';
import { appModule } from '@/plugins/vuex/appModule';
import capitalize from 'lodash/capitalize';
export class UtilMixins extends Vue {
    userRoles = UserRoles;
    accessModules = AccessModules;
    DATE_TIME_FORMAT = DATE_TIME_FORMAT;
    FILE_NAME_MAX_LENGTH = FILE_NAME_MAX_LENGTH;
    DialogType = DialogType;
    userAccessModules = localStorageAuthService.getUser()?.accessModules || '';
    translateYupError(
        yupError:
            | {
                  i18nKey: string;
                  params?: Record<string, string>;
              }
            | string,
    ): string {
        return translateYupErrorHelper(yupError);
    }
    formatDate(dateTime: string) {
        return moment(dateTime).fmFullTimeString();
    }

    parseDateTime(
        dateTime: Date | string,
        dateTimeFormat = DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN,
    ): string {
        if (!moment(dateTime)?.isValid) {
            return '';
        }
        const currentLanguage = appModule.selectedLanguage as SUPPORT_LANGUAGE;
        return moment(dateTime).locale(currentLanguage).format(dateTimeFormat);
    }

    parseDatePickerRangeValues(dateRange: string[] | Date[]): string[] | null {
        if (dateRange?.length === 2) {
            return [
                moment(dateRange[0]).startOfDay().utc().fmFullTimeString(),
                moment(dateRange[1]).endOfDay().utc().fmFullTimeString(),
            ];
        }
        return null;
    }

    getDisplayAddress(address: string | undefined): string {
        const parsedAddress = JSON.parse(address?.length ? address : '{}');
        return Object.keys(parsedAddress)
            .map((key) => {
                return `${capitalize(key)}: ${parsedAddress?.[key]}`;
            })
            .join(', ');
    }
}
