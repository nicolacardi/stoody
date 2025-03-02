//#region ----- IMPORTS ------------------------

import { Component, ViewChild }                 from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';

//components
import { RisorsaEditComponent }              from '../risorsa-edit/risorsa-edit.component';

//services
import { LoadingService }                       from 'src/app/_components/utilities/loading/loading.service';
import { RisorseService }                       from '../risorse.service';

//models
import { _UT_Risorsa }                             from 'src/app/_models/_UT_Risorsa';
import { SnackbarComponent } from 'src/app/_components/utilities/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogYesNoComponent } from 'src/app/_components/utilities/dialog-yes-no/dialog-yes-no.component';

//#endregion

@Component({
  selector: 'app-risorse-list',
  templateUrl: './risorse-list.component.html',
  styleUrls: ['../risorse.css']
})
export class RisorseListComponent {

//#region ----- Variabili ----------------------


  matDataSource = new MatTableDataSource<_UT_Risorsa>();
  obsRisorse$!:                             Observable<_UT_Risorsa[]>;
  
  displayedColumns: string[] = [
    "download",
    "delete",
    "edit", 
    "nomeFile",
    "descrizione",
    "tipoFile"
  ];

  rptTitle = 'Lista File';
  rptFileName = 'ListaFile';
  rptFieldsToKeep  = [
    "nomeFile",
  ];

  rptColumnsNames  = [
    "nomeFile",
  ];

  filterValue = '';       //Filtro semplice

  filterValues = {
    filtrosx: ''
  }


//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatSort) sort!:                    MatSort;

//#endregion

//#region ----- Constructor --------------------
constructor(private svcRisorse:                   RisorseService,
            private _loadingService:            LoadingService,
            public _dialog:                     MatDialog,
            private _snackBar:                  MatSnackBar,

            ) {}


//#endregion

//#region ----- LifeCycle Hooks e simili--------
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.obsRisorse$ = this.svcRisorse.list();  
    const loadRisorse$ =this._loadingService.showLoaderUntilCompleted(this.obsRisorse$);

    loadRisorse$.subscribe(
      val =>   {
        // console.log ("risorse-list - loadData - val", val);
        this.matDataSource.data = val;
        // this.sortCustom(); 
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate(); //usiamo questo per uniformità con gli altri component nei quali c'è anche il filtro di destra, così volendo lo aggiungiamo velocemente
      }
    );
  }
//#endregion
//#region ----- Add Edit Drop ------------------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '600px',
      height: '530px',
      data: { risorsaID:  0}
    };
    const dialogRef = this._dialog.open(RisorsaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe({
      next: res=>{
        this.loadData();
      }
    });
  }

  openDetail(id: any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '600px',
      height: '530px',
      data: { risorsaID:  id}
    };
    const dialogRef = this._dialog.open(RisorsaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe({
      next: res=>{
        this.loadData();
      }
    });
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

  delete (risorsaID: number) {

    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del file ?"}
    });

    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcRisorse.delete(risorsaID).subscribe({
          next: res=>{
            this._snackBar.openFromComponent(SnackbarComponent,{data: 'File cancellato', panelClass: ['red-snackbar']});
            this.svcRisorse.renumberSeq().subscribe();
            this.loadData();
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
        });
      }
    });
  }

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
      console.log ("this.filtervalues", this.filterValues);
      this.matDataSource.filter = JSON.stringify(this.filterValues)
    }

    filterPredicate(): (data: any, filter: string) => boolean {
      let filterFunction = function(data: any, filter: any): boolean {
        
        let searchTerms = JSON.parse(filter);
        let boolSx = String(data.nomeFile).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  || String(data.tipoFile).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
        return boolSx;
      }
      return filterFunction;
    }

    drop(event: any){
      // console.log ("risorse-list - drop - event.previousIndex, event.currentIndex",event.previousIndex, event.currentIndex);
      this.svcRisorse.updateSeq(event.previousIndex+1, event.currentIndex+1 )
      .subscribe(res=> this.loadData());
    }




//#endregion

}
