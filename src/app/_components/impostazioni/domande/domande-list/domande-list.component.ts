//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { MatSort }                              from '@angular/material/sort';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { DomandaEditComponent }                from '../domanda-edit/domanda-edit.component';
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';


//services
import { DomandeService }                      from '../domande.service';
import { RisorseService }                       from '../../risorse/risorse.service';

//models
import { _UT_Domanda }                         from 'src/app/_models/_UT_Domanda';
//#endregion

@Component({
  selector: 'app-domande-list',
  templateUrl: './domande-list.component.html',
  styleUrls: ['../domande.css']
})
export class DomandeListComponent implements OnInit{

//#region ----- Variabili ----------------------

  maxSeq!:                                       number;
  matDataSource = new MatTableDataSource<_UT_Domanda>();
  obsDomande$!:                                Observable<_UT_Domanda[]>;
  
  displayedColumns: string[] = [

    "actionsColumn", 
    // "seq",
    "domanda", 
    "contesto",
    "tipo",
    "titolo",
    // "numOpzioni",
    "testo1",
    "testo2",
    "testo3",
    "testo4",
    "testo5",
    "testo6",
    "testo7",
    "testo8",
    "testo9",
    "risorsa"
  ];

  rptTitle = 'Lista Domande';
  rptFileName = 'ListaDomande';
  rptFieldsToKeep  = [
    "domanda",
  ];

  rptColumnsNames  = [
    "domanda",
  ];

  
  filterValue = '';       //Filtro semplice

  filterValues = {
    domanda: '',
    tipo: '',
    contesto: '',
    titolo: '',
    filtrosx: ''
  }

//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatSort) sort!:                    MatSort;
//#endregion

//#region ----- Constructor --------------------
  constructor(private svcDomande:              DomandeService,
              private svcRisorse:                 RisorseService,
              private _loadingService:          LoadingService,
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar
              ) {}
//#endregion

//#region ----- LifeCycle Hooks e simili--------
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.obsDomande$ = this.svcDomande.list();  
    const loadDomande$ =this._loadingService.showLoaderUntilCompleted(this.obsDomande$);

    loadDomande$.subscribe(
      val =>   {
        // console.log ("domande-list - loadData - estraggo domande list", val);
        this.matDataSource.data = val;
        this.sortCustom(); 
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate(); //usiamo questo per uniformità con gli altri component nei quali c'è anche il filtro di destra, così volendo lo aggiungiamo velocemente
        this.maxSeq = val.reduce((max, item) => {
          return item.seq! > max ? item.seq! : max;
        }, 0);
      }
    );
  }
//#endregion

//#region ----- Add Edit Drop ------------------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '650px',
      data: { domandaID:  0, maxSeq: this.maxSeq}
    };
    const dialogRef = this._dialog.open(DomandaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.svcDomande.renumberSeq().subscribe(() => this.loadData());
    });
  }

  openDetail(domandaID:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '650px',
      data: { domandaID: domandaID, maxSeq: this.maxSeq }
    };
    const dialogRef = this._dialog.open(DomandaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'domanda':                 return item.domanda;
        default: return item[property]
      }
    };
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      
      let searchTerms = JSON.parse(filter);
      let boolSx = String(data.domanda).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.contesto).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

            // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.domanda).toLowerCase().indexOf(searchTerms.domanda) !== -1
            && String(data.tipo).toLowerCase().indexOf(searchTerms.tipo) !== -1
            && String(data.titolo).toLowerCase().indexOf(searchTerms.titolo) !== -1
            && String(data.contesto).toLowerCase().indexOf(searchTerms.contesto) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

  drop(event: any){
    // console.log ("domande-list - drop - event.previousIndex, event.currentIndex",event.previousIndex, event.currentIndex);
    this.svcDomande.updateSeq(event.previousIndex+1, event.currentIndex+1 )
    .subscribe(res=> this.loadData());
  }

  download(risorsaID:number){
    if (risorsaID == null) return;

    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Richiesta download inviata...', panelClass: ['green-snackbar']});
    this.svcRisorse.get(risorsaID).subscribe(
      res=> {
        const pdfData = res.fileBase64.split(',')[1]; // estrae la stringa dalla virgola in avanti

        // const blob = new Blob([pdfData], { type: 'application/pdf' });
        // console.log("blob", blob);              
        // const pdfUrl = URL.createObjectURL(blob);
        // console.log("pdfUrl", pdfUrl);
        // window.open(pdfUrl, '_blank'); // Open in a new tab or window NON FUNZIONA

        const source = `data:application/${res.tipoFile};base64,${pdfData}`;
        const link = document.createElement("a");

        link.href = source;
        link.download = `${res.nomeFile}.${res.tipoFile}`
        link.click();

      }
    )

  }
//#endregion
}
