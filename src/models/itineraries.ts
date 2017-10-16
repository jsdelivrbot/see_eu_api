import { ItineraryDetail } from "./itinerary-detail";


export class Itineraries {
    id: string;
    userId: string;
    payment: any;
    tripId: string;        
    itineraryDetails: ItineraryDetail[];
}