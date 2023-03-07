import moment from 'moment';
import { appModule } from '../vuex/appModule';
import './extendMoment';

moment.locale(appModule.selectedLanguage);
