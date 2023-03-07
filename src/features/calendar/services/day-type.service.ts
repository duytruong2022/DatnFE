import { ApiService } from '@/common/services/api';
import service from '@/plugins/axios';

class DayTypeService extends ApiService {}

export const dayTypeService = new DayTypeService({ baseUrl: '/day-type' }, service);
