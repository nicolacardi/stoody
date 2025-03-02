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
  selector:     'app-presenze-list',
  templateUrl:  './presenze-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class PresenzeListComponent implements OnInit {

//#region ----- Variabili ----------------------
matDataSource = new MatTableDataSource<CAL_Presenza>();
  
  displayedColumns: string[] = [
      "ckPresente",
      "nome", 
      "cognome", 
  ];
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatSort) sort!:                    MatSort;
  @Input() lezioneID!:                          number;
//#endregion

  constructor(private svcPresenze:                        PresenzeService,
              private _loadingService:                    LoadingService ) { 

  }
  
//#region ----- LifeCycle Hooks e simili--------
  ngOnInit () {
    this.loadData();
  }

  loadData () {
    let obsPresenze$: Observable<CAL_Presenza[]>;

    if (this.lezioneID != undefined) {
      console.log ("parte la loadData di presenzeList");
      obsPresenze$= this.svcPresenze.listByLezione(this.lezioneID);
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
        case 'nome':                            return item.alunno.persona.nome;
        case 'cognome':                         return item.alunno.persona.cognome;
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



