//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { SocioFormComponent }                   from '../socio-form/socio-form.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { SociService }                          from '../soci.service';

//models
import { PER_Socio, PER_TipoSocio }             from 'src/app/_models/PER_Soci';
import { User }                                 from 'src/app/_user/Users';

//#endregion

@Component({
  selector: 'app-socio-edit',
  templateUrl: './socio-edit.component.html',
  styleUrls: ['../soci.css']
})
export class SocioEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  socio$!:                                      Observable<PER_Socio>;
  obsTipiSocio$!:                               Observable<PER_TipoSocio[]>;
  currSocio!:                                   User;

  form! :                                       UntypedFormGroup;

  isValid!:                                     boolean;
  emptyForm :                                   boolean = false;
  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;
  breakpoint!:                                  number;
  breakpoint2!:                                 number;
//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChild(SocioFormComponent) socioFormComponent!: SocioFormComponent; 

//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<SocioEditComponent>,
              @Inject(MAT_DIALOG_DATA) public socioID: number,
              private fb:                           UntypedFormBuilder, 
              private svcSoci:                   SociService,
              public _dialog:                       MatDialog,
              private _snackBar:                    MatSnackBar,
              private _loadingService :             LoadingService  ) {

    _dialogRef.disableClose = true;
    
    //let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";

    this.form = this.fb.group({
      id:                         [null],
      tipoSocioID:              ['', Validators.required],
      ckAttivo:                   [true]
    });  
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    if (this.socioID && this.socioID + '' != "0") {

      const obsSocio$: Observable<PER_Socio> = this.svcSoci.get(this.socioID);
      const loadSocio$ = this._loadingService.showLoaderUntilCompleted(obsSocio$);

      this.socio$ = loadSocio$
      .pipe( 
          tap(
            socio => this.socioID = socio.id
            //this.form.patchValue(socio)
          )
      );
    }
    else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save()
  {
    this.socioFormComponent.save()
    .subscribe({
      next: ()=> {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    })
  }

  delete()
  {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
              dialogYesNo.afterClosed().subscribe( result => {
        if(result){

          this.socioFormComponent.delete()
          .subscribe( {
            next: res=> { 
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }
//#endregion

//#region ----- Altri metodi -------------------

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 4;
    this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
  }

  formValidEmitted(isValid: boolean) {
    this.isValid = isValid;
  }

//#endregion
}



