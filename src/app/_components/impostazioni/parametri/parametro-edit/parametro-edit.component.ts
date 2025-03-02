//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';
// import { CustomOption, QuillEditorComponent }   from 'ngx-quill'
// import 'quill-mention'

//components
import { SnackbarComponent }                    from '../../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { ParametriService }                     from 'src/app/_components/impostazioni/parametri/parametri.service';

//models
import { DialogDataParametroEdit }              from 'src/app/_models/DialogData';
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';


@Component({
  selector: 'app-parametro-edit',
  templateUrl: './parametro-edit.component.html',
  styleUrls: ['../parametri.css']
})
export class ParametroEditComponent {

//#region ----- Variabili ----------------------

  parametro$!:                                  Observable<_UT_Parametro>;
  obsParametri$!:                               Observable<_UT_Parametro[]>;
  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  modules:                                      any = {};
  ckCheckBoxes=                                 false;

  //#endregion

  //#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<ParametroEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data:       DialogDataParametroEdit,
              private svcParametri:             ParametriService,

              private _loadingService :         LoadingService,
              private fb:                       UntypedFormBuilder, 
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar ) { 
    
    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      id:                                       [null],
      parName:                                  ['', { validators:[ Validators.required]}],
      parValue:                                 ['', { validators:[ Validators.required]}],
      parDescr:                                 ['', { validators:[ Validators.required]}],
      ckSetupPage:                              [''],
      ckCheckBox:                               [''],
      seq:                                      ['']
    });

    
  }

  //#endregion

  //#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData() {

    if (this.data.parametroID && this.data.parametroID + '' != "0") {

      const obsParametro$: Observable<_UT_Parametro> = this.svcParametri.get(this.data.parametroID);
      const loadParametro$ = this._loadingService.showLoaderUntilCompleted(obsParametro$);
      this.parametro$ = loadParametro$
      .pipe(
          tap(
            parametro => {
              this.form.patchValue(parametro)

              //se si tratta di checkbox inserisco un controllo che si chiama 'ck_n' per ciascun valore
              if (this.form.controls['ckCheckBox']) {
                let pv = this.form.controls['parValue'].value
                for (let i = 0; i < pv.length; i++) {
                   const controlName = "ck_"+i; // Generate a unique control name
                   //const digit = pv[i];
                   const digit = pv[i] === '1';
                   this.form.addControl(controlName, this.fb.control(digit));
                }
              }
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

    if (this.form.controls['ckCheckBox'].value == true ){
      let pv = this.form.controls['parValue'].value
      let sequenza01 = '';

      for (let i = 0; i < pv.length; i++) {
        const controlName = "ck_" + i;
        const isChecked = this.form.controls[controlName].value;
        sequenza01 += isChecked ? '1' : '0';
      }
      this.form.controls['parValue'].setValue(sequenza01);
    }

    if (this.form.controls['id'].value == null) {
      this.form.controls['seq'].setValue(this.data.maxSeq +1);
      this.svcParametri.post(this.form.value).subscribe({
        next: res=> {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          this._dialogRef.close();
        },
        error: err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      });
    }
    else {
      this.svcParametri.put(this.form.value).subscribe({
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
          this.svcParametri.delete(Number(this.data.parametroID)).subscribe({
            next: () =>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this.svcParametri.renumberSeq().subscribe();
              this._dialogRef.close();
            },
            error: err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }

//#endregion

}
