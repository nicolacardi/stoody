//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

//components

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { RetteService } from '../rette.service';

//models
import { PAG_Retta } from 'src/app/_models/PAG_Retta';

//#endregion
@Component({
  selector: 'app-rettaanno-edit',
  templateUrl: './rettaanno-edit.component.html',
  styleUrls: ['../pagamenti.css'],
})
export class RettaannoEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  totDefault!:                                  number;
  totConcordate!:                               number;
  totPagamenti!:                                number;
  retta$!:                                      Observable<PAG_Retta[]>;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() alunnoID!:                           number;
  @Input() annoID!:                             number;
  @Input() public quotaConcordataAnno!:         number; 
  @Input() public quotaDefaultAnno!:            number; 
  @Input() public totPagamentiAnno!:            number; 
//#endregion

//#region ----- Constructor --------------------

  constructor( private fb:               UntypedFormBuilder,
               private svcRette:         RetteService,
               private _loadingService:  LoadingService ) {

    this.form = this.fb.group({
      quotaDefaultAnno:           [null],
      quotaConcordataAnno:        [null],
      totPagamentiAnno:         [null],
    });
   }
//#endregion

//#region ----- ViewChild Input Output ---------

   ngOnChanges() {
    if (this.alunnoID && this.alunnoID + '' != "0" && this.quotaDefaultAnno > 0) 
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
    /*
    const obsRetta$: Observable<PAG_Retta[]> = this.svcRette.listByAlunnoAnno(this.alunnoID, this.annoID);
    const loadRette$ =this._loadingService.showLoaderUntilCompleted(obsRetta$);
    this.retta$ = loadRette$.pipe(
      tap(
        (retta: PAG_Retta[]) => {
          this.totPagamenti = 0;
          this.totConcordate = 0;
          this.totDefault = 0;
          retta.forEach( (rettaMese: PAG_Retta) => {
            rettaMese.pagamenti?.forEach( val=>{
              this.totPagamenti = this.totPagamenti + val.importo;
            });

            this.totConcordate = this.totConcordate + rettaMese.quotaConcordata;
            this.totDefault = this.totDefault + rettaMese.quotaDefault;

          }

          )
          console.log ("totDefault", this.totDefault);
          this.form.controls['totPagamenti'].setValue(this.totPagamenti);
          this.form.controls['totConcordate'].setValue(this.totConcordate);
          this.form.controls['totDefault'].setValue(this.totDefault);

        }
      )
    );
    */


  }


  ngOnInit(): void {
  }

//#endregion

  save() {
    //TODO??
  }

}
