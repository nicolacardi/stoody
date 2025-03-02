//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';

//components


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { VotiCompitiService }                   from '../voti-compiti.service';

//models
import { TST_VotoCompito }                      from 'src/app/_models/TST_VotiCompiti';

//#endregion
@Component({
  selector:     'app-voti-compito-list',
  templateUrl:  './voti-compito-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class VotiCompitoListComponent implements OnInit {

//#region ----- Variabili ----------------------
  matDataSource = new MatTableDataSource<TST_VotoCompito>();
  
  displayedColumns: string[] = [ 
      "nome", 
      "cognome", 
      "voto",
      "giudizio"
  ];
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatSort) sort!:                    MatSort;
  @Input() lezioneID!:                          number;
//#endregion

  constructor(private svcVotiCompiti:                     VotiCompitiService,
              private _loadingService:                    LoadingService ) { 
  }
  
//#region ----- LifeCycle Hooks e simili--------
  ngOnInit () {
    this.loadData();
  }

  loadData () {
    let obsVoti$: Observable<TST_VotoCompito[]>;

    if (this.lezioneID != undefined) {
      obsVoti$= this.svcVotiCompiti.listByLezione(this.lezioneID);
      const loadVoti$ =this._loadingService.showLoaderUntilCompleted(obsVoti$);

      loadVoti$.subscribe(
        res =>  {
          //console.log ("res", res);
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

  changeVoto(element: TST_VotoCompito, voto: string ) {
    
    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    element.voto = votoN;

    this.svcVotiCompiti.put(element).subscribe();
  }

  changeGiudizio(element: TST_VotoCompito, giudizio: string) {
    
    element.giudizio = giudizio;
    this.svcVotiCompiti.put(element).subscribe();
  }

//#endregion

}



