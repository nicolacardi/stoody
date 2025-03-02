//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

//components
import { IscrizioniListComponent } from '../iscrizioni-list/iscrizioni-list.component';

//#endregion
@Component({
  selector: 'app-iscrizioni-filter',
  templateUrl: './iscrizioni-filter.component.html',
  styleUrls: ['./../iscrizioni.css']
})
export class IscrizioniFilterComponent implements OnInit {

//#region ----- Variabili ----------------------
  formClean= true;

  nomeFilter =      new UntypedFormControl('');
  cognomeFilter =   new UntypedFormControl('');
  classeFilter =    new UntypedFormControl('');
  sezioneFilter =   new UntypedFormControl('');
  cfFilter =        new UntypedFormControl('');
  emailFilter =     new UntypedFormControl('');
  telefonoFilter =  new UntypedFormControl('');
  dtNascitaFilter = new UntypedFormControl('');
  indirizzoFilter = new UntypedFormControl('');
  comuneFilter =    new UntypedFormControl('');
  provFilter =      new UntypedFormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() iscrizioniListComponent!: IscrizioniListComponent;
//#endregion  
  constructor() { }

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit() {
    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.classeFilter.valueChanges.subscribe(val => {this.applyFilterDx('classe', val);})
    this.sezioneFilter.valueChanges.subscribe(val => {this.applyFilterDx('sezione', val);})
    this.cfFilter.valueChanges.subscribe(val => {this.applyFilterDx('cf', val);})
    this.emailFilter.valueChanges.subscribe(val => {this.applyFilterDx('email', val);})
    this.telefonoFilter.valueChanges.subscribe(val => {this.applyFilterDx('telefono', val);})
    this.dtNascitaFilter.valueChanges.subscribe(val => {this.applyFilterDx('dtNascita', val);})
    this.indirizzoFilter.valueChanges.subscribe(val => {this.applyFilterDx('indirizzo', val);})
    this.comuneFilter.valueChanges.subscribe(val => {this.applyFilterDx('comune', val);})
    this.provFilter.valueChanges.subscribe(val => {this.applyFilterDx('prov', val);})
  }

  applyFilterDx(field: keyof typeof this.iscrizioniListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.iscrizioniListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
    this.iscrizioniListComponent.getEmailAddresses();
    this.formClean = this.isFormClean();
  }

  isFormClean(): boolean {
    return (
      this.nomeFilter.value === '' &&
      this.cognomeFilter.value === '' &&
      this.classeFilter.value === '' &&
      this.sezioneFilter.value === '' &&
      this.cfFilter.value === '' &&
      this.emailFilter.value === '' &&
      this.telefonoFilter.value === '' &&
      this.dtNascitaFilter.value === '' &&
      this.indirizzoFilter.value === '' &&
      this.comuneFilter.value === '' &&
      this.provFilter.value === ''
    );
  }

//#endregion

//#region ----- Reset vari -------

  resetFilterSx() {
      //this.iscrizioniListComponent.matDataSource.filter = '';       
      //this.iscrizioniListComponent.filterValue = '';
      this.iscrizioniListComponent.filterValues.filtrosx = ''; 
      //this.iscrizioniListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.classeFilter.setValue('', {emitEvent:false});
    this.sezioneFilter.setValue('', {emitEvent:false});
    this.cfFilter.setValue('', {emitEvent:false});
    this.emailFilter.setValue('', {emitEvent:false});
    this.telefonoFilter.setValue('', {emitEvent:false});
    this.dtNascitaFilter.setValue('', {emitEvent:false});
    this.indirizzoFilter.setValue('', {emitEvent:false});
    this.comuneFilter.setValue('', {emitEvent:false});
    this.provFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('');
    this.classeFilter.setValue('');
    this.sezioneFilter.setValue('');
    this.cfFilter.setValue('');
    this.emailFilter.setValue('');
    this.telefonoFilter.setValue('');
    this.dtNascitaFilter.setValue('');
    this.indirizzoFilter.setValue('');
    this.comuneFilter.setValue('');
    this.provFilter.setValue('')
  }


//#endregion
}
