export class UserVariation{
    id:string;
    value: string | {
        languageId: string;
        label: string;
    }[];

    amount: number;
}