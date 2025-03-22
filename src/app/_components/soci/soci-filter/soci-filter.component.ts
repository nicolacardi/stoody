//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit }             from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';
import { Observable }                           from 'rxjs';

//components
import { SociListComponent }                    from '../soci-list/soci-list.component';
import { TipiSocioService }                     from '../tipi-socio.service';

//services

//models
import { PER_TipoSocio }                      from 'src/app/_models/PER_Soci';

//#endregion

@Component({
  selector: 'app-soci-filter',
  templateUrl: './soci-filter.component.html',
  styleUrls: ['../soci.css']
})

export class SociFilterComponent implements OnInit {

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

  obsTipiSocio$!:            Observable<PER_TipoSocio[]>;

//#endregion

//#region ----- ViewChild Input Output ---------  
  @Input() sociListComponent!: SociListComponent;
//#endregion

  constructor( private svcTipiSocio: TipiSocioService ) {}

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {

    this.obsTipiSocio$ = this.svcTipiSocio.list();
    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.tipoSocioFilter.valueChanges.subscribe(val => {this.applyFilterDx('tipoSocioID', val);})
    this.dataRichiestaDal.valueChanges.subscribe(val => {this.applyFilterDx('dataRichiestaDal', val);})
    this.dataRichiestaAl.valueChanges.subscribe(val => {this.applyFilterDx('dataRichiestaAl', val);})
    this.dataAccettazioneDal.valueChanges.subscribe(val => {this.applyFilterDx('dataAccettazioneDal', val);})
    this.dataAccettazioneAl.valueChanges.subscribe(val => {this.applyFilterDx('dataAccettazioneAl', val);})
    this.ckAttivo.valueChanges.subscribe(val => {this.applyFilterDx('ckAttivo', val);})

  }

  applyFilterDx(field: keyof typeof this.sociListComponent.filterValues, val: string) {
    this.sociListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.sociListComponent.filterValues[field] = val;
    this.sociListComponent.matDataSource.filter = JSON.stringify(this.sociListComponent.filterValues);
    this.sociListComponent.getEmailAddresses();
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
      //this.sociListComponent.matDataSource.filter = ''; 
      //this.sociListComponent.filterValue = '';
      //this.sociListComponent.filterValues.filtrosx = ''; 
      //this.sociListComponent.filterInput.nativeElement.value = '';
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

