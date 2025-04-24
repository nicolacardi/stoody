//#region ----- IMPORTS ------------------------

import { CdkDragDrop, moveItemInArray }                                       from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild }      from '@angular/core';
import { MatDialog, MatDialogConfig }                                         from '@angular/material/dialog';
import { MatTableDataSource }                                                 from '@angular/material/table';
import { UntypedFormBuilder, UntypedFormGroup }                               from '@angular/forms';
import { Observable }                                                         from 'rxjs';
import { MatPaginator }                                                       from '@angular/material/paginator';
import { MatSort }                                                            from '@angular/material/sort';
import { MatSnackBar }                                                        from '@angular/material/snack-bar';

//components
import { DialogYesNoComponent }                                               from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { PagamentiFilterComponent }                                           from '../pagamenti-filter/pagamenti-filter.component';
import { SnackbarComponent }                                                  from '../../utilities/snackbar/snackbar.component';
import { Utility }                                                            from '../../utilities/utility.component';
import { PagamentoEditComponent }                                             from '../pagamento-edit/pagamento-edit.component';

//services
import { LoadingService }                                                     from '../../utilities/loading/loading.service';
import { AnniScolasticiService }                                              from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { PagamentiService }                                                   from '../pagamenti.service';
import { TableColsService }                                                   from '../../utilities/toolbar/tablecols.service';
import { TableColsVisibleService }                                            from '../../utilities/toolbar/tablecolsvisible.service';

//models
import { ASC_AnnoScolastico }                                                 from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_Pagamento }                                                      from 'src/app/_models/PAG_Pagamento';
import { _UT_Parametro }                                                      from 'src/app/_models/_UT_Parametro';
import { User }                                                               from 'src/app/_user/Users';


//#endregion
@Component({
  selector: 'app-pagamenti-list',
  templateUrl: './pagamenti-list.component.html',
  styleUrls: ['../pagamenti.css']
})

export class PagamentiListComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!             : User;
  matDataSource         = new MatTableDataSource<PAG_Pagamento>();
  pagamentoEmitter      = new EventEmitter<number>();

  obsAnni$!             : Observable<ASC_AnnoScolastico[]>;
  form                  : UntypedFormGroup;

  show                  : boolean = true;
 
  tableName             = "PagamentiList";
  displayedColumns      : string[] =  [];
  displayedColumnsList: string[] = [
    "actionsColumn", 
    "dtPagamento", 
    "importo", 
    "tipoPagamento.descrizione",
    "causale.descrizione",
    "retta.quotaConcordata",
    "retta.meseRetta",
    "alunno.cognome",
    "alunno.nome",
    //"genitoreID",
    "note"];

  // displayedColumnsListRettaEdit: string[] = [
  //   "dtPagamento", 
  //   "importo", 
  //   "tipoPagamento.descrizione",
  //   "causale.descrizione",
  //   "retta.meseRetta",
  //   "delete" ];


  rptTitle              = 'Lista pagamenti';
  rptFileName           = 'ListaPagamenti';

  rptFieldsToKeep  = [
    "dtPagamento", 
    "importo", 
    "tipoPagamento.descrizione",
    "causale.descrizione",
    "pagamentoRetta.retta.quotaConcordata",
    "pagamentoRetta.retta.meseRetta",
    "pagamentoRetta.retta.iscrizione.alunno.persona.cognome",
    "pagamentoRetta.retta.iscrizione.alunno.persona.nome"
  ];

  rptColumnsNames  = [
    "dtPagamento", 
    "importo", 
    "Tipo Pagamento",
    "Causale",
    "Quota Concordata",
    "Mese",
    "Cognome Alunno",
    "Nome Alunno",
    "note"];


  menuTopLeftPosition   = {x: '0', y: '0'}
  matMenuTrigger        : any;

  filterValue           = '';       //Filtro semplice

  filterValues = {
    tipoPagamento       : '',
    causale             : '',
    importoPiuDi        : '',
    importo             : '',
    importoMenoDi       : '',
    nome                : '',
    cognome             : '',
    dataDal             : '',
    dataAl              : '',
    filtrosx            : ''
  };

  public months         = [0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2).toLocaleString('it-IT', {month: 'short'}).toUpperCase());

//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatPaginator) paginator!        : MatPaginator;
  @ViewChild(MatSort) sort!                  : MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @Input() pagamentiFilterComponent!         : PagamentiFilterComponent;

  //@Output('hoverPagamento');

//#endregion

//#region ----- Constructor --------------------

  constructor(
    private fb                         : UntypedFormBuilder,
    private svcPagamenti               : PagamentiService,
    private svcAnni                    : AnniScolasticiService,
    public _dialog                     : MatDialog,
    private _snackBar                  : MatSnackBar,
    private _loadingService            : LoadingService,
    private svcTableCols               : TableColsService,
    private svcTableColsVisible        : TableColsVisibleService
  ) {
   
    let obj = sessionStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    })
    this.currUser = Utility.getCurrentUser();
  }

  //#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
    this.loadData();
  }

  ngOnInit(): void {
    this.show = true;
    this.loadLayout();
    this.loadData();
  }

  updateList() {
    this.loadData();
  }

  loadLayout(){
    this.svcTableColsVisible.listByUserIDAndTable(this.currUser.userID, this.tableName)
    .subscribe( colonne => {
        if (colonne.length != 0) this.displayedColumns = colonne.map(a => a.tableCol!.colName)
        else this.svcTableCols.listByTable(this.tableName).subscribe( colonne => {
          this.displayedColumns = colonne.filter(colonna=> colonna.defaultShown == true).map(a => a.colName)
        })        
    });
  }

  loadData () {

    this.obsAnni$= this.svcAnni.list();
    let obsPagamenti$: Observable<PAG_Pagamento[]>;
    obsPagamenti$= this.svcPagamenti.listByAnno(this.form.controls['selectAnnoScolastico'].value);
    
    const loadPagamenti$ =this._loadingService.showLoaderUntilCompleted(obsPagamenti$);

    loadPagamenti$.subscribe(
      val => {
        console.log("pagamenti-list loadData - val ", val);
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.sortCustom(); 
        this.matDataSource.sort = this.sort;
        this.matDataSource.filterPredicate = this.filterPredicate();

      }
    );
  }
//#endregion

//#region ----- Filtri & Sort ------------------

  applyFilter(event: Event) {

    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    //this.pagamentiFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {

    let filterFunction = function(data: any, filter: any): boolean {
    
      let searchTerms = JSON.parse(filter);

      let foundTipoPagamento = (String(data.tipoPagamentoID).indexOf(searchTerms.tipoPagamento) !== -1);
      if (searchTerms.tipoPagamento == null) foundTipoPagamento = true;
      
      let foundCausale = (String(data.causaleID).indexOf(searchTerms.causale) !== -1);
      if (searchTerms.causale == null) foundCausale = true; //true significa che deve ignorare il filtro: deve rispondere come se trovasse sempre il valore

      let cfrImportoPiuDi = true;
      let cfrImportoMenoDi = true;
      let cfrImporti = true;
      if (searchTerms.importo  == '') {
        if (searchTerms.importoPiuDi > data.importo) 
          cfrImportoPiuDi = false;
        if (searchTerms.importoMenoDi < data.importo && searchTerms.importoMenoDi != '') 
          cfrImportoMenoDi = false;
        cfrImporti = cfrImportoPiuDi && cfrImportoMenoDi;
      } else {
         cfrImporti = (data.importo == searchTerms.importo) 
      }

      let cfrDataDal = true;
      let cfrDataAl = true;
      let cfrDate = true;
      if (searchTerms.dataDal != '') {cfrDataDal = (data.dtPagamento > searchTerms.dataDal)}
      if (searchTerms.dataAl != '') {cfrDataAl = (data.dtPagamento < searchTerms.dataAl)}
      cfrDate = cfrDataDal && cfrDataAl;

      if ((searchTerms.dataDal == null || searchTerms.dataDal == '')&& (searchTerms.dataAl == null || searchTerms.dataAl == ''))cfrDate = true;

      let dArr = data.dtPagamento.split("-");
      const dtPagamentoddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];
      console.log (data);
      let boolSx = String(data.pagamentoRetta?.retta.iscrizione.alunno.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
            || String(dtPagamentoddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
            || String(data.importo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
            || String(data.pagamentoRetta?.retta.iscrizione.alunno.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

      let boolDx = foundTipoPagamento
            && foundCausale
            && cfrImporti 
            && String(data.pagamentoRetta?.retta.iscrizione.alunno.persona.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
            && String(data.pagamentoRetta?.retta.iscrizione.alunno.persona.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
            && cfrDate;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

  sortCustom() {

    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      console.log ("sortCustom", property, item);
      switch(property) {
        case 'tipoPagamento.descrizione':       return item.tipoPagamento.descrizione;
        case 'causale.descrizione':             return item.causale.descrizione;
        // case 'pagamentoRetta.retta.quotaConcordata':                            return item.pagamentoRetta.retta.quotaConcordata;
        // case 'pagamentoRetta.retta.iscrizione.alunno.persona.nome':             return item.pagamentoRetta.retta.iscrizione.alunno.persona.nome;
        //case 'pagamentoRetta.retta.iscrizione.alunno.persona.cognome':          return item.pagamentoRetta.retta.iscrizione.alunno.persona.cognome;
        case 'importo':                         return item.importo;
        case 'dtPagamento':                     return parseInt(item.dtPagamento.toString());
        default: return item[property]

      }
    };
  }

//#endregion

//#region ----- Add Edit Drop ------------------

  addRecord(){
    this.openDetail(0)
  }

  openDetail(pagamentoID: number){
    console.log ("pagamenti-list openDetail, id", pagamentoID);
    const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '875px',
        height: '350px',
        data:pagamentoID
    };
    const dialogRef = this._dialog.open(PagamentoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click --------------------

  onRightClick(event: MouseEvent, element: PAG_Pagamento) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion

//#region ----- Add Delete Edit Drop -----------
  delete(pagamentoID: number){

    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(
      result => {
        if(result){
          this.svcPagamenti.delete(Number(pagamentoID))
          .subscribe({
            next: res=> {
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this.loadData();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }
//#endregion

//#region ----- Altri metodi -------
  // hoverRow(id: number) {
  //   this.pagamentoEmitter.emit(id);
  // }

  // hoverLeave() {
  //   this.pagamentoEmitter.emit(0);
  // }
//#endregion

}
