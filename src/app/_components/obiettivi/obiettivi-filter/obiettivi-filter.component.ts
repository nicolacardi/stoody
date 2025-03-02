//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit }             from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';

//components
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { ObiettiviListComponent }               from 'src/app/_components/obiettivi/obiettivi-list/obiettivi-list.component';

//services
import { ClassiService }                        from 'src/app/_components/classi/classi.service';
import { MaterieService }                       from 'src/app/_components/materie/materie.service';

//classes
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Classe }                           from 'src/app/_models/CLS_Classe';
import { MAT_Materia }                          from 'src/app/_models/MAT_Materia';
import { Observable }                           from 'rxjs';

//#endregion

@Component({
  selector: 'app-obiettivi-filter',
  templateUrl: './obiettivi-filter.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettiviFilterComponent implements OnInit {

//#region ----- Variabili ----------------------
  formClean= true;

  obsClassi$!:                Observable<CLS_Classe[]>;
  obsAnni$!:                  Observable<ASC_AnnoScolastico[]>;
  obsMaterie$!:               Observable<MAT_Materia[]>;

  classeFilter = new UntypedFormControl('');
  // annoFilter = new UntypedFormControl('');
  materiaFilter = new UntypedFormControl('');
  tipoVotoFilter = new UntypedFormControl('');
  descrizione = new UntypedFormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() obiettiviListComponent!: ObiettiviListComponent;
//#endregion

//#region ----- Constructor --------------------
  constructor(private svcClassi:                      ClassiService,
              private svcAnni:                        AnniScolasticiService,
              private svcMaterie:                     MaterieService ) { 
        
  }
//#endregion
  
//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(){

    this.obsClassi$ = this.svcClassi.list();
    this.obsAnni$= this.svcAnni.list();
    this.obsMaterie$ = this.svcMaterie.list();

    this.classeFilter.valueChanges.subscribe(val => {this.applyFilterDx('classeID', val);})
    this.materiaFilter.valueChanges.subscribe(val => {this.applyFilterDx('materiaID', val);})
    this.descrizione.valueChanges.subscribe(val => {this.applyFilterDx('descrizione', val);})

    // this.annoFilter.valueChanges.subscribe(val => {this.applyFilterDx('annoID', val);})
  }

  applyFilterDx(field: keyof typeof this.obiettiviListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.obiettiviListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.obiettiviListComponent.matDataSource.filter = JSON.stringify(this.obiettiviListComponent.filterValues);
    this.formClean = this.isFormClean();
  }

  isFormClean(): boolean {
    return (
      this.classeFilter.value === '' &&
      this.materiaFilter.value === '' &&
      this.descrizione.value === ''
      // this.annoFilter.value === ''
    );
  }
//#endregion

//#region ----- Reset vari ---------------------
  resetAllInputs() {
    this.classeFilter.setValue('', {emitEvent:false});
    // this.annoFilter.setValue('', {emitEvent:false});
    this.materiaFilter.setValue('', {emitEvent:false});
    this.descrizione.setValue('', {emitEvent:false});
    this.tipoVotoFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.classeFilter.setValue('');
    // this.annoFilter.setValue('')
    this.materiaFilter.setValue('');
    this.descrizione.setValue('');
    this.tipoVotoFilter.setValue('');
  }
//#endregion
}
