import { storage } from './localStorage';
import { IGanttGridDisplayingStatus } from '@/features/4D-planning/interfaces';

export const enum GANT_CHART_STORAGE_KEY {
    GANTT_GRID_DISPLAYING = 'GANTT_GRID_DISPLAYING',
    GANTT_GRID_ORDER_COLUMN = 'GANTT_GRID_ORDER_COLUMN',
    GANTT_GRID_WIDTH = 'GANTT_GRID_WIDTH',
    GANTT_ADDITIONAL_TASK_FIELD = 'GANTT_ADDITIONAL_TASK_FIELD',
    GANTT_ACTIVITY_CODE_DISPLAYING = 'GANTT_ACTIVITY_CODE_DISPLAYING',
}
class GantChartStorageService {
    setGanttDisplayingStatus(status: IGanttGridDisplayingStatus = {}): void {
        storage.setLocalStorage(
            GANT_CHART_STORAGE_KEY.GANTT_GRID_DISPLAYING,
            JSON.stringify(status),
        );
    }
    getGanttDisplayingStatus(): IGanttGridDisplayingStatus | undefined {
        const status = storage.getLocalStorage(
            GANT_CHART_STORAGE_KEY.GANTT_GRID_DISPLAYING,
        );
        if (!status) {
            return undefined;
        }
        return JSON.parse(status);
    }
    resetGanttDisplayingStatus(): void {
        storage.setLocalStorage(GANT_CHART_STORAGE_KEY.GANTT_GRID_DISPLAYING, '');
    }

    setGanttOrderColumn(order: Map<string, number>): void {
        storage.setLocalStorage(
            GANT_CHART_STORAGE_KEY.GANTT_GRID_ORDER_COLUMN,
            JSON.stringify(Object.fromEntries(order)),
        );
    }
    getGanttOrderColumn(): Map<string, number> | undefined {
        const order = storage.getLocalStorage(
            GANT_CHART_STORAGE_KEY.GANTT_GRID_ORDER_COLUMN,
        );
        if (!order) {
            return undefined;
        }
        return new Map(Object.entries(JSON.parse(order)));
    }
    resetGanttOrderColumn(): void {
        storage.setLocalStorage(GANT_CHART_STORAGE_KEY.GANTT_GRID_ORDER_COLUMN, '');
    }

    setAdditionalTaskFields(_ids: string[]): void {
        storage.setLocalStorage(
            GANT_CHART_STORAGE_KEY.GANTT_ADDITIONAL_TASK_FIELD,
            _ids.join(','),
        );
    }
    getAdditionalTaskFields(): string[] | undefined {
        return storage
            .getLocalStorage(GANT_CHART_STORAGE_KEY.GANTT_ADDITIONAL_TASK_FIELD)
            ?.split(',');
    }
    resetAdditionalTaskFields(): void {
        storage.setLocalStorage(GANT_CHART_STORAGE_KEY.GANTT_ADDITIONAL_TASK_FIELD, '');
    }

    setGridWitdh(value: number): void {
        storage.setLocalStorage(
            GANT_CHART_STORAGE_KEY.GANTT_GRID_WIDTH,
            JSON.stringify(value),
        );
    }
    getGridWidth(): number | undefined {
        const width = +storage.getLocalStorage(GANT_CHART_STORAGE_KEY.GANTT_GRID_WIDTH);
        return width || undefined;
    }
    resetGridWidth(): void {
        storage.setLocalStorage(GANT_CHART_STORAGE_KEY.GANTT_GRID_WIDTH, '');
    }

    setDisplayActivityCode(value: boolean): void {
        storage.setLocalStorage(
            GANT_CHART_STORAGE_KEY.GANTT_ACTIVITY_CODE_DISPLAYING,
            JSON.stringify(value),
        );
    }
    getDisplayActivityCode(): boolean {
        const display = storage.getLocalStorage(
            GANT_CHART_STORAGE_KEY.GANTT_ACTIVITY_CODE_DISPLAYING,
        );
        return display === 'true';
    }
    resetDisplayActivityCode(): void {
        storage.setLocalStorage(
            GANT_CHART_STORAGE_KEY.GANTT_ACTIVITY_CODE_DISPLAYING,
            '',
        );
    }
}

const ganttChartStorage = new GantChartStorageService();
export default ganttChartStorage;
