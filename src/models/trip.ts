import { PickupPoint } from "./pickup-point";
import { Image } from "./image";
import { TripDetail } from "./trip-detail";
import { VariationType, Variation } from "./variation";

export class Trip {
    id: string;
    discountEndDate: Date;
    startDate: Date;
    endDate: Date;
    images: Image[];
    pickupPoints: PickupPoint[];
    tripDetails: TripDetail[];
    variations:Variation[]
}