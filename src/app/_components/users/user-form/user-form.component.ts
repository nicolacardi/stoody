//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnChanges, OnInit, Output }      from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }    from '@angular/forms';
import { MatDialog }                                           from '@angular/material/dialog';
import { firstValueFrom, Observable, of, tap }                                 from 'rxjs';

//components

//services
import { LoadingService }                                      from '../../utilities/loading/loading.service';
import { UserService }                                         from 'src/app/_user/user.service';

//models
import { User }                                                from 'src/app/_user/Users';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';


//#endregion

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./../users.css']
})

export class UserFormComponent implements OnInit, OnChanges {

  //#region ----- Variabili ----------------------
  user$!:                                       Observable<User>;
  user!:                                         User;
  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() userID!:                            string;
  @Input() personaID!:                         number;

  @Output('formValid') formValid = new EventEmitter<boolean>();
  @Output('formChanged') formChanged = new EventEmitter();

//#endregion


//#region ----- Constructor --------------------

  constructor(
    public _dialog               : MatDialog,
    private fb                   : UntypedFormBuilder,
    private svcUser              : UserService,
             
    private _snackBar            : MatSnackBar,
    private _loadingService      : LoadingService
  ) {

    this.form = this.fb.group(
    {
      userID:                                   [null],
      personaID:                                [null],
      email:                                    ['', [Validators.email]],
      password:                                 [null],
      userName:                                 [null]
    });

  }

//#endregion


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();

    this.form.valueChanges.subscribe(
      res=> {
        this.formValid.emit(this.form.valid);
        this.formChanged.emit();
      }
    )
  }

  ngOnChanges () {
    //console.log("user-form - ngOnChanges - arrivato userID", this.userID);
    this.loadData();
  }

  loadData(){

    if (this.userID && this.userID + '' != "0") {
      const obsUser$: Observable<User> = this.svcUser.get(this.userID);
      const loadUser$ = this._loadingService.showLoaderUntilCompleted(obsUser$);

      this.user$ = loadUser$
      .pipe( 
          tap(user=>{
            // console.log ("user-form - loadData use estratto user", user);
            this.form.patchValue(user)
            this.form.controls["userID"].setValue(user.id);
          }
          )
      );
    }
    else 
      this.emptyForm = true
  }

  save() {


    //this.form.controls['personaID'].setValue(this.personaID);
    if (this.form.controls['email'].value) {
      if (this.userID == null || this.userID == '') {
        console.log ("user-form - save - post form", this.form.value);
        //return this.svcGenitori.post(this.form.value)
        this.svcUser.post(this.form.value).subscribe();
      }
      else {
        console.log ("user-form - save - put form", this.form.value);
        this.svcUser.put(this.form.value).subscribe();
      }
    }
  }

  delete(){
    if (this.userID != null) 
      this.svcUser.delete(this.userID)      
      .subscribe({
        next: res=>{
          this._snackBar.openFromComponent(SnackbarComponent,{data: 'Utente cancellato', panelClass: ['red-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
      });
  }

  async cambioPassword() {

    console.log ("user-form - cambiopassword - userID",this.userID);
    if (this.form.controls['password'].value == '') {
      const dialogRef = this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "CAMBIO PASSWORD", sottoTitolo: "E' necessario un valore<br>nel campo password!"}
      });
      return;
    }

    await firstValueFrom(this.svcUser.get(this.userID)
        .pipe(
          tap(res => { this.user = res;}
        )
      ));
  

      //console.log ("ok le credenziali corrispondono");
      //console.log ("imposto", this.routedUsername, this.form.controls['newPassword'].value);
      
      //tutto corrisponde - imposto quella nuova tramite ResetPassword
  
      let userNoTmpPassword = {
        userID:       this.user.id,               //necessario x la put
        userName:     this.userID,                //necessario x la put
        personaID:    this.user.personaID,        //necessario x la put
        tmpPassword:  '',                         //psw temporanea azzerata
        email:        this.user.email,            //se non lo metto viene cancellato
        normalizedEmail:  this.user.normalizedEmail,   //se non lo metto viene cancellato
        fullName:     ''                          
      };
  
      // console.log ("userNoTmpPassword", userNoTmpPassword);
  
      this.svcUser.ResetPassword(this.userID, this.form.controls['password'].value).subscribe({
        next: res =>  {
            //ora vado a cancellare la password temporanea tmpPassword in modo che non si possa più utilizzare
            this.svcUser.put(userNoTmpPassword).subscribe();
  
            const dialogRef = this._dialog.open(DialogOkComponent, {
              width: '320px',
              data: {titolo: "CAMBIO PASSWORD", sottoTitolo: "La password è stata modificata<br>con successo."}
            });
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio della password', panelClass: ['red-snackbar']})
      });
  
  }


}

