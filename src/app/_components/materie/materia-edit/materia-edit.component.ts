//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }                                       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }                from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA }       from '@angular/material/dialog';
import { MatSnackBar }                                                     from '@angular/material/snack-bar';
import { Observable }                                                      from 'rxjs';
import { tap }                                                             from 'rxjs/operators';

//components
import { SnackbarComponent }                                               from '../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                                            from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { ColorPickerComponent }                                            from '../../utilities/color-picker/color-picker.component';

//services
import { LoadingService }                                                  from '../../utilities/loading/loading.service';
import { MacroMaterieService }                                             from '../macromaterie.service';
import { MaterieService }                                                  from '../materie.service';

//classes
import { MAT_MacroMateria }                                                from 'src/app/_models/MAT_MacroMateria';
import { MAT_Materia }                                                     from 'src/app/_models/MAT_Materia';
import { DialogDataMateriaEdit }                                           from 'src/app/_models/DialogData';
import { MAT_TipoVoto }                                                    from 'src/app/_models/MAT_TipoVoto';
import { TipiVotoService }                                                 from '../tipi-voto.service';

//#endregion

@Component({
  selector: 'app-materia-edit',
  templateUrl: './materia-edit.component.html',
  styleUrls: ['../materie.css']
})
export class MateriaEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  materia$!                : Observable<MAT_Materia>;
  obsMacroMaterie$!        : Observable<MAT_MacroMateria[]>;
  obsTipiVoto$!            : Observable<MAT_TipoVoto[]>;
  form!                    : UntypedFormGroup;
  emptyForm                : boolean = false;
  loading                  : boolean = true;

//#endregion

//#region ----- Constructor --------------------

  constructor(
    public _dialogRef                           : MatDialogRef<MateriaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data        : DialogDataMateriaEdit,
    private svcMaterie                          : MaterieService,
    private svcTipiVoto                         : TipiVotoService,
    private svcMacroMaterie                     : MacroMaterieService,
    private _loadingService                     : LoadingService,
    private fb                                  : UntypedFormBuilder,
    public _dialog                              : MatDialog,
    private _snackBar                           : MatSnackBar,

    ) { 

    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      id:                         [null],
      descrizione:                ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      macroMateriaID:             [''],
      tipoVotoID:                 [''],
      color:                      [''],
      seq:                        ['']
    });

  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    this.obsTipiVoto$ = this.svcTipiVoto.list();
    this.obsMacroMaterie$ = this.svcMacroMaterie.list();

    if (this.data.materiaID && this.data.materiaID + '' != "0") {

      const obsMateria$: Observable<MAT_Materia> = this.svcMaterie.get(this.data.materiaID);
      const loadMateria$ = this._loadingService.showLoaderUntilCompleted(obsMateria$);
      this.materia$ = loadMateria$
        .pipe(
          tap(
            materia => this.form.patchValue(materia)
          )
      );
    } 
    else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save(){

    if (this.form.controls['id'].value == null) {
      this.form.controls['seq'].setValue(this.data.maxSeq +1);
      this.svcMaterie.post(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
        });
    }
    else {
      this.svcMaterie.put(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
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
        if(result){
          this.svcMaterie.delete(Number(this.data.materiaID)).subscribe({
            next: res=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this.svcMaterie.renumberSeq().subscribe();
              this._dialogRef.close();
            },
            error: err => {
              const messaggio = err?.error || 'Errore in cancellazione';
              this._snackBar.openFromComponent(SnackbarComponent, {
                data: messaggio,
                panelClass: ['red-snackbar']
              });
            }
          });
        }
    });
  }

  openColorPicker() {

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '350px',
      height: '475px',
      data: {ascRGB: this.form.controls['color'].value},
    };
    const dialogRef = this._dialog.open(ColorPickerComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => { 
        //devo valorizzare il campo color
        if (result) this.form.controls['color'].setValue(result);
      }
    );
  }
//#endregion


}
