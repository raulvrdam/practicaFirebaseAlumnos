export class Alumno {

    constructor(public id: number,
        public first_name: string,
        public last_name: string,
        public email: string,
        public gender: string,
        public avatar: string,
        public address: string,
        public city: string
        )
    {  }
    
    public static createFromJsonObject(jsonObject: any): Alumno {
        let alumno:Alumno= new Alumno(jsonObject['id'],
            jsonObject['first_name'],
            jsonObject['last_name'],
            jsonObject['email'],
            jsonObject['gender'],
            jsonObject['avatar'],
            jsonObject['address'],
            jsonObject['city']);
            return alumno;
    }

    public getJsonObject(): any {
        let jsonObject: any = {};
        jsonObject['id']=this.id;
        jsonObject['first_name']=this.first_name;
        jsonObject['last_name']=this.last_name;
        jsonObject['email']=this.email;
        jsonObject['gender']=this.gender;
        jsonObject['avatar']=this.avatar;
        jsonObject['address']=this.address;
        jsonObject['city']=this.city;
        return jsonObject;
    }
                
}//end_class