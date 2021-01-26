import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Alumno } from 'src/app/modelo/Alumno';

@Injectable()
export class ApiServiceProvider {

    private URL = "http://192.168.0.19:3000";

    constructor(public http: HttpClient) {
    }

    getAlumnos():Promise<Alumno[]> {
        let promise = new Promise<Alumno[]>((resolve, reject) => {
            this.http.get(this.URL+"/alumnos").toPromise()
                .then((data:any)=>{
                    let alumnos=new Array<Alumno>();
                    data.forEach(alumnoJson => {
                        let alumno=Alumno.createFromJsonObject(alumnoJson);
                        alumnos.push(alumno);
                    });
                    resolve(alumnos);
                })
                .catch( (error:Error)=>{
                    reject(error.message);
                });
        });
        return promise;
    }

/*

este método manda una solicitud de borrado a la Api del usuario con un id determinado.

Si el borrado va bien se sale son resolve devolviendo true.

Si el borrado va mal se sale con reject, devolviendo el mensaje de error que nos llega

*/

    eliminarAlumno(id:number):Promise<Boolean>{
        let promise = new Promise<Boolean>((resolve, reject) => {
            this.http.delete(this.URL+"/alumnos/"+id).toPromise().then(
              (data:any) => { // Success
                console.log(data)
                resolve(true);
              }
            )
            .catch((error:Error)=>{
              console.log(error.message);
              reject(error.message);});
          });
          return promise;
    }//end_eliminar_alumno
    
    modificarAlumno(idAlumno:number, nuevosDatosAlumno:Alumno):Promise<Alumno>{
        let promise = new Promise<Alumno>((resolve, reject) => {
            var header = { "headers": {"Content-Type": "application/json"} };
            let datos = nuevosDatosAlumno.getJsonObject();
            this.http.put(this.URL+"/alumnos/"+idAlumno,
                              JSON.stringify(datos),
                              header).toPromise().then(
              (data:any) => { // Success
                let alumno:Alumno;
                    alumno=Alumno.createFromJsonObject(data);
                resolve(alumno);
              }
            )
            .catch((error:Error)=>{
              reject(error.message);});
          });
          return promise;
    
    }//end_modificar_alumno

    insertarAlumno(datosNuevoAlumno:Alumno):Promise<Alumno>{

        let promise = new Promise<Alumno>((resolve, reject) => {
    
            var header = { "headers": {"Content-Type": "application/json"} };
    
            let datos = datosNuevoAlumno.getJsonObject();
    
           delete datos.id; //cuando se hace un post no paso el id. El id es asignado por el servidor. Quito el atributo del objeto json
    
            this.http.post(this.URL+"/alumnos/",
    
                              JSON.stringify(datos),
    
                              header).toPromise().then(
    
              (data:any) => { // Success
    
                let alumno:Alumno;
    
                    alumno=Alumno.createFromJsonObject(data);
    
                resolve(alumno);
    
              }
    
            )
    
            .catch((error:Error)=>{
    
              reject(error.message);});
    
          });
    
          return promise;
    
    }//end_insertarAlumno
    
}//end_class