import { AnalyticsEvent, ContractEvent, UIEvent, AnalyticsQueryParams, AnalyticsQueryResult } from '../models';
declare class EventsService {
    /**
     * Store a contract event in the database
     */
    storeContractEvent(event: ContractEvent): Promise<string>;
    /**
     * Store a UI event in the database
     */
    storeUIEvent(event: UIEvent): Promise<string>;
    /**
     * Query events from the database
     */
    queryEvents(params: AnalyticsQueryParams): Promise<AnalyticsQueryResult<AnalyticsEvent>>;
    /**
     * Get event by ID
     */
    getEventById(id: string): Promise<AnalyticsEvent | null>;
    /**
     * Delete event by ID
     */
    deleteEventById(id: string): Promise<boolean>;
    /**
     * Get event counts by type
     */
    getEventCountsByType(startDate?: number, endDate?: number): Promise<Record<string, number>>;
}
declare const _default: EventsService;
export default _default;
