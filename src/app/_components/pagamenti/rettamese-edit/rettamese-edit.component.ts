//#region ----- IMPORTS ------------------------


//TODO ngOnChanges scatta un numero enorme di volte su hover della lista pagamenti
import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable }                           from 'rxjs';
import { MatDialog }                            from '@angular/material/dialog';

//components
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { RetteService }                         from '../rette.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { PAG_Retta }                            from 'src/app/_models/PAG_Retta';

//#endregion
@Component({
  selector: 'app-rettamese-edit',
  templateUrl: './rettamese-edit.component.html',
  styleUrls: ['../pagamenti.css'],
})

export class RettameseEditComponent implements OnInit{

//#region ----- Variabili ----------------------
  form! :                                       UntypedFormGroup;
  retta$!:                                      Observable<PAG_Retta>;
  
  emptyForm :                                   boolean = false;
//#endregion

//#region ----- ViewChild Input Output -------

  @Input() public rettaID!:                     number; 
  @Input() public quotaConcordata!:             number; 
  @Input() public quotaDefault!:                number; 
  @Input() public totPagamenti!:                number; 
  @Input() public mese!:                        number; 
  @Input() public indice!:                      number; //serve per poter azionare la save di ciascuna istanza di questo component
  //@Input() public toHighlight!: number; 

  @Output('mesePagamentoClicked')
  clickOnpagamentoEmitter = new EventEmitter<number>();
//#endregion

//#region ----- Constructor --------------------

  constructor(
    private fb:               UntypedFormBuilder,
    private svcRette:         RetteService,
    public _dialog:           MatDialog,
    private _loadingService:  LoadingService  
  ) { 

    this.form = this.fb.group({
      id:                     [null],
      annoID:                 [null],
      alunnoID:               [null],

      annoRetta:              [null],
      meseRetta:              [null],
      quotaDefault:           [null],
      quotaConcordata:        [null],
      totPagamenti:           [null],
    });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {

    if (this.rettaID && this.rettaID + '' != "0") {
      this.loadData();
    } else {
      this.emptyForm = true;
      this.form.reset(); 
    }
    //if (this.toHighlight == this.rettaID && this.toHighlight!= null) {this.evidenzia = true} else { this.evidenzia = false}
  }

  ngOnInit(): void {

  }
  
  loadData(){
    this.form.controls['quotaDefault'].setValue(this.quotaDefault);
    this.form.controls['quotaConcordata'].setValue(this.quotaConcordata);
    this.form.controls['totPagamenti'].setValue(this.totPagamenti);
  }

//#endregion

//#region ----- Operazioni CRUD ----------------
  save(): boolean{
    
    if (this.rettaID && this.form.dirty) {
        this.svcRette.put(this.form.value)        
          .subscribe({
            next: res=> {
            //return true;
            },
            error: err=>  {
            //return false;
            }
          });
    } else {
      //post
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Selezionare prima un Alunno"}
      });
      this.form.reset();
    }
    return true;
  }
//#endregion

//#region ----- Altri metodi -------
  ConvertToNumber (x: string): number {
    return parseInt(x);
  }

  clickOnPagamento() {
    this.clickOnpagamentoEmitter.emit(this.mese);
  }
//#endregion
}


