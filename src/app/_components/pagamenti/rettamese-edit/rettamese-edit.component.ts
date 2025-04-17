//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnInit, Output}       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }                from '@angular/forms';
import { MatDialog }                                           from '@angular/material/dialog';

//components
import { DialogOkComponent }                                   from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { RetteService }                                        from '../rette.service';

//models
import { PAG_Retta }                                           from 'src/app/_models/PAG_Retta';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';

//#endregion
@Component({
  selector: 'app-rettamese-edit',
  templateUrl: './rettamese-edit.component.html',
  styleUrls: ['../pagamenti.css'],
})

export class RettameseEditComponent implements OnInit{

//#region ----- Variabili ----------------------
  form!        : UntypedFormGroup;
  emptyForm    : boolean = false;
//#endregion

//#region ----- ViewChild Input Output -------

  @Input() public iscrizione!       : CLS_Iscrizione;
  @Input() rettaMese!               : PAG_Retta;
  @Output('mesePagamentoClicked')
  clickOnpagamentoEmitter           = new EventEmitter<number>();
//#endregion

//#region ----- Constructor --------------------

  constructor(
    private fb       : UntypedFormBuilder,
    private svcRette : RetteService,
    public _dialog   : MatDialog,
  ) { 

    this.form = this.fb.group({
      id:                     [null],
      annoID:                 [null],
      alunnoID:               [null],
      iscrizioneID:           [null],
      annoRetta:              [null],
      meseRetta:              [null],
      quotaDefault:           [null],
      quotaConcordata:        [null],
      totPagamenti:           [null],
    });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {

    if (this.rettaMese) {
      this.loadData();
      this.emptyForm = false;
    } else {
      this.emptyForm = true;
      this.form.reset(); 
    }
    //if (this.toHighlight == this.rettaID && this.toHighlight!= null) {this.evidenzia = true} else { this.evidenzia = false}
  }

  ngOnInit(): void {
  }
  
  loadData(){

  if (this.rettaMese) {
    this.form.patchValue({
      id:               this.rettaMese.id, 
      iscrizioneID:     this.rettaMese.iscrizioneID,                    
      annoRetta:        this.rettaMese.annoRetta,
      meseRetta:        this.rettaMese.meseRetta,
      quotaDefault:     this.rettaMese.quotaDefault,
      quotaConcordata:  this.rettaMese.quotaConcordata,
      totPagamenti:     this.rettaMese.totPagamenti,
    });
  }

 

  }

//#endregion

//#region ----- Operazioni CRUD ----------------
  save(): boolean{
    console.log ("rettamese-edit - save", this.form.value)

    if (this.form.controls['id'].value != null && this.form.controls['id'].value != 0) {
      this.svcRette.put(this.form.value).subscribe();
    } else {
      if (this.form.controls['alunnoID'].value == null) {
        //post
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE", sottoTitolo: "Selezionare prima un Alunno"}
        });
        this.form.reset();
      } else {
        this.svcRette.post(this.form.value).subscribe();
      }

    }
    return true;
  }
//#endregion

//#region ----- Altri metodi -------
  ConvertToNumber (x: string): number {
    return parseInt(x);
  }

  clickOnPagamento() {
    this.clickOnpagamentoEmitter.emit(this.rettaMese.meseRetta);
  }
//#endregion
}


