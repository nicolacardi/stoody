import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, catchError, of, throwError } from 'rxjs';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IscrizioniService {

  constructor(private http: HttpClient) { }

  get(iscrizioneID: any): Observable<CLS_Iscrizione>{
    return this.http.get<CLS_Iscrizione>(environment.apiBaseUrl+'CLS_Iscrizioni/'+iscrizioneID);
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/328
  }

  listByClasseSezioneAnno(classeSezioneAnnoID: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByClasseSezioneAnno/'+classeSezioneAnnoID); 
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByClasseSezioneAnno/5
  }
  
  listByAnno(annoID: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByAnno/'+annoID); 
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByAnno/1
  }

  listByAlunno(alunnoID: number): Observable <CLS_Iscrizione[]> {
    //restituisce tutte le classiSezioniAnni di un certo Alunno
    return this.http.get<CLS_Iscrizione[]>( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByAlunno/' + alunnoID);  
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByAlunno/3
  }
 
  getByAlunnoAndClasseSezioneAnno(classeSezioneAnnoID: number, alunnoID: number): Observable <CLS_Iscrizione> {
    return this.http.get <CLS_Iscrizione>( environment.apiBaseUrl  + 'CLS_Iscrizioni/GetByAlunnoAndClasseSezioneAnno/'+alunnoID+'/'+classeSezioneAnnoID);  
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/GetByAlunnoAndClasseSezioneAnno/3/16
  }

  getByAlunnoAndAnno(annoID: number, alunnoID: number): Observable <CLS_Iscrizione> {
    return this.http.get <CLS_Iscrizione>( environment.apiBaseUrl  + 'CLS_Iscrizioni/GetByAlunnoAndAnno/'+alunnoID+'/'+annoID);  
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/GetByAlunnoAndAnno/3/2
  }

  post(formData: any): Observable <any>{

    formData.id = 0;
    formData.statoID = 1;
    //formData.dtIns= "01/01/2022";
    //console.log ("formData post Iscrizioni", formData);
    return this.http.post( environment.apiBaseUrl  + 'CLS_Iscrizioni' , formData);  
  }
  
  //bisogna passare alla post un formData
  //updateStato (id: number, codiceStato: number) {
  updateStato(formData: any): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CLS_Iscrizioni/UpdateStato?id='+formData.id+'&CodiceStato='+formData.codiceStato, formData);
  }
  //http://213.215.231.4/swappX/api/CLS_Iscrizioni/UpdateStato?id=5&CodiceStato=20

  deleteByAlunnoAndClasseSezioneAnno(classeSezioneAnnoID: number, alunnoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_Iscrizioni/DeleteByAlunnoAndClasseSezioneAnno/'+alunnoID+'/'+classeSezioneAnnoID)
    // .pipe(
    //   catchError((err: HttpErrorResponse) => {
    //     console.error("iscrizione.service - deletebyAlunnoandClasseSezioneAnno - ho ricevuto un errore", err.error, err.headers, err.message, err.name, err.ok, err.status);
    //     return throwError(() => new Error("cucu"));
    //     return of([]);
    //   })
    // )
  
    
    
    ;
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/DeleteByAlunnoAndClasseSezioneAnno/3/243
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/DeleteByAlunnoAndClasseSezioneAnno/49/16

  }


  // private handleError(error: HttpErrorResponse) {
  //   if (error.status === 0) {
  //     // A client-side or network error occurred. Handle it accordingly.
  //     console.error('An error occurred:', error.error);
  //   } else {
  //     // The backend returned an unsuccessful response code.
  //     // The response body may contain clues as to what went wrong.
  //     console.error(
  //       `Backend returned code ${error.status}, body was: `, error.error);
  //   }
  //   // Return an observable with a user-facing error message.
  //   return throwError(() => new Error('Something bad happened; please try again later.'));
  // }
  
  delete(iscrizioneID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_Iscrizioni/' + iscrizioneID); 
  }
      
}
