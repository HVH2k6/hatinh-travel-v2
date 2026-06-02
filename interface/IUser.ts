export interface IRole{
    id:string;
    name:string
}
export interface IUser{
id:string;
username:string;
password:string;
email:string;
avatar:string;
phoneNumber:string;
status:boolean;
roleId:IRole
}