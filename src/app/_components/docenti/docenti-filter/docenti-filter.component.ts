//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit }             from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';
import { Observable }                           from 'rxjs';

//components
import { DocentiListComponent }                    from '../docenti-list/docenti-list.component';

//services

//models
//import { PER_TipoSocio }                      from 'src/app/_models/PER_Soci';

//#endregion

@Component({
  selector: 'app-docenti-filter',
  templateUrl: './docenti-filter.component.html',
  styleUrl: '../docenti.css'
})

export class DocentiFilterComponent {


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
  ckAttivo = new UntypedFormControl('');

  //obsTipiSocio$!:            Observable<PER_TipoSocio[]>;

//#endregion

//#region ----- ViewChild Input Output ---------  
  @Input() docentiListComponent!: DocentiListComponent;
//#endregion

  constructor( ) {}

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {

    //this.obsTipiSocio$ = this.svcTipiSocio.list();
    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.dtNascitaFilter.valueChanges.subscribe(val => {this.applyFilterDx('dtNascita', val);})
    this.indirizzoFilter.valueChanges.subscribe(val => {this.applyFilterDx('indirizzo', val);})
    this.comuneFilter.valueChanges.subscribe(val => {this.applyFilterDx('comune', val);})
    this.provFilter.valueChanges.subscribe(val => {this.applyFilterDx('prov', val);})
    this.emailFilter.valueChanges.subscribe(val => {this.applyFilterDx('email', val);})
    this.telefonoFilter.valueChanges.subscribe(val => {this.applyFilterDx('telefono', val);})
    this.ckAttivo.valueChanges.subscribe(val => {this.applyFilterDx('ckAttivo', val);})

  }

  applyFilterDx(field: keyof typeof this.docentiListComponent.filterValues, val: string) {
    this.docentiListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.docentiListComponent.filterValues[field] = val;
    this.docentiListComponent.matDataSource.filter = JSON.stringify(this.docentiListComponent.filterValues);
    this.docentiListComponent.getEmailAddresses();
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
      this.telefonoFilter.value === ''
    );
  }
//#endregion

//#region ----- Reset vari ---------------------
  resetFilterSx() {
      //this.docentiListComponent.matDataSource.filter = ''; 
      //this.docentiListComponent.filterValue = '';
      //this.docentiListComponent.filterValues.filtrosx = ''; 
      //this.docentiListComponent.filterInput.nativeElement.value = '';
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


  }
//#endregion

}

