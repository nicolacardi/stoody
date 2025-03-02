//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { RisorseCSAService }                    from 'src/app/_components/impostazioni/risorse-csa/risorse-csa.service';
import { TipiDocumentoService }                 from '../tipi-documento.service';

//models
import { DialogDataRisorsaClasseEdit }          from 'src/app/_models/DialogData';
import { CLS_RisorsaCSA }                       from 'src/app/_models/CLS_RisorsaCSA';
import { DOC_TipoDocumento }                    from 'src/app/_models/DOC_TipoDocumento';
import { MatTableDataSource } from '@angular/material/table';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService } from 'src/app/_components/classi/classi-sezioni-anni.service';
import { RisorsaCSAEditComponent } from '../risorsa-csa-edit/risorsa-csa-edit.component';


@Component({
  selector: 'app-risorse-csa-list-edit',
  templateUrl: './risorse-csa-list-edit.component.html',
  styleUrls: ['../risorse-csa.css']
})
export class RisorseCSAListEditComponent {

//#region ----- Variabili ----------------------

  matDataSource = new MatTableDataSource<CLS_RisorsaCSA>();
  
  obsRisorseCSA$!:                              Observable<CLS_RisorsaCSA[]>;
  classeSezioneAnno!:                           CLS_ClasseSezioneAnno;

  loading:                                      boolean = true;
  modules:                                      any = {};
  ckCheckBoxes=                                 false;
  filterValue = '';
  displayedColumns: string[] =  [
    "actionsColumn",
    "tipoDocumento",
    "fileName"
  ];
  //#endregion

  //#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<RisorseCSAListEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data:       CLS_ClasseSezioneAnno,
              private svcRisorseCSA:            RisorseCSAService,
              private svcClassiSezioniAnni:     ClassiSezioniAnniService,
              private _loadingService :         LoadingService,
              private fb:                       UntypedFormBuilder, 
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar ) { 
    
    _dialogRef.disableClose = true;

    this.svcClassiSezioniAnni.get(this.data.id).subscribe(res=> this.classeSezioneAnno = res);
        
  }

  //#endregion

  //#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }


  loadData () {
    if (this.data && this.data + '' != "0") {
      console.log (this.data);

      this.obsRisorseCSA$= this.svcRisorseCSA.listByCSA(this.data.id);  
      const loadParametri$ =this._loadingService.showLoaderUntilCompleted(this.obsRisorseCSA$);

      loadParametri$.subscribe(
        val =>   {
          console.log("risorse-classi-list - loadData", val);
          this.matDataSource.data = val;
          //this.matDataSource.paginator = this.paginator;
          //this.sortCustom();
          //this.matDataSource.sort = this.sort;
          //this.matDataSource.filterPredicate = this.filterPredicate();
          // this.maxSeq = val.reduce((max, item) => {
          //   return item.seq! > max ? item.seq! : max;
          // }, 0);
        }
      );
    }
  }

  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '460px',
      height: '350px',
      data:  { risorsaCSAID: id, classeSezioneAnnoID: this.classeSezioneAnno.id}
    };

    const dialogRef = this._dialog.open(RisorsaCSAEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());

  }

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '460px',
      height: '350px',
      data:  {risorsaCSAID: 0, classeSezioneAnnoID: this.classeSezioneAnno.id}
    };
    const dialogRef = this._dialog.open(RisorsaCSAEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  //#endregion

  //#region ----- Operazioni CRUD ----------------

  save(){
    
    
  }

  delete(){

  }

//#endregion

}
