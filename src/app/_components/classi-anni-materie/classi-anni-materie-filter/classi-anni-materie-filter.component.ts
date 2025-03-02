import { Component, Input}                      from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';

//components
import { ClassiAnniMaterieListComponent }       from '../classi-anni-materie-list/classi-anni-materie-list.component';

@Component({
  selector: 'app-classi-anni-materie-filter',
  templateUrl: './classi-anni-materie-filter.component.html',
  styleUrls: ['../classi-anni-materie.css']
})
export class ClassiAnniMaterieFilterComponent {



    //#region ----- Variabili ----------------------
      formClean= true;
    
      classeFilter = new UntypedFormControl('');
      materiaFilter = new UntypedFormControl('');
      tipoVotoFilter = new UntypedFormControl('');
    
    //#endregion
    
    //#region ----- ViewChild Input Output -------  
      @Input() classiannimaterieListComponent!: ClassiAnniMaterieListComponent;
      //#endregion
    
      constructor() {
    
      }
    
      //#region ----- LifeCycle Hooks e simili-------
    
      ngOnInit() {
        this.classeFilter.valueChanges.subscribe(val => {this.applyFilterDx('classe', val);})
        this.materiaFilter.valueChanges.subscribe(val => {this.applyFilterDx('materia', val);})
        this.tipoVotoFilter.valueChanges.subscribe(val => {this.applyFilterDx('tipoVoto', val);})
    
      }
    
      applyFilterDx(field: keyof typeof this.classiannimaterieListComponent.filterValues, val: string) {
        //this.resetFilterSx();
        this.classiannimaterieListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
        this.classiannimaterieListComponent.matDataSource.filter = JSON.stringify(this.classiannimaterieListComponent.filterValues);
        this.formClean = this.isFormClean();
      }
      
      isFormClean(): boolean {
        return (
          this.classeFilter.value === '' &&
          this.materiaFilter.value === '' &&
          this.tipoVotoFilter.value === ''
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
    
        this.classeFilter.setValue('', {emitEvent:false});
        this.materiaFilter.setValue('', {emitEvent:false});
        this.tipoVotoFilter.setValue('', {emitEvent:false});
      }
    
      resetAllInputsAndClearFilters() {
        
        this.classeFilter.setValue('');
        this.materiaFilter.setValue('');
        this.tipoVotoFilter.setValue('');
      }
}
