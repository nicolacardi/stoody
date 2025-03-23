//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { concatMap, tap }                                  from 'rxjs/operators';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { DocenteFormComponent }                 from '../docente-form/docente-form.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { DocentiService }                       from '../docenti.service';

//models
import { PER_Docente }                          from 'src/app/_models/PER_Docente';
import { User }                                 from 'src/app/_user/Users';
import { PersonaFormComponent } from '../../persone/persona-form/persona-form.component';
import { PER_Persona } from 'src/app/_models/PER_Persone';

//#endregion

@Component({
  selector: 'app-docente-edit',
  templateUrl: './docente-edit.component.html',
  styleUrl: '../docenti.css'
})
export class DocenteEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  docente$!:                                      Observable<PER_Docente>;
  currdocente!:                                   User;

  public personaID!:                            number;

  // form! :                                       UntypedFormGroup;

  personaFormisValid!:                          boolean;
  docenteFormisValid!:                           boolean;

  isValid!:                                     boolean;
  emptyForm :                                   boolean = false;
  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;
  breakpoint!:                                  number;
  breakpoint2!:                                 number;
//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChild(PersonaFormComponent) personaFormComponent!       : PersonaFormComponent;
  @ViewChild(DocenteFormComponent) docenteFormComponent!       : DocenteFormComponent;

//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<DocenteEditComponent>,
              @Inject(MAT_DIALOG_DATA) public docenteID: number,
              private fb:                           UntypedFormBuilder, 
              private svcdocenti:                   DocentiService,
              public _dialog:                       MatDialog,
              private _snackBar:                    MatSnackBar,
              private _loadingService :             LoadingService  ) {

    _dialogRef.disableClose = true;
    
    //let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";

    // this.form = this.fb.group({
    //   id:                         [null],
    //   tipodocenteID:              ['', Validators.required],
    //   ckAttivo:                   [true]
    // });  
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    if (this.docenteID && this.docenteID + '' != "0") {

      const obsdocente$: Observable<PER_Docente> = this.svcdocenti.get(this.docenteID);
      const loaddocente$ = this._loadingService.showLoaderUntilCompleted(obsdocente$);

      this.docente$ = loaddocente$
      .pipe( 
          tap(
            docente => {
              this.personaID = docente.personaID;
              this.docenteID = docente.id
            }
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

    // this.docenteFormComponent.save();
    // // this.personaFormComponent.save();
    // this.personaFormComponent.save()
    // .subscribe({
    //   next: (persona:PER_Persona) => {
    //     console.log (persona);
    //     //this.docenteFormComponent.form.controls['personaID'].setValue(persona.id);
    //     //this.docenteFormComponent.save();
    //     this._dialogRef.close();
    //     this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
    //   },
    //   error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    // });


        this.personaFormComponent.save()
        .pipe(
          tap(persona => {
            if (this.docenteFormComponent.form.controls['personaID'].value == null)
                this.docenteFormComponent.form.controls['personaID'].setValue(persona.id);
            //this.personaID = persona.id; //questa non fa a tempo ad arrivare a alunnoFormComponent per fare anche la post di formAlunno con il giusto personaID
          }),
        //concatMap( () => this.docenteFormComponent.save())
        ).subscribe({
          next: res=> {
            this.docenteFormComponent.save();
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        });


  }

  delete()
  {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
              dialogYesNo.afterClosed().subscribe( result => {
        if(result){

          this.docenteFormComponent.delete();
          /*
          .subscribe( {
            next: res=> { 
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
          */
        }
    });
  }
//#endregion

//#region ----- Altri metodi -------------------

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 4;
    this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
  }

  formPersonaValidEmitted(isValid: boolean) {
    this.personaFormisValid = isValid;
  }

  formValidEmitted(isValid: boolean) {
    this.isValid = isValid;
  }

//#endregion
}



