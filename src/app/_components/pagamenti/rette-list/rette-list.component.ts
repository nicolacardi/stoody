//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }               from '@angular/core';
import { MatDialog, MatDialogConfig }                 from '@angular/material/dialog';
import { MatPaginator }                               from '@angular/material/paginator';
import { MatSlideToggle }                             from '@angular/material/slide-toggle';
import { MatTableDataSource }                         from '@angular/material/table';
import { Observable }                                 from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup }       from '@angular/forms';
import { MatMenuTrigger }                             from '@angular/material/menu';

//components
import { RettaEditComponent }                         from '../retta-edit/retta-edit.component';
import { AlunnoEditComponent }                        from '../../alunni/alunno-edit/alunno-edit.component';
import { RettaCalcoloComponent }                      from '../retta-calcolo/retta-calcolo.component';

//services
import { RetteService }                               from '../rette.service';
import { LoadingService }                             from '../../utilities/loading/loading.service';
import { AnniScolasticiService }                      from 'src/app/_components/anni-scolastici/anni-scolastici.service';

//classes
import { PAG_Retta }                                  from 'src/app/_models/PAG_Retta';
import { PAG_RettaPivot }                             from 'src/app/_models/PAG_RettaPivot';
import { PAG_RettaGroupObj }                          from 'src/app/_models/PAG_RetteGroupObj';
import { ASC_AnnoScolastico }                         from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro }                              from 'src/app/_models/_UT_Parametro';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';

//#endregion
@Component({
  selector: 'app-rette-list',
  templateUrl: './rette-list.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RetteListComponent implements OnInit {
  
//#region ----- Variabili ----------------------
matDataSource = new MatTableDataSource<PAG_RettaPivot>();

  obsAnni$!:                Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  form:                     UntypedFormGroup;            //form fatto della sola combo anno scolastico
  annoID!:                  number;
  showC= true;
  showD= true;
  showP= true;
  showNum!: number;

  toggledNum!:  number;

  showLinesC = false;
  showLinesD = false;
  showLinesP = true;


  d_displayedColumns: string[] =  [

    "actionsColumn", 
    "nome",
    "cognome",
    "classe",
    "tipoRec_D",  
    "d_TOT",
    "d_SET",
    "d_OTT",
    "d_NOV",
    "d_DIC",
    "d_GEN",
    "d_FEB",
    "d_MAR",
    "d_APR",
    "d_MAG",
    "d_GIU",
    "d_LUG",
    "d_AGO",
  ];

  c_displayedColumns: string[] = [

    "blank",
    "blank2",
    "blank2",
    "blank2",
    "tipoRec_C",
    "c_TOT",
    "c_SET",
    "c_OTT",
    "c_NOV",
    "c_DIC",
    "c_GEN",
    "c_FEB",
    "c_MAR",
    "c_APR",
    "c_MAG",
    "c_GIU",
    "c_LUG",
    "c_AGO",
     ];
  
  p_displayedColumns: string[] = [

    "blank",
    "blank2",
    "blank2",
    "blank2",
    "tipoRec_P",
    "p_TOT",
    "p_SET",
    "p_OTT",
    "p_NOV",
    "p_DIC",
    "p_GEN",
    "p_FEB",
    "p_MAR",
    "p_APR",
    "p_MAG",
    "p_GIU",
    "p_LUG",
    "p_AGO",
    ];

  menuTopLeftPosition =  {x: '0', y: '0'} 

  displayedTitles = this.d_displayedColumns; //per poter cambiare matHeaderRowDef quando si usa l'occhietto in alto

  myObjAssigned : PAG_RettaGroupObj = {
    alunnoID: 0,
    _Rette: []
  };

  public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2).toLocaleString('it-IT', {month: 'short'}).toUpperCase());


  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
 filterValues = {
   filtrosx: ''
 };

//#endregion

//#region ----- ViewChild Input Output -------

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('toggleD') toggleD!: MatSlideToggle; 
  @ViewChild('toggleC') toggleC!: MatSlideToggle; 
  @ViewChild('toggleP') toggleP!: MatSlideToggle; 

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 


//#endregion

//#region ----- Constructor --------------------

  constructor(
              private svcRette:                 RetteService,
              private svcAnni:                  AnniScolasticiService,
              private _loadingService:          LoadingService,
              private fb:                       UntypedFormBuilder, 
              public _dialog:                   MatDialog) 
  {
    let obj = localStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue,
      filterControl: ['']
    })
  }
//#endregion

//#region ----- LifeCycle Hooks e simili-------


  ngOnInit() {
    this.loadData();
  }

  updateList() {
    this.loadData();
  }

  loadData () {


    this.obsAnni$ = this.svcAnni.list();
    this.annoID = this.form.controls['selectAnnoScolastico'].value;
    

    let obsRette$: Observable<PAG_RettaPivot[]>;
    obsRette$= this.svcRette.listByAnnoPivoted(this.annoID);
    const loadRette$ =this._loadingService.showLoaderUntilCompleted(obsRette$);

    loadRette$
      .subscribe(val => {
        // console.log("rette-list - loadData - val", val);
        this.matDataSource.data = val;
        this.matDataSource.filterPredicate = this.filterPredicate();
        this.matDataSource.paginator = this.paginator;
        }
      );

                        // NOTA PER PIU' AVANTI: 
                        // per avere la riga della retta e sotto la riga del pagamento forse è da usare const result$ = concat(series1$, series2$);


                        // let arrObj: PAG_RettaPivot[] = [];
                        // loadRette$
                        //   .pipe(
                        //   //questo tap serve nel caso in cui loadRette non restituisse ALCUN record in quanto in questo caso la mergeMap va in crisi: 
                        //   //lo stream Rxjs si blocca e non avviene nemmeno la subscribe quindi bisogna prevedere quel caso attivando qui ciò che dovrebbe avvenire nella subscribe.
                        //     tap(val=> { 
                        //       console.table(val); //qui vedo come si presenta all'inizio la chiamata...da che dati parto
                        //       if (val = []){
                        //         this.matDataSource.data = [];
                        //         this.matDataSource.paginator = this.paginator;
                        //       }
                        //     }),
                        //     mergeMap(res=>res),                     //passaggio necessario
                        //     groupBy(o => o.alunnoID),               //la group.key diventa l'alunnoID
                        //     mergeMap(
                        //       group => zip([group.key], group.pipe(toArray()))),
                        //     map(arr => {
                              
                        //       //console.log ("quotatrovata2",this.trovaquotaMeseA(arr, 9)) ;
                        //       //console.log ("quotaPagamenti",this.trovaSommaPagMese(arr, 9)) ;
                        //       //console.log ("arr",arr[1][0]) ; 
                        //       arrObj.push(
                        //         {
                        //         'alunnoID': arr[0],
                        //         alunno : arr[1][0].alunno!,
                        //         nome: arr[1][0].alunno!.persona.nome,
                        //         cognome: arr[1][0].alunno!.persona.cognome,
                        //         annoID : arr[1][0].annoID,
                        //         iscrizione : arr[1][0].iscrizione,
                        //         'c_SET': this.trovaQuotaConcMese(arr, 9) ,       //ERA: 'c_SET': arr[1][0].quotaConcordata,  MA COSI' SI CREAVANO I VUOTI
                        //         'c_OTT': this.trovaQuotaConcMese(arr, 10) ,  
                        //         'c_NOV': this.trovaQuotaConcMese(arr, 11) ,  
                        //         'c_DIC': this.trovaQuotaConcMese(arr, 12) ,  
                        //         'c_GEN': this.trovaQuotaConcMese(arr, 1) ,  
                        //         'c_FEB': this.trovaQuotaConcMese(arr, 2) ,  
                        //         'c_MAR': this.trovaQuotaConcMese(arr, 3) ,  
                        //         'c_APR': this.trovaQuotaConcMese(arr, 4) ,  
                        //         'c_MAG': this.trovaQuotaConcMese(arr, 5) ,  
                        //         'c_GIU': this.trovaQuotaConcMese(arr, 6) ,  
                        //         'c_LUG': this.trovaQuotaConcMese(arr, 7) ,  
                        //         'c_AGO': this.trovaQuotaConcMese(arr, 8) , 
                                
                        //         'c_TOT': this.sommaQuoteConc(arr),

                        //         // 'd_SET': this.trovaQuotaDefMese(arr, 9), 
                        //         // 'd_OTT': this.trovaQuotaDefMese(arr, 10),
                        //         // 'd_NOV': this.trovaQuotaDefMese(arr, 11),
                        //         // 'd_DIC': this.trovaQuotaDefMese(arr, 12),
                        //         // 'd_GEN': this.trovaQuotaDefMese(arr, 1),
                        //         // 'd_FEB': this.trovaQuotaDefMese(arr, 2),
                        //         // 'd_MAR': this.trovaQuotaDefMese(arr, 3),
                        //         // 'd_APR': this.trovaQuotaDefMese(arr, 4),
                        //         // 'd_MAG': this.trovaQuotaDefMese(arr, 5),
                        //         // 'd_GIU': this.trovaQuotaDefMese(arr, 6),
                        //         // 'd_LUG': this.trovaQuotaDefMese(arr, 7),
                        //         // 'd_AGO': this.trovaQuotaDefMese(arr, 8),

                        //         'd_TOT': this.sommaQuoteDef(arr),

                        //         'p_SET': this.trovaSommaPagMese(arr, 9), 
                        //         'p_OTT': this.trovaSommaPagMese(arr, 10),
                        //         'p_NOV': this.trovaSommaPagMese(arr, 11),
                        //         'p_DIC': this.trovaSommaPagMese(arr, 12),
                        //         'p_GEN': this.trovaSommaPagMese(arr, 1),
                        //         'p_FEB': this.trovaSommaPagMese(arr, 2),
                        //         'p_MAR': this.trovaSommaPagMese(arr, 3),
                        //         'p_APR': this.trovaSommaPagMese(arr, 4),
                        //         'p_MAG': this.trovaSommaPagMese(arr, 5),
                        //         'p_GIU': this.trovaSommaPagMese(arr, 6),
                        //         'p_LUG': this.trovaSommaPagMese(arr, 7),
                        //         'p_AGO': this.trovaSommaPagMese(arr, 8),

                        //         'p_TOT': this.sommaQuotePagAnno(arr),
                        //         }
                        //       );  //fine arrObj.push
                        //       return arrObj;
                        //     })    //fine map
                        // )         //fine mergeMap
                        // .subscribe(val => {
                        //   console.table(val); //passa di qua TROPPE VOLTE: tante quanti i record in realtà dovrebbe passarci UNA SOLA VOLTA!
                        //   this.matDataSource.data = val;
                        //   this.matDataSource.filterPredicate = this.filterPredicate();
                        //   this.matDataSource.paginator = this.paginator;
                        //   }
                        // );
  }

                        // trovaQuotaConcMese (arr: Array<any>, m: number) : number {
                        //   this.myObjAssigned.alunnoID =  arr[0];
                        //   this.myObjAssigned._Rette =  arr[1]; 
                        //     if (this.myObjAssigned._Rette.find(x=> x.meseRetta == m)?.quotaConcordata) {
                        //       //INTERESSANTE L'USO DEL '!' IN QUESTO CASO! dice: "sono sicuro che non sia undefined"
                        //       return this.myObjAssigned._Rette.find(x=> x.meseRetta == m)!.quotaConcordata  
                        //     } 
                        //     else 
                        //       return 0;
                        // }

                        // sommaQuoteConc (arr: Array<any>) : number {
                        //   this.myObjAssigned.alunnoID =  arr[0];
                        //   this.myObjAssigned._Rette =  arr[1]; 
                        //   let totQuotaConcordata = 0;
                        //   if (this.myObjAssigned._Rette.length != 0) 
                        //     this.myObjAssigned._Rette.forEach(mese=> totQuotaConcordata += mese.quotaConcordata) 
                          
                        //   return totQuotaConcordata;  
                        // }

                        // trovaQuotaDefMese (arr: Array<any>, m: number) : number {
                        //   this.myObjAssigned.alunnoID =  arr[0];
                        //   this.myObjAssigned._Rette =  arr[1]; 
                        //     if (this.myObjAssigned._Rette.find(x=> x.meseRetta == m)?.quotaDefault) 
                        //       return this.myObjAssigned._Rette.find(x=> x.meseRetta == m)!.quotaDefault
                        //     else 
                        //       return 0;
                        // }

                        // sommaQuoteDef (arr: Array<any>) : number {
                        //   this.myObjAssigned.alunnoID =  arr[0];
                        //   this.myObjAssigned._Rette =  arr[1]; 
                        //   let totQuotaDefault = 0;
                        //   if (this.myObjAssigned._Rette.length != 0) {
                        //     this.myObjAssigned._Rette.forEach(mese=> totQuotaDefault += mese.quotaDefault) 
                        //   }
                        //     //INTERESSANTE L'USO DEL '!' IN QUESTO CASO! dice: "sono sicuro che non sia undefined"
                        //   return totQuotaDefault;  
                        // }

                        // trovaSommaPagMese (arr: Array<any>, m: number) : number {
                        // //console.log (arr);
                        // let sumPags: number;
                        // this.myObjAssigned.alunnoID =  arr[0];
                        // this.myObjAssigned._Rette =  arr[1]; 
                        //   if (this.myObjAssigned._Rette.find(x=> x.meseRetta == m)?.pagamenti) {
                        //     sumPags = 0;
                        //     //IN QUESTO CASO ci sono ben DUE "!" uno per il find e uno per i pagamenti
                        //     this.myObjAssigned._Rette.find(x=> x.meseRetta == m)!.pagamenti!
                        //     .forEach (x=> sumPags = sumPags + x.importo) ;
                        //     return sumPags;
                        //   } 
                        //   else 
                        //     return 0;
                        // }



                        // sommaQuotePagAnno (arr: Array<any>) : number {
                        //   //console.log (arr);
                        //   let sumPags: number;
                        //   this.myObjAssigned.alunnoID =  arr[0];
                        //   this.myObjAssigned._Rette =  arr[1];
                        //   let sumPagsAnno = 0 ;
                        //   if (this.myObjAssigned._Rette.length != 0) {
                        //     this.myObjAssigned._Rette.forEach(mese => mese!.pagamenti!
                        //       .forEach (x=> sumPagsAnno = sumPagsAnno + x.importo)) ;
                        //   } 

                        //   return sumPagsAnno;
                        // }
//#endregion

//#region ----- Filtri & Sort -------


  applyFilter(filterValue: string) {
    //differisce da quelle degli altri component perchè questa riceve un filterValue e non un event: serve così perchè viene usata anche da rette-page
    this.filterValue = filterValue;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  // filterPredicateCustom(){
    //altro modo più complesso di creare filterpredicate Custom, per noi non standard
  // //questa funzione consente il filtro ANCHE sugli oggetti della classe
  // //è diversa (quindi + semplice) dal filterPredicate delle altre pagine in quanto non contempla i filtri di destra (qui assenti)
  // //e svolge, quindi, solo la funzione per il filtro di sinistra
  // //https://stackoverflow.com/questions/49833315/angular-material-2-datasource-filter-with-nested-object/49833467
  // this.matDataSource.filterPredicate = (data, filter: string)  => {
  //   const accumulator = (currentTerm: any, key: any) => { //Key è il campo in cui cerco
  //     //data è dove sto cercando
  //     console.log(data, key, currentTerm);
  //     switch(key) { 
  //       case "iscrizione": { 
  //         return currentTerm + data.iscrizione?.classeSezioneAnno.classeSezione.classe!.descrizioneBreve+" "+data.iscrizione?.classeSezioneAnno.classeSezione.sezione ; 
  //          break; 
  //       } 

  //       default: { 
  //       return currentTerm + data.nome + data.cognome;
  //          break; 
  //       } 
  //    } 
  //   };
  //   const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
  //   const transformedFilter = filter.trim().toLowerCase();
  //   return dataStr.indexOf(transformedFilter) !== -1;
  // };
  // }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      // console.log (data.iscrizione.classeSezioneAnno.classeSezione.classe.descrizioneBreve+ " "+ data.iscrizione.classeSezioneAnno.sezione, searchTerms.filtrosx);

      let boolSx = String(data.iscrizione.alunno.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.iscrizione.alunno.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || (String(data.iscrizione.classeSezioneAnno.classeSezione.classe.descrizioneBreve+ " "+ data.iscrizione.classeSezioneAnno.classeSezione.sezione).toLowerCase() == (searchTerms.filtrosx));
    

      return boolSx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Right Click -------
  onRightClick(event: MouseEvent, element: PAG_Retta) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  openAlunno(alunnoID: number){

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '900px',
      height: '700px',
      data: alunnoID
    };

    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => this.loadData() );
  }
//#endregion


  openDetail(iscrizione: CLS_Iscrizione ){
    console.log("rette.list - openDetail - iscrizione:", iscrizione);
    const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '850px',
        height: '324px',
        data: {
          iscrizione
        }
    };

    const dialogRef = this._dialog.open(RettaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  calcoloRette(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: {
        //alunnoID: alunno,
        annoID:  this.annoID  //questo in verità non viene poi usato
      }
    };

    const dialogRef = this._dialog.open(RettaCalcoloComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }
  
  public togD() {
    this.showD = !this.showD;
    this.tog();
  }

  public togC() {
    this.showC = !this.showC;
    this.tog();
  }

  public togP() {
    this.showP = !this.showP;
    this.tog();
  }

  public tog() {
    this.showNum = Number(this.showC) + Number(this.showD) + Number(this.showP);
    if (!this.showD) {
      if (!this.showC){
       this.c_displayedColumns[0] = "blank";
       this.c_displayedColumns[1] = "blank2";
       this.c_displayedColumns[2] = "blank2";
       this.c_displayedColumns[3] = "blank2";
       this.p_displayedColumns[0] = "actionsColumn";
       this.p_displayedColumns[1] = "nome";
       this.p_displayedColumns[2] = "cognome";
       this.p_displayedColumns[3] = "classe";  
       this.d_displayedColumns[0] = "blank";
       this.d_displayedColumns[1] = "blank2";
       this.d_displayedColumns[2] = "blank2";
       this.d_displayedColumns[3] = "blank2";
       this.displayedTitles = this.p_displayedColumns;
       
      } else {
       this.c_displayedColumns[0] = "actionsColumn";
       this.c_displayedColumns[1] = "nome";
       this.c_displayedColumns[2] = "cognome";
       this.c_displayedColumns[3] = "classe";
       this.p_displayedColumns[0] = "blank";
       this.p_displayedColumns[1] = "blank2";
       this.p_displayedColumns[2] = "blank2";
       this.p_displayedColumns[3] = "blank2";
       this.d_displayedColumns[0] = "blank";
       this.d_displayedColumns[1] = "blank2";
       this.d_displayedColumns[2] = "blank2";
       this.d_displayedColumns[3] = "blank2";
       this.displayedTitles = this.c_displayedColumns;

      }
    } else {
     this.c_displayedColumns[0] = "blank";
     this.c_displayedColumns[1] = "blank2";
     this.c_displayedColumns[2] = "blank2";
     this.c_displayedColumns[3] = "blank2";
     this.p_displayedColumns[0] = "blank";
     this.p_displayedColumns[1] = "blank2";
     this.p_displayedColumns[2] = "blank2";
     this.p_displayedColumns[3] = "blank2";
     this.d_displayedColumns[0] = "actionsColumn";
     this.d_displayedColumns[1] = "nome";
     this.d_displayedColumns[2] = "cognome";
     this.d_displayedColumns[3] = "classe";
     this.displayedTitles = this.d_displayedColumns;

    }

    if (!this.showP) {
      if (!this.showC) {
       this.showLinesD = true;
       this.showLinesC = false;
       this.showLinesP = false;
      } else {
       this.showLinesD = false;
       this.showLinesC = true;
       this.showLinesP = false;
      }
    } else {
     this.showLinesD = false;
     this.showLinesC = false;
     this.showLinesP = true;
    }


  }
//#endregion

}
