import { Component, Input, OnInit}              from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';

//components
import { VerbaliListComponent } from '../verbali-list/verbali-list.component';

@Component({
  selector: 'app-verbali-filter',
  templateUrl: './verbali-filter.component.html',
  styleUrls: ['../verbali.css']
})

export class VerbaliFilterComponent implements OnInit {

//#region ----- Variabili ----------------------
  formClean= true;

  nomeFilter = new UntypedFormControl('');
  cognomeFilter = new UntypedFormControl('');
  tipoFilter = new UntypedFormControl('');
  dtVerbaleFilter = new UntypedFormControl('');
  classeFilter = new UntypedFormControl('');
  titoloFilter = new UntypedFormControl('');

//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() verbaliListComponent!: VerbaliListComponent;
  //#endregion

  constructor() {

  }

  //#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.tipoFilter.valueChanges.subscribe(val => {this.applyFilterDx('tipo', val);})
    this.dtVerbaleFilter.valueChanges.subscribe(val => {this.applyFilterDx('dtVerbale', val);})
    this.classeFilter.valueChanges.subscribe(val => {this.applyFilterDx('classe', val);})
    this.titoloFilter.valueChanges.subscribe(val => {this.applyFilterDx('titolo', val);})
  }

  applyFilterDx(field: keyof typeof this.verbaliListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.verbaliListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.verbaliListComponent.matDataSource.filter = JSON.stringify(this.verbaliListComponent.filterValues);
    this.formClean = this.isFormClean();
  }
  
  isFormClean(): boolean {
    return (
      this.nomeFilter.value === '' &&
      this.cognomeFilter.value === '' &&
      this.tipoFilter.value === '' &&
      this.dtVerbaleFilter.value === '' &&
      this.classeFilter.value === '' &&
      this.titoloFilter.value === '' 
    );
  }
  //#endregion

  //#region ----- Reset vari -------

  //AS: pulizia filtro di sinistra, chiamata su edit filtro di destra
  // PER IL MOMENTO NON UTILIZZATA
  resetFilterSx() {
      // this.verbaliListComponent.matDataSource.filter = ''; 
      // this.verbaliListComponent.filterValue = '';
      // this.verbaliListComponent.filterValues.filtrosx = ''; 
      // this.verbaliListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {

    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.tipoFilter.setValue('', {emitEvent:false});
    this.dtVerbaleFilter.setValue('', {emitEvent:false});
    this.classeFilter.setValue('', {emitEvent:false});
    this.titoloFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('');
    this.tipoFilter.setValue('');
    this.dtVerbaleFilter.setValue('');
    this.classeFilter.setValue('');
    this.titoloFilter.setValue('');

  }
}
