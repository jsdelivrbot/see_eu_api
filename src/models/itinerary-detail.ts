import { PickupPoint } from "./pickup-point";
import { UserVariation } from "./user-variation";

export class ItineraryDetail
{
    name: string;
    pickupPoint:PickupPoint;    
    variations:UserVariation[];
}
