import { ItineraryDetail } from "./itinerary-detail";


export class Itinerary {
    id: string;
    userId: string;
    payment: any;
    tripId: string;        
    itineraryDetails: ItineraryDetail[];
}