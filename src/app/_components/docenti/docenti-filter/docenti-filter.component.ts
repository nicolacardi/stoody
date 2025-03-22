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
  tipoSocioFilter= new UntypedFormControl('');
  dataRichiestaDal = new UntypedFormControl('');
  dataRichiestaAl = new UntypedFormControl('');
  dataAccettazioneDal = new UntypedFormControl('');
  dataAccettazioneAl = new UntypedFormControl('');
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
    this.tipoSocioFilter.valueChanges.subscribe(val => {this.applyFilterDx('tipoSocioID', val);})
    this.dataRichiestaDal.valueChanges.subscribe(val => {this.applyFilterDx('dataRichiestaDal', val);})
    this.dataRichiestaAl.valueChanges.subscribe(val => {this.applyFilterDx('dataRichiestaAl', val);})
    this.dataAccettazioneDal.valueChanges.subscribe(val => {this.applyFilterDx('dataAccettazioneDal', val);})
    this.dataAccettazioneAl.valueChanges.subscribe(val => {this.applyFilterDx('dataAccettazioneAl', val);})
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
      (this.tipoSocioFilter.value === null || this.tipoSocioFilter.value === '') &&
      (this.dataRichiestaDal.value === null  || this.dataRichiestaDal.value === '') &&
      (this.dataRichiestaAl.value === null || this.dataRichiestaAl.value === '') &&
      (this.dataAccettazioneDal.value === null || this.dataAccettazioneDal.value === '') &&
      (this.dataAccettazioneAl.value === null || this.dataAccettazioneAl.value === '') &&
      !this.ckAttivo.value
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
    this.tipoSocioFilter.setValue('', {emitEvent:false});
    this.dataRichiestaDal.setValue('', {emitEvent:false});
    this.dataRichiestaAl.setValue('', {emitEvent:false});
    this.dataAccettazioneDal.setValue('', {emitEvent:false});
    this.dataAccettazioneAl.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('')
    this.tipoSocioFilter.setValue('')
    this.dataRichiestaDal.setValue('');
    this.dataRichiestaAl.setValue('');
    this.dataAccettazioneDal.setValue('');
    this.dataAccettazioneAl.setValue('');

  }
//#endregion

}

