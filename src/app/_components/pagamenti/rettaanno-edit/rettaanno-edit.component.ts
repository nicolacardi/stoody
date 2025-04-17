//#region ----- IMPORTS ------------------------

import { Component, Input, OnChanges }                from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }       from '@angular/forms';
import { Observable }                                 from 'rxjs';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';

//models
import { PAG_Retta }                                  from 'src/app/_models/PAG_Retta';

//#endregion
@Component({
  selector: 'app-rettaanno-edit',
  templateUrl: './rettaanno-edit.component.html',
  styleUrls: ['../pagamenti.css'],
})
export class RettaannoEditComponent implements OnChanges {

//#region ----- Variabili ----------------------
  form!                 : UntypedFormGroup;
  emptyForm             : boolean = false;
  totDefault!           : number;
  totConcordate!        : number;
  totPagamenti!         : number;
  retta$!               : Observable<PAG_Retta[]>;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() iscrizione!                 : CLS_Iscrizione;
  @Input() quotaConcordataAnno!        : number;
  @Input() quotaDefaultAnno!           : number;
  @Input() totPagamentiAnno!           : number;
//#endregion

//#region ----- Constructor --------------------

  constructor( 
    private fb:               UntypedFormBuilder,
  ) {

    this.form = this.fb.group({
      quotaDefaultAnno:     [{ value: null, disabled: true }],
      quotaConcordataAnno:  [{ value: null, disabled: true }],
      totPagamentiAnno:     [{ value: null, disabled: true }],
    });
   }
//#endregion

//#region ----- ViewChild Input Output ---------

   ngOnChanges() {
    if (this.iscrizione && this.quotaDefaultAnno > 0) 
      this.loadData();
    else {
      this.emptyForm = true;
      this.form.reset(); 
    }
  }

  loadData(){
    this.form.controls['quotaDefaultAnno'].setValue(this.quotaDefaultAnno);
    this.form.controls['quotaConcordataAnno'].setValue(this.quotaConcordataAnno);
    this.form.controls['totPagamentiAnno'].setValue(this.totPagamentiAnno);
  }

}
