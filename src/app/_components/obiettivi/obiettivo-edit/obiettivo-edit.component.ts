//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { iif, Observable, of }                  from 'rxjs';
import { concatMap, tap }                       from 'rxjs/operators';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { ClassiService }                        from '../../classi/classi.service';
import { MaterieService }                       from '../../materie/materie.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { ObiettiviService }                     from '../obiettivi.service';
import { PagellaVotoObiettiviService }          from '../../pagelle/pagella-voto-obiettivi.service';

//models
import { MAT_Obiettivo }                        from 'src/app/_models/MAT_Obiettivo';
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Classe }                           from 'src/app/_models/CLS_Classe';
import { MAT_Materia }                          from 'src/app/_models/MAT_Materia';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

//#endregion

@Component({
  selector: 'app-obiettivo-edit',
  templateUrl: './obiettivo-edit.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettivoEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  obiettivo$!:                                  Observable<MAT_Obiettivo>;
  obsClassi$!:                                  Observable<CLS_Classe[]>;
  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>;
  obsMaterie$!:                                 Observable<MAT_Materia[]>;


  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<ObiettivoEditComponent>,
              @Inject(MAT_DIALOG_DATA) public obiettivoID:  number,
              private svcObiettivi:                         ObiettiviService,
              private svcPagellaVotoObiettivi:              PagellaVotoObiettiviService,
              private svcClassi:                            ClassiService,
              private svcAnni:                              AnniScolasticiService,
              private svcMaterie:                           MaterieService,
              private _loadingService :                     LoadingService,
              private fb:                                   UntypedFormBuilder, 
              public _dialog:                               MatDialog,
              private _snackBar:                            MatSnackBar ) { 

    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      id:                         [null],
      descrizione:                ['', { validators:[ Validators.required, Validators.maxLength(255)]}],
      classeID:                   [''],
      annoID:                     [''],
      materiaID:                  ['']
    });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    this.obsClassi$ = this.svcClassi.list();
    this.obsAnni$= this.svcAnni.list();
    this.obsMaterie$ = this.svcMaterie.list();

    if (this.obiettivoID && this.obiettivoID + '' != "0") {

      const obsObiettivo$: Observable<MAT_Obiettivo> = this.svcObiettivi.get(this.obiettivoID);
      const loadObiettivo$ = this._loadingService.showLoaderUntilCompleted(obsObiettivo$);
      this.obiettivo$ = loadObiettivo$
      .pipe(
          tap(
            obiettivo => this.form.patchValue(obiettivo)
          )
      );
    } else {
      this.emptyForm = true
    }
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save(){

    if (this.form.controls['id'].value == null) {
      this.svcObiettivi.post(this.form.value).subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      });
    }
    else {
      this.svcObiettivi.put(this.form.value).subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
     });
    }
  }

  delete(){
  
    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result) {
          //bisogna verificare se per caso questo obiettivoID non sia utilizzato già in qualche voto
          this.svcPagellaVotoObiettivi.ListByObiettivo(this.obiettivoID)
          .pipe(
            tap(res => {
              if (res.length !=0) {
                const dialogRef = this._dialog.open(DialogOkComponent, {
                  width: '320px',
                  data: {titolo: "ATTENZIONE", sottoTitolo: "Questo obiettivo è utilizzato in qualche pagella"}
                });
                return;
              }
            }),
            concatMap(res=> iif (()=> res.length == 0, this.svcObiettivi.delete(Number(this.obiettivoID)), of() ))
          )
          .subscribe({
            next: res => {
              //console.log(res);
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }
//#endregion

}
