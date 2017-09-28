export enum VariationType {
    VALUE_BASED,
    RANGE_BASED
}
export class RangeBasedParams {
    from: number;
    to: number;
    increaseBy?: number;
}

export class ValueBasedParams {

    labelInfo: {
        languageId: string;
        label: string;
    }[];
    increaseBy?: number;
}

export class Variation {
    id: string;
    type: VariationType;
    details: {
        languageId: string;
        name: string;
        unit?: string;
    }[];
    params: RangeBasedParams[] | ValueBasedParams[]
}