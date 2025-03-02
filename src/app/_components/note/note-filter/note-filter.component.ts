//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

//components
import { NoteListComponent } from '../note-list/note-list.component';

//#endregion
@Component({
  selector: 'app-note-filter',
  templateUrl: './note-filter.component.html',
  styleUrls: ['../note.css']
})
export class NoteFilterComponent implements OnInit {

//#region ----- Variabili ----------------------

  formClean= true;
  
  dtNotaFilter = new UntypedFormControl('');
  notaFilter = new UntypedFormControl('');
  quadrimestreFilter = new UntypedFormControl('');
  dtFirmaFilter = new UntypedFormControl('');
  docenteFilter = new UntypedFormControl('');
  alunnoFilter = new UntypedFormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() noteListComponent!: NoteListComponent;
//#endregion

constructor() {}

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.dtNotaFilter.valueChanges.subscribe(val => {this.applyFilterDx('dtNota', val);})
    this.notaFilter.valueChanges.subscribe(val => {this.applyFilterDx('nota', val);})
    this.quadrimestreFilter.valueChanges.subscribe(val => {this.applyFilterDx('periodo', val);})
    this.dtFirmaFilter.valueChanges.subscribe(val => {this.applyFilterDx('dtFirma', val);})
    this.docenteFilter.valueChanges.subscribe(val => {this.applyFilterDx('docente', val);})
    this.alunnoFilter.valueChanges.subscribe(val => {this.applyFilterDx('alunno', val);})
  }

  applyFilterDx(field: keyof typeof this.noteListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.noteListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.noteListComponent.matDataSource.filter = JSON.stringify(this.noteListComponent.filterValues);
    // this.noteListComponent.updateEmailAddresses();
    this.formClean = this.isFormClean();
  }

  isFormClean(): boolean {
    return (
      this.dtNotaFilter.value === '' &&
      this.notaFilter.value === '' &&
      this.quadrimestreFilter.value === '' &&
      this.dtFirmaFilter.value === '' &&
      this.docenteFilter.value === '' &&
      this.alunnoFilter.value === ''
    );
  }
//#endregion

//#region ----- Reset vari -------

  //AS: pulizia filtro di sinistra, chiamata su edit filtro di destra
  // PER IL MOMENTO NON UTILIZZATA
  resetFilterSx() {
      // this.noteListComponent.matDataSource.filter = ''; 
      // this.noteListComponent.filterValue = '';
      // this.noteListComponent.filterValues.filtrosx = ''; 
      // this.noteListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.dtNotaFilter.setValue('', {emitEvent:false});
    this.dtNotaFilter.setValue('', {emitEvent:false});
    this.notaFilter.setValue('', {emitEvent:false});
    this.quadrimestreFilter.setValue('', {emitEvent:false});
    this.dtFirmaFilter.setValue('', {emitEvent:false});
    this.docenteFilter.setValue('', {emitEvent:false});
    this.alunnoFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.dtNotaFilter.setValue('');
    this.notaFilter.setValue('');
    this.quadrimestreFilter.setValue('');
    this.dtFirmaFilter.setValue('');
    this.docenteFilter.setValue('');
    this.alunnoFilter.setValue('');
  }
//#endregion

}
