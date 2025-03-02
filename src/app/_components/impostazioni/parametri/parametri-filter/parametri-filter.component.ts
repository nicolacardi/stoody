//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit}              from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';

//components
import { ParametriListComponent }               from '../parametri-list/parametri-list.component';

//#endregion
@Component({
  selector: 'app-parametri-filter',
  templateUrl: './parametri-filter.component.html',
  styleUrls: ['../parametri.css']
})

export class ParametriFilterComponent implements OnInit {

//#region ----- Variabili ----------------------

  formClean= true;

  parNameFilter = new UntypedFormControl('');
  parValueFilter = new UntypedFormControl('');
  parDescrFilter = new UntypedFormControl('');

//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() ParametriListComponent!: ParametriListComponent;
//#endregion

  constructor() {}

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    this.parNameFilter.valueChanges.subscribe(val => {this.applyFilterDx('parName', val);})
    this.parValueFilter.valueChanges.subscribe(val => {this.applyFilterDx('parValue', val);})
    this.parDescrFilter.valueChanges.subscribe(val => {this.applyFilterDx('parDescr', val);})

  }

  applyFilterDx(field: keyof typeof this.ParametriListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.ParametriListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.ParametriListComponent.matDataSource.filter = JSON.stringify(this.ParametriListComponent.filterValues);
    this.formClean = this.isFormClean();
  }

  isFormClean(): boolean {
    return (
      this.parNameFilter.value === '' &&
      this.parValueFilter.value === '' &&
      this.parDescrFilter.value === '' 

    );
  }
//#endregion


//#region ----- Reset vari -------
  resetFilterSx() {
    //this.ParametriListComponent.matDataSource.filter = ''; 
    //this.ParametriListComponent.filterValue = ''; DA AGGIUNGERE PER EVITARE CHE LA CUSTOMPIPE highlight funzioni male ma prima va creata this.filtervalue nel component come negli altri
    //this.ParametriListComponent.filterValues.filtrosx = ''; 
    //this.ParametriListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.parNameFilter.setValue('', {emitEvent:false});
    this.parValueFilter.setValue('', {emitEvent:false});
    this.parDescrFilter.setValue('', {emitEvent:false});


  }

  resetAllInputsAndClearFilters() {
    this.parNameFilter.setValue('');
    this.parValueFilter.setValue('');
    this.parDescrFilter.setValue('');

  }
//#endregion
}
