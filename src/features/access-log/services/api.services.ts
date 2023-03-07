import { ApiService } from '@/common/services/api';
import service from '@/plugins/axios';

class AccessLogService extends ApiService {}

export const accessLogService = new AccessLogService({ baseUrl: '/access-log' }, service);
