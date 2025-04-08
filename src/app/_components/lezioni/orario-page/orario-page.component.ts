//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog }                            from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { LezioniCalendarioComponent }           from '../lezioni-calendario/lezioni-calendario.component';
import { ClassiSezioniAnniListComponent }       from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';

//services
import { DocenzeService }                       from '../../docenze/docenze.service';

//#endregion

@Component({
  selector: 'app-orario-page',
  templateUrl: './orario-page.component.html',
  styleUrls: ['./../lezioni.css']
})

export class OrarioPageComponent implements OnInit {

//#region ----- Variabili ----------------------

  public classeSezioneAnnoID!:  number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public annoID!:               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public docenteID!:            number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList?????

//#endregion

//#region ----- ViewChild Input Output -------
  //@ViewChild(AlunniListComponent) alunniListComponent!: AlunniListComponent; 
  @ViewChild(ClassiSezioniAnniListComponent) viewClassiSezioniAnni!: ClassiSezioniAnniListComponent; 
  @ViewChild('orarioLezioniDOM') viewOrarioLezioni!: LezioniCalendarioComponent; 

  //@Input () classeSezioneAnnoId!: number;
//#endregion

  constructor( public _dialog:                             MatDialog ) {
    
  }

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {

  }
//#endregion

//#region ----- ricezione emit -------
  annoIdEmitted(annoID: number) {
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    this.annoID = annoID;
  }

  classeSezioneAnnoIDEmitted(classeSezioneAnnoID: number) {
    this.classeSezioneAnnoID = classeSezioneAnnoID;
  }

  // docenteIdEmitted(docenteId: number) {
  //   this.docenteID = docenteId;
  // }
//#endregion

}