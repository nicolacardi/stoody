import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

//components
//import { AlunniFilterComponent } from '../alunni-filter/alunni-filter.component';
import { UsersListComponent } from '../users-list/users-list.component';

//services
import { NavigationService } from '../../utilities/navigation/navigation.service';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['../users.css']
})

export class UsersPageComponent implements OnInit {

//#region ----- ViewChild Input Output -------

  @ViewChild(UsersListComponent) usersList!: UsersListComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;

//#endregion
  
  constructor(private _navigationService:  NavigationService) { }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
    this._navigationService.passPage("usersPage");
  }
//#endregion
  
//#region ----- Add Edit Drop -------
  addRecord() {
    this.usersList.addRecord()
  }
//#endregion
  
//#region ----- Reset vari -------
  resetFiltri() {
    //this.usersFilterComponent.nomeFilter.setValue('');
    //this.usersFilterComponent.cognomeFilter.setValue('');
  }
//#endregion

//#region ----- Altri metodi -------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }
//#endregion
}
