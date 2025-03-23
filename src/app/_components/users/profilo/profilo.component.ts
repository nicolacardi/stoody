import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { DialogOkComponent }                    from '../../../_components/utilities/dialog-ok/dialog-ok.component';
import { PhotocropComponent }                   from '../../../_components/utilities/photocrop/photocrop.component';
import { SnackbarComponent }                    from '../../../_components/utilities/snackbar/snackbar.component';
import { Utility }                              from '../../../_components/utilities/utility.component';
import { PersonaFormComponent }                 from '../../../_components/persone/persona-form/persona-form.component';

//services
import { EventEmitterService }                  from 'src/app/_services/event-emitter.service';
import { UserService }                          from 'src/app/_user/user.service';
import { PersoneService }                       from '../../../_components/persone/persone.service';

//models
import { _UT_UserFoto }                         from 'src/app/_models/_UT_UserFoto';
import { User }                                 from 'src/app/_user/Users';

@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.component.html',
  styleUrls: ['../users.css']
})

export class ProfiloComponent implements OnInit {

//#region ----- Variabili ----------------------
  imgFile!:                                     string;
  foto!:                                        string;
  fotoObj!:                                     _UT_UserFoto
  form! :                                       UntypedFormGroup;
  public currUser!:                             User;
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('myImg', {static: false}) immagineDOM!: ElementRef;
  @ViewChild(PersonaFormComponent) personaFormComponent!: PersonaFormComponent; 
//#endregion

  constructor(private fb:                                 UntypedFormBuilder, 
              private svcUser:                            UserService,
              private svcPersone:                         PersoneService,
              public _dialog:                             MatDialog,
              private eventEmitterService:                EventEmitterService,
              private _snackBar:                          MatSnackBar) { 

    this.form = this.fb.group({
      file:           ['' , [Validators.required]],
      username:       [{value:'' , disabled: true}],
      email:          [''],
      fullname:       [{value:'' , disabled: true} , [Validators.required]],
    });
  }

  ngOnInit(): void {
    
    this.currUser = Utility.getCurrentUser();

    this.form.controls['username'].setValue(this.currUser.userName);
    this.form.controls['email'].setValue(this.currUser.email);
    this.form.controls['fullname'].setValue(this.currUser.fullname);
    
    this.svcUser.getFotoByUserID(this.currUser.userID).subscribe(
      val=> {
        if(val){
          this.imgFile = val.foto; 
          this.fotoObj = val;
        }
      }
    );
  }
   
  onImageChange(e: any) {
   
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      if(e.target.files[0].size > 200000){
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)"}
        });
        return;
      };

    const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile = reader.result as string;

        Utility.compressImage( this.imgFile, 200, 200)
               .then(compressed => {
                this.immagineDOM.nativeElement.src = compressed;
              });

      };
    }

  }

  cropImage(e: any) {
   
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      if(e.target.files[0].size > 200000){
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)"}
        });
        return;
      };

      const dialogRef = this._dialog.open(PhotocropComponent, {
        width: '270px',
        height: '400px',
        data: {file: e.target.files}
      });
    }
  }

  save(){

    //Prendo dal form nel child personaForm i valori dei campi che NON si trovano nel component padre
    this.form.controls['email'].setValue(this.personaFormComponent.form.controls['email'].value);
    //se dovesse servire....sistemo anche il fullname
    this.form.controls['fullname'].setValue(this.personaFormComponent.form.controls['nome'].value + " "+ this.personaFormComponent.form.controls['cognome'].value);

    let formData = {
      userID:     this.currUser.userID,   
      UserName:   this.form.controls['username'].value,
      Email:      this.form.controls['email'].value,
      Password:   "",
      PersonaID:  this.currUser.personaID
      //FullName:   this.form.controls['fullname'].value,
    };

    this.svcUser.put(formData).subscribe({
      next: res => {
        this.currUser.userName = this.form.controls['username'].value;
        this.currUser.email =this.form.controls['email'].value;
        this.currUser.fullname = this.form.controls['fullname'].value;

        localStorage.setItem('currentUser', JSON.stringify(this.currUser));
      },
      error: err=> console.log("[profilo.component] - save: ERRORE this.svcUser.put", formData)
    });

    this.svcPersone.put(this.personaFormComponent.form.value).subscribe({
      next: res => console.log("persona salvata", this.personaFormComponent.form.value),
      error: err=> console.log("[profilo.component] - save: ERRORE this.svcPersone.put", this.personaFormComponent.form.value)
    });

    if(this.immagineDOM != undefined){
      this.fotoObj.userID = this.currUser.userID;
      this.fotoObj.foto = this.immagineDOM.nativeElement.src;

      this.svcUser.save(this.fotoObj).subscribe( () => {
          this.eventEmitterService.onAccountSaveProfile();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Profilo salvato', panelClass: ['green-snackbar']});
        }
      );
    }
  }
}