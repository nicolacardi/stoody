//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit}              from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';

//components
import { DomandeListComponent }                 from '../domande-list/domande-list.component';
//#endregion
@Component({
  selector: 'app-domande-filter',
  templateUrl: './domande-filter.component.html',
  styleUrls: ['../domande.css']
})
export class DomandeFilterComponent {

  
//#region ----- Variabili ----------------------

formClean= true;

domandaFilter = new UntypedFormControl('');
contestoFilter = new UntypedFormControl('');
tipoFilter = new UntypedFormControl('');
titoloFilter = new UntypedFormControl('');


//#endregion

//#region ----- ViewChild Input Output ---------  
@Input() DomandeListComponent!: DomandeListComponent;
//#endregion

constructor() {}

//#region ----- LifeCycle Hooks e simili--------

ngOnInit() {
  this.domandaFilter.valueChanges.subscribe(val => {this.applyFilterDx('domanda', val);})
  this.contestoFilter.valueChanges.subscribe(val => {this.applyFilterDx('contesto', val);})
  this.tipoFilter.valueChanges.subscribe(val => {this.applyFilterDx('tipo', val);})
  this.titoloFilter.valueChanges.subscribe(val => {this.applyFilterDx('titolo', val);})
}

applyFilterDx(field: keyof typeof this.DomandeListComponent.filterValues, val: string) {
  //this.resetFilterSx();
  this.DomandeListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
  this.DomandeListComponent.matDataSource.filter = JSON.stringify(this.DomandeListComponent.filterValues);
  this.formClean = this.isFormClean();
}

isFormClean(): boolean {
  return (
    this.domandaFilter.value === '' &&
    this.contestoFilter.value === '' &&
    this.tipoFilter.value === '' &&
    this.titoloFilter.value === ''
  );
}

//#endregion

//#region ----- Reset vari ---------------------

//AS: pulizia filtro di sinistra, chiamata su edit filtro di destra
// PER IL MOMENTO NON UTILIZZATA
resetFilterSx() {
    // this.alunniListComponent.matDataSource.filter = ''; 
    // this.alunniListComponent.filterValue = '';
    // this.alunniListComponent.filterValues.filtrosx = ''; 
    // this.alunniListComponent.filterInput.nativeElement.value = '';
}

resetAllInputs() {
  this.domandaFilter.setValue('', {emitEvent:false});
  this.contestoFilter.setValue('', {emitEvent:false});
  this.tipoFilter.setValue('', {emitEvent:false});
  this.titoloFilter.setValue('', {emitEvent:false});
}

resetAllInputsAndClearFilters() {
  this.domandaFilter.setValue('');
  this.contestoFilter.setValue('')
  this.tipoFilter.setValue('');
  this.titoloFilter.setValue('');
}

//#endregion
}



