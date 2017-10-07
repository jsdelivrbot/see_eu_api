import {Image} from './image';
export class User{
    id:string;
    firstName:string;
    lastName:string;
    dob:Date;
    mobile:string;
    gender:boolean;
    email:string;
    password:string;
    avatar?:Image;
    isActivated: Boolean = false;
    activationCode: String
}
