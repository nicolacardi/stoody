//#region ----- IMPORTS ------------------------

import { Component, OnInit }                    from '@angular/core';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';

//components
import { SnackbarComponent }                    from '../utilities/snackbar/snackbar.component';
import { Utility }                              from '../utilities/utility.component';

//services
import { LoadingService }                       from '../utilities/loading/loading.service';
import { MessaggiService }                      from './messaggi.service';

//models
import { _UT_Message }                          from 'src/app/_models/_UT_Message';
import { User }                                 from 'src/app/_user/Users';
import { MatSnackBar }                          from '@angular/material/snack-bar';


//#endregion
@Component({
  selector: 'app-messaggi',
  templateUrl: './messaggi.component.html',
  styleUrls: ['./messaggi.component.css']
})

export class MessaggiComponent implements OnInit {

//#region ----- Variabili ----------------------

  public currUser!: User;

  matDataSource = new MatTableDataSource<_UT_Message>();
  displayedColumns: string[] = [
    "message",
    "actionsColumn",
    "delete"
  ];

//#endregion

//#region ----- Constructor --------------------

  constructor( private svcMessages:      MessaggiService,  
               private _loadingService:  LoadingService,
               private _snackBar:        MatSnackBar ) {

    this.currUser = Utility.getCurrentUser();    
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(){
    this.loadData();
  }

  loadData(){
    let obsNews$: Observable<_UT_Message[]>;
    obsNews$ = this.svcMessages.listByUserID(this.currUser.userID);

    const loadNews$ =this._loadingService.showLoaderUntilCompleted(obsNews$);
    loadNews$.subscribe(val => this.matDataSource.data = val);
  }
//#endregion

//#region ----- Altri metodi -------------------

  closeMsg(element: _UT_Message) {

    element.closed = !element.closed;

    this.svcMessages.put(element).subscribe({
      next: res=> this.loadData(),
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura  del messaggio ', panelClass: ['red-snackbar']})
    });
  }

  deleteMsg(id: number) {

    this.svcMessages.delete(id).subscribe({
      next: res=> this.loadData(),
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella cancellazione  del messaggio ', panelClass: ['red-snackbar']})
    });
  }
//#endregion
}
