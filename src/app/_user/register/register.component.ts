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
import { ParametriService }                     from 'src/app/_components/impostazioni/parametri/parametri.service';
import { PersoneService }                       from 'src/app/_components/persone/persone.service';

//models
import { _UT_MailMessage }                      from 'src/app/_models/_UT_MailMessage';
import { PER_Persona }                          from 'src/app/_models/PER_Persone';

//#endregion

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../user.css']
})


export class RegisterComponent {

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
            private svcPersone:                 PersoneService,

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
      
    let user : any;
    //interrogo e aspetto il DB per ottenere lo user che ha questa mail 
    //(TODO: bloccare possibilità di inserimento più utenti con una stessa mail!)
    await firstValueFrom(this.svcUser.getByMailAddress(mailAddress)
      .pipe(
        tap(res => { user = res;}
      )
    ));

    //se l'utente c'è blocco tutto: non si tratta di una prima registrazione
    console.log ("user trovato", user);
    if (user) {
      this._snackBar.openFromComponent(SnackbarComponent, { data: "Utente già registrato in precedenza"  , panelClass: ['red-snackbar']});
      return;
    }

    let persona! : PER_Persona;
    //vado a verificare che esista in PER_persone un record con la mail inserita
    await firstValueFrom(this.svcPersone.getByMailAddress(mailAddress)
      .pipe(
        tap(res => { persona = res;}
      )
    ));

    console.log ("persona trovata", persona);

    if (!persona) {
      this._snackBar.openFromComponent(SnackbarComponent, { data: "Non esiste un utente con questa mail"  , panelClass: ['red-snackbar']});
      return;
    }


    let rndPassword = Utility.generateRandomString();

    //ora devo salvare la password temporanea

    let formData = {

      userName:     mailAddress,
      personaID:    persona.id,
      password:     rndPassword,
      tmpPassword:  rndPassword,                
      email:        mailAddress,
      normalizedEmail:  mailAddress,
      fullName:  'da cancellare'
    };

    console.log ("formData to post", formData);
    await firstValueFrom(this.svcUser.post(formData));


    let base64LogoScuolaEmail = '';
    let base64LogoStoody ='';

    await firstValueFrom(this.svcParametri.getByParName('imgFileLogoScuolaEmail').pipe(tap(res=> {base64LogoScuolaEmail = res.parValue;})));
    await firstValueFrom(this.svcParametri.getByParName('imgFileLogoStoody').pipe(tap(res=> {base64LogoStoody = res.parValue;})));



    let titoloMail = "STOODY: Invio Password Temporanea";
    let testoMail =  "<html><body>"+
    "<div style='width: 100%; background-color: lightblue; border-radius: 10px; text-align: center; padding: 10px;'>"+
      "<div style='width: 500px; margin: auto; background-color: white; border-radius: 30px; padding: 20px; line-height: normal'>"+
        "<img style='width: 100px' src='"+base64LogoStoody+"'/> <br><br>" +

        "<span style='font-size: 1.3em'> Questa è la conferma della registrazione dell'utente<br>riferito a questo indirizzo email. </span><br>" +
        "<br><br> Puoi accedere tramite questo link<br><br>" +

        "<a class='btn' href='localhost:4200/change-psw-ext?username="+mailAddress+"&key=" + rndPassword +"'>localhost:4200/change-psw-ext?username="+mailAddress+"&key=" + rndPassword +"</a><br><br>"+
        "e impostare la nuova password."+
        "<br><br> Se non sei stato tu a richiedere questa registrazione segnalalo a info@stoody.it " +
        "<br><br><img alt='logo Scuola' style='width: 100px' src='"+base64LogoScuolaEmail+"'/> <br><br>"+
      "</div>"+
      "</div>"+  
    "</body"+
    "</html>"
    

    ;
    mailAddress = "nicola.cardi@gmail.com"; //per evitare di spammare il mondo in questa fase    

    console.log ("testomail", testoMail);
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
          data: {titolo: "RICHIESTA DI CAMBIO PASSWORD", sottoTitolo: "E' stata inviata una email di conferma a " + mailAddress}
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
