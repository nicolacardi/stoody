//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit}              from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';

//components
import { GenitoriListComponent }                from '../genitori-list/genitori-list.component';

//#endregion
@Component({
  selector: 'app-genitori-filter',
  templateUrl: './genitori-filter.component.html',
  styleUrls: ['../genitori.css']
})

export class GenitoriFilterComponent implements OnInit {

//#region ----- Variabili ----------------------

  formClean= true;

  nomeFilter = new UntypedFormControl('');
  cognomeFilter = new UntypedFormControl('');
  dtNascitaFilter = new UntypedFormControl('');
  indirizzoFilter = new UntypedFormControl('');
  comuneFilter = new UntypedFormControl('');
  provFilter = new UntypedFormControl('');
  emailFilter = new UntypedFormControl('');
  telefonoFilter = new UntypedFormControl('');
  nomeCognomeAlunnoFilter = new UntypedFormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() genitoriListComponent!: GenitoriListComponent;
//#endregion

  constructor() {}

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.dtNascitaFilter.valueChanges.subscribe(val => {this.applyFilterDx('dtNascita', val);})
    this.indirizzoFilter.valueChanges.subscribe(val => {this.applyFilterDx('indirizzo', val);})
    this.comuneFilter.valueChanges.subscribe(val => {this.applyFilterDx('comune', val);})
    this.provFilter.valueChanges.subscribe(val => {this.applyFilterDx('prov', val);})
    this.emailFilter.valueChanges.subscribe(val => {this.applyFilterDx('email', val);})
    this.telefonoFilter.valueChanges.subscribe(val => {this.applyFilterDx('telefono', val);})
    this.nomeCognomeAlunnoFilter.valueChanges.subscribe(val => {this.applyFilterDx('nomeCognomeAlunno', val);})
  }

  applyFilterDx(field: keyof typeof this.genitoriListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.genitoriListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
    this.genitoriListComponent.getEmailAddresses();
    this.formClean = this.isFormClean();

  }

  isFormClean(): boolean {
    return (
      this.nomeFilter.value === '' &&
      this.cognomeFilter.value === '' &&
      this.dtNascitaFilter.value === '' &&
      this.indirizzoFilter.value === '' &&
      this.comuneFilter.value === '' &&
      this.provFilter.value === '' &&
      this.emailFilter.value === '' &&
      this.telefonoFilter.value === '' &&
      this.nomeCognomeAlunnoFilter.value === ''
    );
  }
//#endregion

//#region ----- Reset vari -------
  resetFilterSx() {
    //this.genitoriListComponent.matDataSource.filter = ''; 
    //this.genitoriListComponent.filterValue = ''; DA AGGIUNGERE PER EVITARE CHE LA CUSTOMPIPE highlight funzioni male ma prima va creata this.filtervalue nel component come negli altri
    //this.genitoriListComponent.filterValues.filtrosx = ''; 
    //this.genitoriListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.indirizzoFilter.setValue('', {emitEvent:false});
    this.dtNascitaFilter.setValue('', {emitEvent:false});
    this.comuneFilter.setValue('', {emitEvent:false});
    this.provFilter.setValue('', {emitEvent:false});
    this.emailFilter.setValue('', {emitEvent:false});
    this.telefonoFilter.setValue('', {emitEvent:false});
    this.nomeCognomeAlunnoFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('')
    this.indirizzoFilter.setValue('');
    this.dtNascitaFilter.setValue('');
    this.comuneFilter.setValue('');
    this.provFilter.setValue('');
    this.emailFilter.setValue('');
    this.telefonoFilter.setValue('');
    this.nomeCognomeAlunnoFilter.setValue('');
  }
//#endregion
}
