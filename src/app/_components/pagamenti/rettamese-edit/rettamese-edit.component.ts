//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnInit, Output}       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }                from '@angular/forms';
import { MatDialog }                                           from '@angular/material/dialog';

//services
import { RetteService }                                        from '../rette.service';

//models
import { PAG_Retta }                                           from 'src/app/_models/PAG_Retta';

//#endregion
@Component({
  selector        : 'app-rettamese-edit',
  templateUrl     : './rettamese-edit.component.html',
  styleUrls       : ['../pagamenti.css'],
})

export class RettameseEditComponent implements OnInit{

//#region ----- Variabili ----------------------
  form!        : UntypedFormGroup;
  emptyForm    : boolean = false;
//#endregion

//#region ----- ViewChild Input Output -------


  @Input() rettaMese!      : PAG_Retta;
  @Output() mesePagamentoClicked = new EventEmitter<number>();
  @Output() saved          = new EventEmitter<void>();
//#endregion

//#region ----- Constructor --------------------

  constructor(
    private fb       : UntypedFormBuilder,
    private svcRette : RetteService,
    public _dialog   : MatDialog,
  ) { 

    this.form = this.fb.group({
      id:                     [null],
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
    // console.log ("retta-mese - ngOnChanges - rettaMese", this.rettaMese);
    if (this.rettaMese) {
      this.loadData();

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
  save(){
    if (this.form.controls['id'].value != null && this.form.controls['id'].value != 0) {
      // console.log("rettamese-edit - put di this.form.value", this.form.value)
      this.svcRette.put(this.form.value).subscribe(()=>this.saved.emit());
    } else {
      // console.log("rettamese-edit - post di this.form.value", this.form.value)
      this.svcRette.post(this.form.value).subscribe(()=>this.saved.emit());
    }
    
  }
//#endregion

//#region ----- Altri metodi -------
  ConvertToNumber (x: string): number {
    return parseInt(x);
  }



  clickOnPagamento() {
    this.mesePagamentoClicked.emit(this.rettaMese.meseRetta);
  }

//#endregion
}


