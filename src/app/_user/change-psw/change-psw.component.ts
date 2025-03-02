//#region ----- IMPORTS ------------------------
import { Component, Renderer2, ElementRef, OnInit, ViewChild }                    from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { SnackbarComponent }                    from '../../_components/utilities/snackbar/snackbar.component';

//components
import { Utility }                              from '../../_components/utilities/utility.component';

//services
import { UserService }                          from 'src/app/_user/user.service';
import { User }                                 from 'src/app/_user/Users';

//#endregion

@Component({
  selector: 'app-change-psw',
  templateUrl: './change-psw.component.html',
  styleUrls: ['../user.css']
})

export class ChangePswComponent implements OnInit {

//#region ----- Variabili ----------------------

  form! :                                       UntypedFormGroup;
  public currUser!:                             User;

  ckPsw : boolean[] =[true, true, true];
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('psw0') pswInput0!: ElementRef;
  @ViewChild('psw1') pswInput1!: ElementRef;
  @ViewChild('psw2') pswInput2!: ElementRef;
//#endregion


//#region ----- Constructor --------------------

  constructor( private fb:                      UntypedFormBuilder, 
               private svcUser:                 UserService,
               private _snackBar:               MatSnackBar,
               private renderer:                Renderer2) { 

    this.form = this.fb.group({
        password:        ['', [Validators.required, Validators.minLength(4)]],
        newPassword:     ['', [Validators.required, Validators.minLength(4), Validators.maxLength(19)]],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: [
          Utility.matchingPasswords ('newPassword', 'confirmPassword'),
          Utility.checkIfChangedPasswords('password', 'newPassword') ]
      });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.currUser = Utility.getCurrentUser();
  }

  save(){
    
    let formData = {
      userID:       this.currUser.userID,
      currPassword:  this.form.controls['password'].value,
      newPassword:  this.form.controls['newPassword'].value
    };

    this.svcUser.ChangePassword(formData).subscribe({
      next: res =>  {
        if(res.succeeded == false)
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password attuale non corretta', panelClass: ['red-snackbar']});
        else
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
      },
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio della password', panelClass: ['red-snackbar']})
    });
  }
//#endregion

  toggleShow(index: number) {
    this.ckPsw[index] = !this.ckPsw[index];
    const inputElement = this.getInputByIndex(index);

    const newType = this.ckPsw[index] ? 'password' : 'text';
    this.renderer.setAttribute(inputElement, 'type', newType);
  }

  getInputByIndex(index: number): HTMLInputElement {
    switch (index) {
      case 0:
        return this.pswInput0.nativeElement;
      case 1:
        return this.pswInput1.nativeElement;
      case 2:
        return this.pswInput2.nativeElement;
      default:
        throw new Error(`Invalid index: ${index}`);
    }
  }
}
