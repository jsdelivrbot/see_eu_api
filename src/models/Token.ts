import {User} from '../models/user';

export class Token {
    
    user: User;
    token: string;
    createdOn: Date = new Date();
}