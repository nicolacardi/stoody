//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog }                            from '@angular/material/dialog';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { IscrizioniService }                    from '../iscrizioni.service';

//models
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { CLS_ClasseSezioneAnno }                from 'src/app/_models/CLS_ClasseSezioneAnno';

//#endregion
@Component({
  selector: 'app-iscrizioni-alunno-list',
  templateUrl: './iscrizioni-alunno-list.component.html',
  styleUrls: ['../iscrizioni.css']
})
export class IscrizioniAlunnoListComponent implements OnInit {

//#region ----- Variabili ---------------------

  matDataSource = new                           MatTableDataSource<CLS_Iscrizione>();

  displayedColumns:                             string[] = [
    "classe",
    "sezione",
    "annoscolastico",
    "stato",
    "removeFromAttended"
  ];
  showPageTitle = false;
  showTableRibbon = false;
//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;

  @Input('alunnoID') alunnoID! :                number;
  @Output('removeFromAttended') removeFromAttended = new EventEmitter<CLS_ClasseSezioneAnno>(); //EMESSO quando si clicca sul (-) del rimuovi da classi frequentate
//#endregion

  constructor(private svcIscrizioni:    IscrizioniService,
              public _dialog:           MatDialog, 
              private _loadingService:  LoadingService ) { 
              
  }

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit () {
    this.loadData();
  }

  updateList() {
    this.loadData();
  }

  loadData () {

    if(this.alunnoID == null ||this.alunnoID == undefined|| this.alunnoID == 0 ) return;
    
    let obsIscrizioni$: Observable<CLS_Iscrizione[]>;

    obsIscrizioni$= this.svcIscrizioni.listByAlunno(this.alunnoID);
    let loadIscrizioni$ =this._loadingService.showLoaderUntilCompleted(obsIscrizioni$);

    loadIscrizioni$.subscribe(
      val =>  {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;          
        //this.sortCustom();
        this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
  }
  
//#endregion

//#region ----- Add Edit Drop ------------------
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Emit per alunno-edit -----------
  removeFromAttendedEmit(item: any) {
    this.removeFromAttended.emit(item);
  }
//#endregion
}
