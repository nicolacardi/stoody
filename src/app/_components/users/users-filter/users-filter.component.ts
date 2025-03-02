import { Component, Input, OnInit} from '@angular/core';
import { UntypedFormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

//components
import { UsersListComponent } from '../users-list/users-list.component';
import { TipiPersonaService } from '../../persone/tipi-persona.service';

//services

//models
import { PER_TipoPersona } from 'src/app/_models/PER_Persone';

@Component({
  selector: 'app-users-filter',
  templateUrl: './users-filter.component.html',
  styleUrls: ['../users.css']
})

export class UsersFilterComponent implements OnInit {

//#region ----- Variabili ----------------------
  formClean= true;

  nomeFilter = new UntypedFormControl('');
  cognomeFilter = new UntypedFormControl('');
  emailFilter = new UntypedFormControl('');
  tipoPersonaFilter = new UntypedFormControl('');

  obsTipiPersona$!:            Observable<PER_TipoPersona[]>;
  
//#endregion
  
//#region ----- ViewChild Input Output -------  
  @Input() usersListComponent!: UsersListComponent;
//#endregion

  constructor( private svcTipiPersona: TipiPersonaService ) {

  }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit() {

    this.obsTipiPersona$ = this.svcTipiPersona.list();

    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.emailFilter.valueChanges.subscribe(val => {this.applyFilterDx('email', val);})
    //this.tipoPersonaFilter.valueChanges.subscribe(val => {this.applyFilterDx('tipoPersona', val);})

  }

  applyFilterDx(field: keyof typeof this.usersListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.usersListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.usersListComponent.matDataSource.filter = JSON.stringify(this.usersListComponent.filterValues);
    this.usersListComponent.getEmailAddresses();
    this.formClean = this.isFormClean();
  }

  isFormClean(): boolean {
    return (
      this.nomeFilter.value === '' &&
      this.cognomeFilter.value === '' &&
      this.emailFilter.value === ''
    );
  }
//#endregion

//#region ----- Reset vari -------
  resetFilterSx() {
      // this.usersListComponent.matDataSource.filter = ''; 
      // this.usersListComponent.filterValue = '';
      // this.usersListComponent.filterValues.filtrosx = ''; 
      // this.usersListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    //this.fullnameFilter.setValue('', {emitEvent:false});
    //this.emailFilter.setValue('', {emitEvent:false});
    //this.badgeFilter.setValue('', {emitEvent:false});

    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.emailFilter.setValue('', {emitEvent:false});
    this.tipoPersonaFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('');
    this.emailFilter.setValue('');
    this.tipoPersonaFilter.setValue('');
  }

//#endregion
}
