//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { combineLatest, tap }                   from 'rxjs';

//components
import { SceltaColonneComponent }               from './scelta-colonne/scelta-colonne.component';
import { SnackbarComponent }                    from '../snackbar/snackbar.component';

//services
import { ExcelService }                         from '../exceljs/exceljs.service';
import { JspdfService }                         from '../jspdf/jspdf.service';
import { TableColsVisibleService }              from './tablecolsvisible.service';
import { UserService }                          from 'src/app/_user/user.service';
import { TableColsService }                     from './tablecols.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { _UT_TableColVisible }                  from 'src/app/_models/_UT_TableColVisible';
import { _UT_TableCol }                         from 'src/app/_models/_UT_TableCol';

//#endregion
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',


})

export class ToolbarComponent implements OnInit{
//#region ----- Variabili --------------------

  rptColumnsNameArr !:                          [string[]]; //uno strano array di array di stringhe richiesto da jspdf
  currUser!:                             User;
  tableCols!:                                   _UT_TableCol[];
  tableColsVisible!:                            _UT_TableColVisible[];
//#endregion
//#region ----- ViewChild Input Output ---------

  @Input('tableName') tableName! :              string;
  @Input('rptTitle') rptTitle! :                string;
  @Input('rptFileName') rptFileName! :          string;
  @Input('rptFieldsToKeep') rptFieldsToKeep! :  string[];
  @Input('rptColumnsNames') rptColumnsNames! :  string[];
  @Input('rptData') rptData! :                  any;
  @Input('emailsYN') emailsYN! :                boolean;
  @Input('emailAddresses') emailAddresses! :    string;

  @Output('refreshColumns') refreshColumns = new EventEmitter<number>(); //annoId viene EMESSO quando si seleziona un anno dalla select


//columnsComponent serve per la scelta colonne: è di tipo any perchè potrebbe essere QUALSIASI ListComponent (AlunniList, GenitoriList ecc.)
  @Input('columnsComponent') columnsComponent! : any;     

//#endregion

  constructor(
    public _dialog:                             MatDialog,
    private _jspdf:                             JspdfService,
    private _xlsx:                              ExcelService,
    private svcTableColsVisible:                TableColsVisibleService,
    private svcTableCols:                       TableColsService,

    private svcUser:                            UserService,
    private _snackBar:                          MatSnackBar,

    ) { }

  ngOnInit() {
    this.svcUser.obscurrentUser.subscribe(val => {
      this.currUser = val;
    })
  }

  
  PDF() {
    // console.log ("toolbar.component : this.rptTitle", this.rptTitle);
    // console.log ("toolbar.component : this.rptFieldsToKeep", this.rptFieldsToKeep);
    // console.log ("toolbar.component : this.rptColumnsNames", this.rptColumnsNames);
    // console.log ("toolbar.component : this.rptData", this.rptData);
    //i columnsNames sono uno strano array con un array dentro... così vuole jspdf
    this.rptColumnsNameArr = [this.rptColumnsNames]; 
    this._jspdf.downloadPdf(this.rptData, this.rptColumnsNameArr, this.rptFieldsToKeep, this.rptTitle, this.rptFileName);    
  }

  XLS() {
    //NB: a differenza di PDF, XLS usa rptColumnsNames e non rptColumnsNamesArr
    this._xlsx.generateExcel(this.rptData, this.rptColumnsNames, this.rptFieldsToKeep, this.rptTitle, this.rptFileName );
  }

  email() {
    // console.log (this.emailAddresses);
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'indirizzi email copiati - incollarli in una nuova mail', panelClass: ['green-snackbar']});
  }

  scegliColonne() {

    let obsTableColsVisible$ = this.svcTableColsVisible.listByUserIDAndTable(this.currUser.userID, this.tableName)
    .pipe(tap(colonne => this.tableColsVisible = colonne));

    let obsTableCols$ = this.svcTableCols.listByTable(this.tableName)
    .pipe(tap(colonne =>this.tableCols = colonne));

    //devo attendere entrambi gli observable prima di aprire la dialog->uso combineLatest
    combineLatest ([obsTableColsVisible$, obsTableCols$])
    .subscribe( () => {
      let columns = [this.tableName, this.tableCols, this.tableColsVisible]
      const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '850px',
        height: '580px',
        data: columns
      };
      const dialogRef = this._dialog.open(SceltaColonneComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        //devo fare la reload del component: ci pensa chi mi ha chiamato captando la emit
        () => this.refreshColumns.emit()
      );
    })
  }

}
