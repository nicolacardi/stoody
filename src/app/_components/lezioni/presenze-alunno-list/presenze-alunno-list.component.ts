//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';

//components


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PresenzeService }                      from '../presenze.service';

//models
import { CAL_Presenza }                         from 'src/app/_models/CAL_Presenza';

//#endregion

@Component({
  selector:     'app-presenze-alunno-list',
  templateUrl:  './presenze-alunno-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class PresenzeAlunnoListComponent implements OnInit {

//#region ----- Variabili ----------------------
matDataSource = new MatTableDataSource<CAL_Presenza>();
  
  displayedColumns: string[] = [
      "ckPresente",
      "dataLezione",
      "h_Ini", 
      "materia", 
      "docente"
  ];
//#endregion

//#region ----- ViewChild Input Output -------
  
  @ViewChild(MatSort) sort!:                    MatSort;
  @Input() alunnoID!:                          number;

//#endregion

  constructor( private svcPresenze:                        PresenzeService,
               private _loadingService:                    LoadingService ) { 
          
  }
  
//#region ----- LifeCycle Hooks e simili-------
  ngOnInit () {
    this.loadData();
  }

  loadData () {
    let obsPresenze$: Observable<CAL_Presenza[]>;

    if (this.alunnoID != undefined) {
      obsPresenze$= this.svcPresenze.listByAlunno(this.alunnoID);
      const loadPresenze$ =this._loadingService.showLoaderUntilCompleted(obsPresenze$);

      loadPresenze$.subscribe(
        res =>  {
          this.matDataSource.data = res;
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
        }
      );
    } 
  }
//#endregion

//#region ----- Altri metodi -------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'dataLezione':                     return item.lezione.dtCalendario;
        case 'materia':                         return item.lezione.materia.descrizione;
        default:                                return item[property]
      }
    };
  }

  changedCkPresente( checked: boolean, presenza: CAL_Presenza) {
    presenza.ckPresente = checked;
    this.svcPresenze.put(presenza).subscribe();
  }
  
//#endregion

}



