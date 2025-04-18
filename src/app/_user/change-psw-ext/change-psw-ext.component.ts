//#region ----- IMPORTS ------------------------
import { Component, Renderer2, ElementRef, ViewChild }                    from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { SnackbarComponent }                    from '../../_components/utilities/snackbar/snackbar.component';
import { ActivatedRoute }                       from '@angular/router';
import { Router }                               from '@angular/router';
import { firstValueFrom, tap }                  from 'rxjs';
import { MatDialog }                            from '@angular/material/dialog';

//components
import { Utility }                              from '../../_components/utilities/utility.component';
import { DialogOkComponent }                    from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';

//services
import { UserService }                          from 'src/app/_user/user.service';
import { User }                                 from 'src/app/_user/Users';


//#endregion

@Component({
  selector: 'app-change-psw-ext',
  templateUrl: './change-psw-ext.component.html',
  styleUrls: ['../user.css']
})

export class ChangePswExtComponent {

//#region ----- Variabili ----------------------

  form! :                                       UntypedFormGroup;
  public user!:                             User;
  routedUsername!:                              string;
  routedRndPassword!:                           string;

  ckPsw : boolean[] =[true, true, true];
//#endregion

//#region ----- ViewChild Input Output ---------
  //@ViewChild('psw0') pswInput0!: ElementRef;
  @ViewChild('psw1') pswInput1!: ElementRef;
  @ViewChild('psw2') pswInput2!: ElementRef;
//#endregion


//#region ----- Constructor --------------------

  constructor( 
    private fb             : UntypedFormBuilder,
    private svcUser        : UserService,
    private _snackBar      : MatSnackBar,
    private renderer       : Renderer2,
    private route          : ActivatedRoute,
    private router         : Router,
    public _dialog         : MatDialog
  ) { 

    this.route.queryParams.subscribe(params => {
      this.routedUsername = params['username'];
      this.routedRndPassword = params['key'];
    });

    this.form = this.fb.group({
        UserName:                               [this.routedUsername],
        password:                               [this.routedRndPassword, [Validators.required, Validators.minLength(4)]],
        newPassword:                            ['', [Validators.required, Validators.minLength(4), Validators.maxLength(19)]],
        confirmPassword:                        ['', Validators.required]
      },
      {
        validators: [
          Utility.matchingPasswords ('newPassword', 'confirmPassword'),
          Utility.checkIfChangedPasswords('password', 'newPassword') ]
      });
  }

//#endregion

//#region ----- Metodi Vari --------------------

  async save(){
    //estraggo in maniera sincrona l'utente tramite UserName e password temporanea per verificare se corrisponde (altrimenti uno potrebbe accedere alla pagina e farlo da sè)

    await firstValueFrom(this.svcUser.getByUsernameAndTmpPassword(this.routedUsername, this.routedRndPassword)
      .pipe(
        tap(res => { this.user = res;}
      )
    ));

    if (!this.user) {
      this._snackBar.openFromComponent(SnackbarComponent, { data: "A quanto pare questo link è stato già utilizzato."  , panelClass: ['green-snackbar']});
      return;
    }
    //console.log ("ok le credenziali corrispondono");
    //console.log ("imposto", this.routedUsername, this.form.controls['newPassword'].value);
    
    //tutto corrisponde - imposto quella nuova tramite ResetPassword

    let userNoTmpPassword = {
      userID:       this.user.id,               //necessario x la put
      userName:     this.routedUsername,         //necessario x la put
      personaID:    this.user.personaID,        //necessario x la put
      tmpPassword:  '',                         //psw temporanea azzerata
      email:        this.user.email,            //se non lo metto viene cancellato
      normalizedEmail:  this.user.normalizedEmail,   //se non lo metto viene cancellato
      fullName:     ''                          
    };

    // console.log ("userNoTmpPassword", userNoTmpPassword);

    this.svcUser.ResetPassword(this.user.id, this.form.controls['newPassword'].value).subscribe({
      next: res =>  {
          //ora vado a cancellare la password temporanea tmpPassword in modo che non si possa più utilizzare
          this.svcUser.put(userNoTmpPassword).subscribe();
          /*
            {
            next: res =>  {
              console.log ("tmpPassword azzerata")
            },
            error: err=>  {
              console.log ("errore in azzeramento tmpPassword")
            }
          });
          */
          //mostro conferma e - su chiusura - passo alla pagina di Login

          const dialogRef = this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "CAMBIO PASSWORD", sottoTitolo: "La password è stata modificata<br>con successo.<br>Verrai reindirizzato<br>alla pagina di login."}
          });
          dialogRef.afterClosed().subscribe(() => {this.router.navigate(['/user/login']);});
      },
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio della password', panelClass: ['red-snackbar']})
    });

  }

  toggleShow(index: number) {
    //mostra/nasconde la password in chiaro nei vari campi
    this.ckPsw[index] = !this.ckPsw[index];
    const inputElement = this.getInputByIndex(index);
    const newType = this.ckPsw[index] ? 'password' : 'text';
    this.renderer.setAttribute(inputElement, 'type', newType);
  }

  getInputByIndex(index: number): HTMLInputElement {
    switch (index) {
      //case 0:
        //return this.pswInput0.nativeElement;
      case 1:
        return this.pswInput1.nativeElement;
      case 2:
        return this.pswInput2.nativeElement;
      default:
        throw new Error(`Invalid index: ${index}`);
    }
  }

  toLogin() {
    this.router.navigate(['/user/login']); 
  }

//#endregion
}
