//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit}              from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';

//components
import { AlunniListComponent }                  from '../alunni-list/alunni-list.component';

//#endregion
@Component({
  selector: 'app-alunni-filter',
  templateUrl: './alunni-filter.component.html',
  styleUrls: ['../alunni.css'],
  standalone: false
})

export class AlunniFilterComponent implements OnInit {

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
  nomeCognomeGenitoreFilter = new UntypedFormControl('');
  
//#endregion
  
//#region ----- ViewChild Input Output ---------  
  @Input() alunniListComponent!: AlunniListComponent;
//#endregion

  constructor() {}

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.dtNascitaFilter.valueChanges.subscribe(val => {this.applyFilterDx('dtNascita', val);})
    this.indirizzoFilter.valueChanges.subscribe(val => {this.applyFilterDx('indirizzo', val);})
    this.comuneFilter.valueChanges.subscribe(val => {this.applyFilterDx('comune', val);})
    this.provFilter.valueChanges.subscribe(val => {this.applyFilterDx('prov', val);})
    this.emailFilter.valueChanges.subscribe(val => {this.applyFilterDx('email', val);})
    this.telefonoFilter.valueChanges.subscribe(val => {this.applyFilterDx('telefono', val);})
    this.nomeCognomeGenitoreFilter.valueChanges.subscribe(val => {this.applyFilterDx('nomeCognomeGenitore', val);})
  }

  applyFilterDx(field: keyof typeof this.alunniListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.alunniListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
    this.alunniListComponent.getEmailAddresses();
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
      this.nomeCognomeGenitoreFilter.value === ''
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
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.indirizzoFilter.setValue('', {emitEvent:false});
    this.dtNascitaFilter.setValue('', {emitEvent:false});
    this.comuneFilter.setValue('', {emitEvent:false});
    this.provFilter.setValue('', {emitEvent:false});
    this.emailFilter.setValue('', {emitEvent:false});
    this.telefonoFilter.setValue('', {emitEvent:false});
    this.nomeCognomeGenitoreFilter.setValue('', {emitEvent:false});
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
    this.nomeCognomeGenitoreFilter.setValue('');
  }

  //#endregion
}
