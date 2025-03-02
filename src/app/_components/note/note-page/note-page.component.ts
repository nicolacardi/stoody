//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatDrawer }                            from '@angular/material/sidenav';

//components
import { NoteFilterComponent }                  from '../note-filter/note-filter.component';
import { NoteListComponent }                    from '../note-list/note-list.component';

//services
import { NavigationService }                    from '../../utilities/navigation/navigation.service';

//#endregion
@Component({
  selector: 'app-note-page',
  templateUrl: './note-page.component.html',
  styleUrls: ['../note.css']
})
export class NotePageComponent implements OnInit {
  
//#region ----- ViewChild Input Output ---------
  @ViewChild(NoteListComponent) noteList!: NoteListComponent; 
  @ViewChild(NoteFilterComponent) noteFilterComponent!: NoteFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;

  @Input('classeSezioneAnnoID') classeSezioneAnnoID!:         number;
  @Input('dove') dove! :                        string;
  @Input('docenteID') docenteID!:               number;

//#endregion

constructor(private _navigationService:  NavigationService) { }

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this._navigationService.passPage("notePage");
  }
//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord() {
    this.noteList.addRecord()
  }
//#endregion

//#region ----- Reset vari ---------------------
  resetFiltri() {
    this.noteFilterComponent.resetAllInputs();
  }
//#endregion

//#region ----- Altri metodi -------------------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }
//#endregion
}
