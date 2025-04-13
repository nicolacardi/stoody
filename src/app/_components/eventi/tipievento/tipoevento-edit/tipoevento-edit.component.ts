//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../../utilities/dialog-yes-no/dialog-yes-no.component';
import { ColorPickerComponent }                 from '../../../utilities/color-picker/color-picker.component';

//services
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { TipiEventoService }                  from '../../tipievento.service';

//classes
import { CAL_TipoEvento }                     from 'src/app/_models/CAL_TipoEvento';
import { DialogDataTipoEventoEdit }               from 'src/app/_models/DialogData';

//#endregion
@Component({
  selector: 'app-tipoevento-edit',
  templateUrl: './tipoevento-edit.component.html',
  styleUrls: ['../../eventi.css']
})
export class TipoEventoEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  tipoevento$!:                               Observable<CAL_TipoEvento>;

  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- Constructor --------------------
  constructor(public _dialogRef: MatDialogRef<TipoEventoEditComponent>,
            @Inject(MAT_DIALOG_DATA) public data: DialogDataTipoEventoEdit,
            private svcTipiEvento:            TipiEventoService,
            private _loadingService :           LoadingService,
            private fb:                         UntypedFormBuilder, 
            public _dialog:                     MatDialog,
            private _snackBar:                  MatSnackBar) { 

    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      id:                                       [null],
      descrizione:                              ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      color:                                    [''],
      ckNota:                                   [''],
      seq:                                      [''],
    });

  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    if (this.data.tipoEventoID && this.data.tipoEventoID + '' != "0") {

      const obsTipoevento$: Observable<CAL_TipoEvento> = this.svcTipiEvento.get(this.data.tipoEventoID);
      const loadTipoevento$ = this._loadingService.showLoaderUntilCompleted(obsTipoevento$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.tipoevento$ = loadTipoevento$
      .pipe(
          tap(
            tipoevento => {
              // console.log(tipoevento);
              this.form.patchValue(tipoevento)
            }
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
      // console.log("tipoevento-edit - save - ",this.data.maxSeq, this.form.value);
      this.svcTipiEvento.post(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']}))
        });
    }
    else 
      this.svcTipiEvento.put(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']}))
        });
  }

  delete(){

    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          this.svcTipiEvento.delete(Number(this.data.tipoEventoID)).subscribe({
            next: res=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this.svcTipiEvento.renumberSeq().subscribe();
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }

  openColorPicker() {
    // console.log( "passo", this.form.controls['color'].value);
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
        //this.loadData(); 
      }
    );
  }
//#endregion


}
