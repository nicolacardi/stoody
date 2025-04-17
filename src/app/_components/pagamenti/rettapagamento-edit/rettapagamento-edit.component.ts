//#region ----- IMPORTS ------------------------

//TODO causale.value == 1 va cagarissimo
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

//components
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { CausaliPagamentoService } from '../causaliPagamento.service';
import { PagamentiService } from '../pagamenti.service';
import { RetteService } from '../rette.service';
import { TipiPagamentoService } from '../tipiPagamento.service';

//models
import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';

//#endregion
@Component({
  selector: 'app-rettapagamento-edit',
  templateUrl: './rettapagamento-edit.component.html',
  styleUrls: ['../pagamenti.css'],
  standalone: false
})
export class RettapagamentoEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  formRetta! :                UntypedFormGroup;
  causaliPagamento$!:         Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!:            Observable<PAG_TipoPagamento[]>;

  public mesiArr=           [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('causale')       public causale!: MatSelect;

  @Input() iscrizione!:       CLS_Iscrizione;
  @Output('nuovoPagamento')
  pagamentoEmitter = new EventEmitter<string>();
//#endregion

//#region ----- Constructor --------------------

  constructor(private fb:                           UntypedFormBuilder, 
              private svcTipiPagamento:             TipiPagamentoService,
              private svcCausaliPagamento:          CausaliPagamentoService,
              private svcPagamenti:                 PagamentiService,
              private svcRette:                     RetteService,
              private _snackBar:                    MatSnackBar,
              public _dialog:                       MatDialog,) { 

    this.formRetta = this.fb.group({
      id:                         [null],
      alunnoID:                   [''],
      annoID:                     [''],
      causaleID:                  ['', Validators.required],
      dtPagamento:                ['', Validators.required],
      importo:                    ['', Validators.required],
      tipoPagamentoID:            ['', Validators.required],
      meseRetta:                  ['', Validators.required],
      rettaID:                    ['']
    });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData(){
    this.causaliPagamento$ = this.svcCausaliPagamento.list();
    this.tipiPagamento$ = this.svcTipiPagamento.list();
  }
//#endregion

//#region ----- Operazioni CRUD ----------------
  save( ){
    //if (this.formRetta.controls['id'].value == null) { //non serve questo check: facciamo sempre la post mai la put
   if (this.iscrizione.alunnoID == 0) {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Selezionare prima un Alunno"}
    });
    this.formRetta.reset();
    return;
   }
    this.formRetta.controls['alunnoID'].setValue(this.iscrizione.alunnoID);
    this.formRetta.controls['annoID'].setValue(this.iscrizione.classeSezioneAnno.annoID);
    

    if (this.causale.value == 1) {
      
      //ATTENZIONE: ASINCRONA! BISOGNA ASPETTARE CHE QUESTA RISPONDA PRIMA DI LANCIARE LA SUCCESSIVA post
      this.svcRette.getByAlunnoAnnoMese(this.iscrizione.alunnoID, this.iscrizione.classeSezioneAnno.annoID, (this.formRetta.controls['meseRetta'].value + 1))
      .pipe (
        tap (val=> this.formRetta.controls['rettaID'].setValue(val.id)), //il valore in arrivo dalla load viene inserito nel form
        concatMap(() => this.svcPagamenti.post(this.formRetta.value)) //concatMap ATTENDE l'observable precedente prima di lanciare il successivo
      ).subscribe({
          next: res => {
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            //this._dialogRef.close();
            this.pagamentoEmitter.emit(this.formRetta.controls['meseRetta'].value);
            this.resetFields();
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      });

    } else {

      this.svcPagamenti.post(this.formRetta.value).subscribe({
        next: res => {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          //this._dialogRef.close();
          this.pagamentoEmitter.emit("RecordSalvato");
          this.resetFields();
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      })
    }
  }
//#endregion  

//#region ----- Altri metodi -------------------

  changedCausale(value: number) {
    if (value == 1) {
      this.formRetta.controls["meseRetta"].setValidators(Validators.required);
      this.formRetta.controls["meseRetta"].updateValueAndValidity();
    } else {
      this.formRetta.controls["meseRetta"].clearValidators();
      this.formRetta.controls["meseRetta"].updateValueAndValidity();
    }
  }

  resetFields(){

    this.formRetta.controls["id"].setValue(null);
    this.formRetta.controls["alunnoID"].setValue(null);
    this.formRetta.controls["annoID"].setValue(null);
    this.formRetta.controls["causaleID"].setValue(null);
    this.formRetta.controls["dtPagamento"].setValue(null);
    this.formRetta.controls["importo"].setValue(null);
    this.formRetta.controls["tipoPagamentoID"].setValue(null);
    this.formRetta.controls["meseRetta"].setValue(null);

    this.formRetta.markAsPristine();
    this.formRetta.markAsUntouched();
    this.formRetta.updateValueAndValidity();

    for (let control in this.formRetta.controls) {
      this.formRetta.controls[control].setErrors(null);
    }
  }
//#endregion

}
