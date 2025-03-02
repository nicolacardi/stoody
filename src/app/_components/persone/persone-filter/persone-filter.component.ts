//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit }             from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';
import { Observable }                           from 'rxjs';

//components
import { PersoneListComponent }                 from '../persone-list/persone-list.component';
import { TipiPersonaService }                   from '../tipi-persona.service';

//services

//models
import { PER_TipoPersona }                      from 'src/app/_models/PER_Persone';

//#endregion
@Component({
  selector: 'app-persone-filter',
  templateUrl: './persone-filter.component.html',
  styleUrls: ['../persone.css']
})

export class PersoneFilterComponent implements OnInit {

//#region ----- Variabili ----------------------
  formClean= true;

  nomeFilter = new UntypedFormControl('');
  cognomeFilter = new UntypedFormControl('');
  tipoPersonaFilter= new UntypedFormControl('');
  cfFilter = new UntypedFormControl('');
  annoNascitaFilter = new UntypedFormControl('');
  indirizzoFilter = new UntypedFormControl('');
  comuneFilter = new UntypedFormControl('');
  provFilter = new UntypedFormControl('');
  emailFilter = new UntypedFormControl('');
  telefonoFilter = new UntypedFormControl('');
  
  obsTipiPersona$!:            Observable<PER_TipoPersona[]>;

//#endregion

//#region ----- ViewChild Input Output ---------  
  @Input() personeListComponent!: PersoneListComponent;
//#endregion

  constructor( private svcTipiPersona: TipiPersonaService ) {}

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {

    this.obsTipiPersona$ = this.svcTipiPersona.list();

    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.tipoPersonaFilter.valueChanges.subscribe(val => {this.applyFilterDx('role', val);})
    this.annoNascitaFilter.valueChanges.subscribe(val => {this.applyFilterDx('annoNascita', val);})
    this.cfFilter.valueChanges.subscribe(val => {this.applyFilterDx('cf', val);})
    this.indirizzoFilter.valueChanges.subscribe(val => {this.applyFilterDx('indirizzo', val);})
    this.comuneFilter.valueChanges.subscribe(val => {this.applyFilterDx('comune', val);})
    this.provFilter.valueChanges.subscribe(val => {this.applyFilterDx('prov', val);})
    this.emailFilter.valueChanges.subscribe(val => {this.applyFilterDx('email', val);})
    this.telefonoFilter.valueChanges.subscribe(val => {this.applyFilterDx('telefono', val);})
  }

  applyFilterDx(field: keyof typeof this.personeListComponent.filterValues, val: string) {
    this.personeListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.personeListComponent.filterValues[field] = val;
    this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
    this.personeListComponent.getEmailAddresses();
    this.formClean = this.isFormClean();
  }

  isFormClean(): boolean {
    return (
      this.nomeFilter.value === '' &&
      this.cognomeFilter.value === '' &&
      (this.tipoPersonaFilter.value === '' || this.tipoPersonaFilter.value === null) &&
      this.annoNascitaFilter.value === '' &&
      this.cfFilter.value === '' &&
      this.indirizzoFilter.value === '' &&
      this.comuneFilter.value === '' &&
      this.provFilter.value === '' &&
      this.emailFilter.value === '' &&
      this.telefonoFilter.value === ''
    );
  }
//#endregion

//#region ----- Reset vari ---------------------
  resetFilterSx() {
      //this.personeListComponent.matDataSource.filter = ''; 
      //this.personeListComponent.filterValue = '';
      //this.personeListComponent.filterValues.filtrosx = ''; 
      //this.personeListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.tipoPersonaFilter.setValue('', {emitEvent:false});
    this.indirizzoFilter.setValue('', {emitEvent:false});
    this.annoNascitaFilter.setValue('', {emitEvent:false});
    this.cfFilter.setValue('', {emitEvent:false});
    this.comuneFilter.setValue('', {emitEvent:false});
    this.provFilter.setValue('', {emitEvent:false});
    this.emailFilter.setValue('', {emitEvent:false});
    this.telefonoFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('')
    this.tipoPersonaFilter.setValue('')
    this.indirizzoFilter.setValue('');
    this.annoNascitaFilter.setValue('');
    this.cfFilter.setValue('');
    this.comuneFilter.setValue('');
    this.provFilter.setValue('');
    this.emailFilter.setValue('');
    this.telefonoFilter.setValue('');
  }
//#endregion

}
