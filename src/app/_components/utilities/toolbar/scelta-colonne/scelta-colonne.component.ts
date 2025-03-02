//#region ----- IMPORTS ------------------------

import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit }            from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';

//services
import { UserService }                          from 'src/app/_user/user.service';
import { TableColsVisibleService }              from '../tablecolsvisible.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { _UT_TableCol }                         from 'src/app/_models/_UT_TableCol';
import { _UT_TableColTMP }                      from 'src/app/_models/_UT_TableColTMP';
import { _UT_TableColVisible }                  from 'src/app/_models/_UT_TableColVisible';

//#endregion
@Component({
  selector: 'app-scelta-colonne',
  templateUrl: './scelta-colonne.component.html',
  styleUrls: ['./scelta-colonne.component.css']
})
export class SceltaColonneComponent implements OnInit {

  lstHidden!:                                   _UT_TableColTMP[]; //la lista di sinistra
  lstVisible!:                                  _UT_TableColTMP[]; //la lista di destra
  lstDisabled!:                                 _UT_TableColTMP[]; //la lista di quelli inamovibili
  currUser!:                                    User;

  tableName!:                                   string;
  tableColsVisible!:                            _UT_TableColVisible[]; //la lista in arrivo da toolbar per le colonne di sinistra
  tableCols!:                                   _UT_TableCol[];     //la lista in arrivo da toolbar per le colonne di destra /disabled + non disabled


  constructor(
    public _dialogRef:                          MatDialogRef<SceltaColonneComponent>,
    private svcTableColsVisible:                TableColsVisibleService,

    @Inject(MAT_DIALOG_DATA)
    //dentro data arrivano le colonne da mostrare, in un array di tre elementi: [tableName, tableCols, tableColsVisible]
    public data:                                any, 
    private svcUser:                            UserService,
    ) 
    { 
      this.svcUser.obscurrentUser.subscribe(val => {
        this.currUser = val;
      })

    }

  ngOnInit(): void {


    //vado a MAPPARE le colonne visibili e quelle disponibili in lstHidden e lstVisible che sono di tipo_UT_tableColTMP

    this.tableName = this.data[0];
    this.tableCols = this.data[1];
    this.tableColsVisible = this.data[2];

    this.lstDisabled = [];
    this.lstHidden = [];
    this.lstVisible = [];

    this.tableCols.forEach (  //per ogni colonna di TUTTE le colonne (tableCols) queste vengono messe se disabiitate in lstDisabled e sennò in lstHidden
      colonna=> {
          let tableColTMP : _UT_TableColTMP = {
            colName:  colonna.colName,
            disabled: colonna.disabled,
            tableColID: colonna.id,
            ordCol: colonna.ordColDefault,
            defaultShown: colonna.defaultShown
          }
        if (colonna.disabled) {
          this.lstDisabled.push(tableColTMP);
        }else {
          this.lstHidden.push(tableColTMP);
        }
      }
    )
    
    //a questo punto le colonne sono divise tra lstDisabled e lstHidden
    //ora se non ci sono colonne visibili le metto tutte in lstVisible????
    if (this.data[2].length == 0){  
      //in lstVisible devo metterci tutte MENO quelle che hanno defaultShown = true
      this.lstVisible = this.lstHidden.filter(colonna=> colonna.defaultShown == true); //ecco il default: se non ci sono proprio record visibili allora ci metto quelle hidden
      //in lstHidden devo metterci tutte quelle che hanno defaultShown = false
      this.lstHidden = this.lstHidden.filter(colonna=> colonna.defaultShown == false);  //e resetto quelle hidden
    } else {
      //Se ce ne sono di visibili allora ci metto quelle
      this.tableColsVisible.forEach (
        colonna=> {
          let tableColTMP : _UT_TableColTMP = {
            colName:  colonna.tableCol!.colName,
            disabled: colonna.tableCol!.disabled,
            tableColID: colonna.tableCol!.id,
            ordCol: colonna.ordCol,
            defaultShown: colonna.tableCol!.defaultShown
          }
          if (!colonna.tableCol!.disabled) {
            this.lstVisible.push(tableColTMP);
          }      
        }
      )
    }

    //ora devo rimuovere da lstHidden quelli che già sono in lstVisible
    this.lstHidden  = this.lstHidden.filter(item1 => !this.lstVisible.some(item2 => item1.colName === item2.colName));
  }

  
  drop(event: CdkDragDrop<_UT_TableColTMP[]>) {

    //if(event.previousContainer.data.length <=1) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  save() {

    //cancello tutte le precedenti e le riposto una a una

    this.svcTableColsVisible.deleteByUserAndTable(this.currUser.userID, this.tableName).subscribe( res => {

      //salvo prima le disabled che devono sempre esserci
      let disabledItems : number = 0;
      for (let i = 0; i<this.lstDisabled.length; i++) {
        let tableColVisible : _UT_TableColVisible = {
          userID:                               this.currUser.userID,
          tableColID:                           this.lstDisabled[i].tableColID,
          ordCol:                               i +1,
        }
        disabledItems ++;
        //console.log ("scelta-colonne - salvataggio colonna disabled", tableColVisible);
        this.svcTableColsVisible.post(tableColVisible).subscribe();
      }      


      for (let j = 0; j<this.lstVisible.length; j++) {
        let tableColVisible : _UT_TableColVisible = {
          userID:                               this.currUser.userID,
          tableColID:                           this.lstVisible[j].tableColID,
          ordCol:                               j + disabledItems +1,
        }
        // console.log ("scelta-colonne - salvataggio colonna visibile", tableColVisible);

        this.svcTableColsVisible.post(tableColVisible).subscribe();
      }

      //la chiusura della dialog dovrebbe arrivare in maniera SINCRONA dopo i salvataggi essendo due cicli for e non forEach
      this._dialogRef.close(); //la chiusura scatenerà da parte della toolbar una emit che viene captata dalla page, che aggiorna il component
      
    })

  }

  default() {

    this.lstDisabled = [];
    this.lstHidden = [];
    this.lstVisible = [];

    this.tableCols.forEach (
      colonna=> {
          let tableColTMP : _UT_TableColTMP = {
            colName:  colonna.colName,
            disabled: colonna.disabled,
            tableColID: colonna.id,
            ordCol: colonna.ordColDefault,
            defaultShown: colonna.defaultShown
          }
        if (colonna.disabled) {
          this.lstDisabled.push(tableColTMP);
        }else {
          this.lstVisible.push(tableColTMP);
        }
      }
    )


    
  }
}
