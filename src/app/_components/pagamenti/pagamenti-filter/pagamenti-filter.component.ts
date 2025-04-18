//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit}              from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';
import { Observable }                           from 'rxjs';

//components
import { PagamentiListComponent }               from '../pagamenti-list/pagamenti-list.component';

//services
import { CausaliPagamentoService }              from '../causaliPagamento.service';
import { TipiPagamentoService }                 from '../tipiPagamento.service';

//models
import { PAG_CausalePagamento }                 from 'src/app/_models/PAG_CausalePagamento';
import { PAG_TipoPagamento }                    from 'src/app/_models/PAG_TipoPagamento';

//#endregion
@Component({
  selector: 'app-pagamenti-filter',
  templateUrl: './pagamenti-filter.component.html',
  styleUrls: ['../pagamenti.css']
})
export class PagamentiFilterComponent implements OnInit {

//#region ----- Variabili ----------------------

  formClean= true;

  causaliPagamento$!:                           Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!:                              Observable<PAG_TipoPagamento[]>;
  
  tipoPagamentoFilter = new                     UntypedFormControl('');
  causaleFilter = new                           UntypedFormControl('');
  nomeFilter = new                              UntypedFormControl('');
  cognomeFilter = new                           UntypedFormControl('');
  importoPiuDiFilter = new                      UntypedFormControl('');
  importoFilter = new                           UntypedFormControl('');
  importoMenoDiFilter = new                     UntypedFormControl('');
  dataDal = new                                 UntypedFormControl('');
  dataAl = new                                  UntypedFormControl('');

//#endregion
  
//#region ----- ViewChild Input Output -------  
  @Input() pagamentiListComponent!: PagamentiListComponent;
//#endregion

//#region ----- Constructor --------------------

  constructor(               
    private svcTipiPagamento:                   TipiPagamentoService,
    private svcCausaliPagamento:                CausaliPagamentoService,) {}
    
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {

    this.causaliPagamento$ = this.svcCausaliPagamento.list();
    this.tipiPagamento$ = this.svcTipiPagamento.list();

    this.tipoPagamentoFilter.valueChanges.subscribe(val => {this.applyFilterDx('tipoPagamento', val);})
    this.causaleFilter.valueChanges.subscribe(val => {this.applyFilterDx('causale', val);})
    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.importoPiuDiFilter.valueChanges.subscribe(val => {this.applyFilterDx('importoPiuDi', val);})
    this.importoMenoDiFilter.valueChanges.subscribe(val => {this.applyFilterDx('importoMenoDi', val);})
    this.dataDal.valueChanges.subscribe(val => {this.applyFilterDx('dataDal', val);})
    this.dataAl.valueChanges.subscribe(val => {this.applyFilterDx('dataAl', val);})
    
    this.importoFilter.valueChanges.subscribe(
      val => {
        if (this.importoFilter.value != '') {this.importoMenoDiFilter.disable();this.importoPiuDiFilter.disable()} 
        else {this.importoMenoDiFilter.enable(); this.importoPiuDiFilter.enable()}
        this.pagamentiListComponent.filterValues.importo = val;
        this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
      }
    )
  }

  applyFilterDx(field: keyof typeof this.pagamentiListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.pagamentiListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.pagamentiListComponent.matDataSource.filter = JSON.stringify(this.pagamentiListComponent.filterValues);
    // this.pagamentiListComponent.updateEmailAddresses();
    this.formClean = this.isFormClean();
  }



  isFormClean(): boolean {
    return (

      (this.tipoPagamentoFilter.value === null || this.tipoPagamentoFilter.value === '') &&
      (this.causaleFilter.value === null || this.causaleFilter.value === '') &&
      this.nomeFilter.value === '' &&
      this.cognomeFilter.value === '' &&
      this.importoPiuDiFilter.value === '' &&
      this.importoMenoDiFilter.value === '' &&
      this.importoFilter.value === '' &&
      (this.dataDal.value === null || this.dataDal.value === '') &&
      (this.dataAl.value === null || this.dataAl.value === '')
    );
  }
//#endregion

//#region ----- Reset vari -------
  resetFilterSx() {
      //this.pagamentiListComponent.matDataSource.filter = ''; 
      //this.pagamentiListComponent.filterValue = ''; DA AGGIUNGERE PER EVITARE CHE LA CUSTOMPIPE highlight funzioni male ma prima va creata this.filtervalue nel component come negli altri
      //this.pagamentiListComponent.filterInput.nativeElement.value = '';
    }

  resetAllInputs() {
    this.tipoPagamentoFilter.setValue('', {emitEvent:false});
    this.causaleFilter.setValue('', {emitEvent:false});
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.dataDal.setValue('', {emitEvent:false});
    this.dataAl.setValue('', {emitEvent:false});
    this.importoFilter.setValue('', {emitEvent:false});
    this.importoMenoDiFilter.setValue('', {emitEvent:false});
    this.importoPiuDiFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.tipoPagamentoFilter.setValue('');
    this.causaleFilter.setValue('');
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('');
    this.dataDal.setValue('');
    this.dataAl.setValue('');
    this.importoFilter.setValue('');
    this.importoMenoDiFilter.setValue('');
    this.importoPiuDiFilter.setValue('');
  }
//#endregion
}
