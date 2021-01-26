import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ApiServiceProvider } from 'src/providers/api-service/api-service';
import { EditarAlumnoPage } from '../editar-alumno/editar-alumno.page';
import { Alumno } from '../modelo/Alumno';
import { Storage } from '@ionic/storage';
import { FirestoreService } from '../firestore.service';
import { AlumnoF } from '../alumnoF';

enum storageTypeEnum {
  JSON_SERVER = 'JSON_SERVER',
  FIREBASE = 'FIREBASE'
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  private alumnos = new Array<Alumno>();
  private alumnosF: any = [{
    id: "",
    data: {} as AlumnoF
  }];
  private alumno: Alumno;
  private alumnoF: AlumnoF;
  private storageType: string;

  constructor(private apiService: ApiServiceProvider,
    public alertController: AlertController,
    public modalController: ModalController,
    private storage: Storage,
    public toastController: ToastController,
    private firestoreService: FirestoreService
  ) {
    this.alumno = {} as Alumno;
  }

  async presentToast(message: string) {

    const toast = await this.toastController.create({

      message: message,

      duration: 2000

    });

    toast.present();

  }

  /*
  
  cuando se carga la pantalla se llama al método getAlumnos de la Api. Este es un método asíncrono que devuelve un objeto Promise del que debe ser evaluado el resultado.
  
  Si el acceso a la Api ha ido bien se ejecuta el código asociado a la cláusula then.  Símplemente se coge el array de alumnos que llega y se asocia a él el atributo alumnos de la clase.
  
  Si ha ido mal el acceso (por ejemplo si no hemos lanzado jsonServer) se coge el error que llega y se muestra por consola.
  
  */


  ngOnInit(): void {

    this.storage.get('storageType')

      .then((val) => {

        if (val != null)

          this.storageType = val;

        else

          this.storageType = storageTypeEnum.JSON_SERVER;

        switch (this.storageType) {

          case storageTypeEnum.JSON_SERVER:

            this.apiService.getAlumnos()

              .then((alumnos: Alumno[]) => {

                this.alumnos = alumnos;
                this.alumnosF = [];

              })

              .catch((error: string) => {

                this.presentToast("Error al obtener alumnos: " + error);

              });

            break;

          case storageTypeEnum.FIREBASE:

            this.alumnos = new Array<Alumno>();
            this.firestoreService.consultar("alumnos").subscribe((resultadoConsultaAlumnos) => {
              this.alumnosF = [];
              resultadoConsultaAlumnos.forEach((datosAlumno: any) => {
                this.alumnosF.push({
                  id: datosAlumno.payload.doc.id,
                  data: datosAlumno.payload.doc.data()
                });
              })
            });
            console.log(this.alumnosF[0])
            break;

        }

      })

      .catch(() => { this.presentToast("Error al recuperar variable tipo de conexión"); });

  }//end_ngOnInit


  /*
  
  este método llama al método eliminarAlumno de la Api y le pasa el id del alumno a eliminar. Se devuelve un objeto Promise. Si el borrado ha ido bien se ejecuta el código asociado a la cláusula then. Símplemente se muestra por consola un mensaje y se elimina el alumno del array de alumnos de la clase, lo que hará que deje de verse en la vista.
  
  Si el borrado ha ido mal muestro por consola el error que ha ocurrido.
  
  */
  eliminarAlumno(indice: number) {
    switch (this.storageType) {

      case storageTypeEnum.JSON_SERVER:
        this.apiService.eliminarAlumno(this.alumnos[indice].id)
          .then((correcto: boolean) => {
            console.log("Borrado correcto del alumno con indice: " + indice);
            this.alumnos.splice(indice, 1);
          })
          .catch((error: string) => {
            console.log("Error al borrar: " + error);
          });
        break;
      case storageTypeEnum.FIREBASE:
        this.firestoreService.borrar("alumnos", this.alumnosF[indice].id).then(() => {
          // Limpiar datos de pantalla
          this.alumno = {} as Alumno;
        })
        break;
    }
  }//end_eliminar_alumno

  async modificarAlumno(indice: number) {
    let alumno = this.alumnos[indice];
    const alert = await this.alertController.create({
      header: 'Modificar alumno',
      inputs: [
        {
          name: 'first_name',
          type: 'text',
          value: alumno.first_name,
          placeholder: 'first_name'
        },
        {
          name: 'last_name',
          type: 'text',
          id: 'last_name',
          value: alumno.last_name,
          placeholder: 'last_name'
        },
        {
          name: 'email',
          id: 'email',
          type: 'text',
          value: alumno.email,
          placeholder: 'email'
        },
        {
          name: 'gender',
          id: 'gender',
          type: 'text',
          value: alumno.gender,
          placeholder: 'gender'
        },
        {
          name: 'avatar',
          value: alumno.avatar,
          type: 'url',
          placeholder: 'avatar'
        },
        {
          name: 'address',
          value: alumno.address,
          type: 'text',
          placeholder: 'address'
        },
        {
          name: 'city',
          value: alumno.city,
          type: 'text',
          placeholder: 'city'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log(data);
            var alumnoModificado: Alumno = new Alumno(alumno.id,
              data['first_name'],
              data['last_name'],
              data['email'],
              data['gender'],
              data['avatar'],
              data['address'],
              data['city']);
            this.apiService.modificarAlumno(alumno.id, alumnoModificado)
              .then((alumno: Alumno) => {
                this.alumnos[indice] = alumno;
              })
              .catch((error: string) => {
                console.log(error);
              });
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }//end_modificarAlumno

  async nuevoAlumno() {

    const modal = await this.modalController.create({

      component: EditarAlumnoPage,

      componentProps: {

        'alumnoJson': JSON.stringify(new Alumno(-1,

          "", "", "", "", "", "", ""))

      }

    });

    modal.onDidDismiss().then((data) => {

      if (data['data'] != null) {

        let alumnoJSON = JSON.parse(data['data']);

        this.alumno = Alumno.createFromJsonObject(alumnoJSON);


        switch (this.storageType) {

          case storageTypeEnum.JSON_SERVER:

            this.alumnoF = {} as AlumnoF;

            this.apiService.insertarAlumno(this.alumno)  //se hace POST a la API

              .then((alumno: Alumno) => {

                this.alumnos.push(alumno);  //si se ha insertado en la api se añade en la lista

              })

              .catch((error: string) => {

                this.presentToast("Error al insertar: " + error);

              });

            this.alumno = {} as Alumno;

            break;

          case storageTypeEnum.FIREBASE:

            this.alumnoF = {} as AlumnoF;
            this.alumnoF.id = this.alumno.id;
            this.alumnoF.first_name = this.alumno.first_name;
            this.alumnoF.last_name = this.alumno.last_name;
            this.alumnoF.email = this.alumno.email;
            this.alumnoF.address = this.alumno.address;
            this.alumnoF.city = this.alumno.city;
            this.alumnoF.avatar = this.alumno.avatar;
            this.alumnoF.gender = this.alumno.gender;

            console.log(this.alumnoF);

            this.firestoreService.insertar("alumnos", this.alumnoF).then(() => {
              console.log('Alumno creado correctamente!');
              this.alumnoF = {} as AlumnoF;
            }, (error) => {
              console.error(error);
            });

            this.alumnoF = {} as AlumnoF;

            break;

        }//end_switch


      }

    });

    return await modal.present();

  } //end_nuevoAlumno

  async settings() {

    let checkedJsonServer: boolean = false;

    let checkedFirebase: boolean = false;

    switch (this.storageType) {

      case storageTypeEnum.JSON_SERVER:

        checkedJsonServer = true;

        break;

      case storageTypeEnum.FIREBASE:

        checkedFirebase = true;

        break;

    }

    const alert = await this.alertController.create({

      header: 'settings',

      inputs: [

        {

          name: 'json-server',

          type: 'radio',

          label: 'json-server',

          value: storageTypeEnum.JSON_SERVER,

          checked: checkedJsonServer

        },

        {

          name: 'firebase',

          type: 'radio',

          label: 'firebase',

          value: storageTypeEnum.FIREBASE,

          checked: checkedFirebase

        },

      ],

      buttons: [

        {

          text: 'Cancel',

          role: 'cancel',

          cssClass: 'secondary',

          handler: () => {

          }

        }, {

          text: 'Ok',

          handler: (data) => {

            this.storage.set('storageType', data).then((data) => {

              this.storageType = data

              switch (this.storageType) {

                case storageTypeEnum.JSON_SERVER:

                  this.apiService.getAlumnos()

                    .then((alumnos: Alumno[]) => {

                      this.alumnos = alumnos;

                    })

                    .catch((error: string) => {

                      this.alumnos = new Array<Alumno>();

                      this.presentToast("Error al obtener alumnos: " + error);

                    });

                  break;

                case storageTypeEnum.FIREBASE:

                  this.alumnos = new Array<Alumno>();

                  this.firestoreService.consultar("alumnos").subscribe((resultadoConsultaAlumnos) => {
                    this.alumnosF = [];
                    resultadoConsultaAlumnos.forEach((datosAlumno: any) => {
                      this.alumnosF.push({
                        id: datosAlumno.payload.doc.id,
                        data: datosAlumno.payload.doc.data()
                      });
                    })
                  });

                  break;

              }//end_switch

            });

          }

        }

      ]

    });

    await alert.present();

  }//end_settings

}
