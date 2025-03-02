//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { firstValueFrom, tap }                  from 'rxjs';
import { MatDialog }                            from '@angular/material/dialog';
// import { logoBase64 }                           from 'src/environments/environment';

//components
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';
import { Utility }                              from 'src/app/_components/utilities/utility.component';
import { DialogOkComponent }                    from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';

//services
import { UserService }                          from '../user.service';
import { MailService }                          from 'src/app/_components/utilities/mail/mail.service';

//models
import { _UT_MailMessage }                      from 'src/app/_models/_UT_MailMessage';
import { ParametriService } from 'src/app/_components/impostazioni/parametri/parametri.service';

//#endregion

@Component({
  selector: 'app-reset-psw',
  templateUrl: './reset-psw.component.html',
  styleUrls: ['../user.css']
})


export class ResetPswComponent {

//#region ----- ViewChild Input Output ---------
  form! :                                       UntypedFormGroup;
//#endregion

//#region ----- ViewChild Input Output ---------
    @Output('reloadRoutes') reloadRoutes = new EventEmitter<string>();
//#endregion

//#region ----- Constructor --------------------

constructor(private fb:                         UntypedFormBuilder,
            private _snackBar:                  MatSnackBar,
            private svcUser:                    UserService,
            private svcMail:                    MailService,
            private svcParametri:               ParametriService,
            public _dialog:                     MatDialog  ) {

  this.form = this.fb.group({
    Email:                   ['', Validators.required],
  })
}
//#endregion

  backToLogin(e: Event){
    e.preventDefault();
    this.reloadRoutes.emit("login");
  }

  async onSubmit(){

    //console.log ("reset password richiesto");
    if(!Utility.validateEmail(this.form.controls['Email'].value)){ 
      this._snackBar.openFromComponent(SnackbarComponent, { data: "Inserire una email valida"  , panelClass: ['red-snackbar']});
      return;
    }

    let mailAddress = this.form.controls['Email'].value;
    mailAddress = "nicola.cardi@gmail.com"; //per evitare di spammare il mondo in questa fase      
    let user : any;
    //interrogo e aspetto il DB per ottenere lo user che ha questa mail 
    //(TODO: bloccare possibilità di inserimento più utenti con una stessa mail!)
    await firstValueFrom(this.svcUser.getByMailAddress(mailAddress)
      .pipe(
        tap(res => { user = res;}
      )
    ));
    
    if (!user) {
      this._snackBar.openFromComponent(SnackbarComponent, { data: "Email non registrata"  , panelClass: ['red-snackbar']});
      return;
    }

    let rndPassword = Utility.generateRandomString();

    //Reset Password con utente e pagina random generata AVVENIVA COSI' PRIMA DI RIFARE IL GIRO CON INVIO E SALVATAGGIO PSW TEMPORANEA
    //await firstValueFrom(this.svcUser.ResetPassword(user.id, rndPassword));                //sincrono
    //this.svcUser.ResetPassword(user.id, rndPassword).subscribe();                         //asincrono

    //ora devo salvare la password temporanea

    let formData = {
      userID:       user.id,                    //necessario x la put
      userName:     user.userName,              //necessario x la put
      personaID:    user.personaID,             //necessario x la put
      tmpPassword:  rndPassword,                //nuova psw
      email:        user.email,                 //se non lo metto viene cancellato
      normalizedEmail:  user.normalizedEmail,   //se non lo metto viene cancellato
      fullName:  user.fullName                  //se non lo metto viene cancellato
    };

    //const formData = { ...user, tmpPassword: rndPassword }; //così purtroppo non funziona (SAREBBE STATO + ELEGANTE)

    this.svcUser.put(formData).subscribe();

    let base64LogoScuolaEmail = '';
    let base64LogoStoody ='';

    await firstValueFrom(this.svcParametri.getByParName('imgFileLogoScuolaEmail').pipe(tap(res=> {base64LogoScuolaEmail = res.parValue;})));
    await firstValueFrom(this.svcParametri.getByParName('imgFileLogoStoody').pipe(tap(res=> {base64LogoStoody = res.parValue;})));

    // let imageUrl = './assets/logo/logoMailStoody.png';
    // try {base64LogoStoody = await Utility.convertImageToBase64(imageUrl);} 
    // catch (error) {console.error('Error converting image to base64:', error);}

    let titoloMail = "STOODY: Invio Password Temporanea";
    let testoMail =  "<html><body>"+
    "<div style='width: 100%; background-color: lightblue; border-radius: 10px; text-align: center; padding: 10px;'>"+
      "<div style='width: 500px; margin: auto; background-color: white; border-radius: 30px; padding: 20px; line-height: normal'>"+
        "<img style='width: 100px' src='"+base64LogoStoody+"'/> <br><br>" +

        "<span style='font-size: 1.3em'> E' stata richiesta una nuova password per l'utente<br>riferito a questo indirizzo email. </span><br>" +
        "<br><br> Puoi accedere tramite questo link<br><br>" +

        "<a class='btn' href='localhost:4200/change-psw-ext?username="+user.userName+"&key=" + rndPassword +"'>localhost:4200/change-psw-ext?username="+user.userName+"&key=" + rndPassword +"</a><br><br>"+
        "e impostare la nuova password."+
        "<br><br> Se non sei stato tu a richiedere una nuova password puoi ignorare questo link<br>o segnalarlo a info@stoody.it " +
        "<br><br><img alt='logo Scuola' style='width: 100px' src='"+base64LogoScuolaEmail+"'/> <br><br>"+
      "</div>"+
      "</div>"+  
    "</body"+
    "</html>"
    

    ;


    // "Di seguito le nuove credenziali: <br><br>" +
    // "Nome Utente: " + user.userName + "<br>" +
    // "Password temporanea : " + rndPassword +
    

    let objMail: _UT_MailMessage= {
      emailAddress: mailAddress,
      testoMail: testoMail,
      titoloMail: titoloMail
    }

    this.svcMail.inviaMail(objMail).subscribe({
      next: res=> {
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "RICHIESTA DI CAMBIO PASSWORD", sottoTitolo: "E' stata inviata una email di reset password a " + mailAddress}
        });
        this.form.controls['Email'].reset();
        this.form.controls['Email'].setErrors(null);
        this.reloadRoutes.emit("login");      
      },
      error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: "Errore durante l'invio", panelClass: ['red-snackbar']}))
    });




    //this.form.controls['Email'].markAsUntouched();
    //this.form.controls['Email'].markAsPristine();
  }

}
