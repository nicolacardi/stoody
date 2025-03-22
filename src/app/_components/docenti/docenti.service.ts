import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable, of }                       from 'rxjs';
import { catchError, map, tap }                 from 'rxjs/operators';
import { environment }                          from 'src/environments/environment';

import { FormatoData, Utility }                 from '../utilities/utility.component';

import { PER_Docente }                          from 'src/app/_models/PER_Docente';

@Injectable({
  providedIn: 'root'
})

export class DocentiService {

  constructor(private http: HttpClient) {
  }

  list(swSoloAttivi: boolean = true): Observable<PER_Docente[]>{
    
    if(swSoloAttivi)
      return this.http.get<PER_Docente[]>(environment.apiBaseUrl+'PER_Docenti/ListAttivi' );
    else
      return this.http.get<PER_Docente[]>(environment.apiBaseUrl+'PER_Docenti');

    //http://213.215.231.4/swappX/api/PER_Docenti
    //http://213.215.231.4/swappX/api/PER_Docenti/ListAttivi
  }

  listSupplentiDisponibili(lezioneID: number, docenteID: number, dtCalendario: string, h_Ini: string, h_End: string) : Observable<PER_Docente[]>{
    return this.http.get<PER_Docente[]>(environment.apiBaseUrl+'PER_Docenti/ListSupplentiDisponibili/' + lezioneID + '/' + docenteID + '/' + Utility.formatDate(dtCalendario, FormatoData.yyyy_mm_dd) + '/' + Utility.URL_FormatHour(h_Ini) + '/' + Utility.URL_FormatHour( h_End));
    //http://213.215.231.4/SwappX/api/PER_Docenti/ListSupplentiDisponibili/160/3/2022-03-16/11%3A00%3A00/12%3A00%3A00
  }

  filterDocenti(searchstring: string): Observable<PER_Docente[]>{

    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<PER_Docente[]>(environment.apiBaseUrl+'PER_Docenti')
        .pipe ( 
          map( 
          val => val.filter(
            val=>(val.persona!.nome.toLowerCase() + ' ' + val.persona!.cognome.toLowerCase()).includes(searchstring.toLowerCase())
          )
        )
      );
    }
    else 
      return of();

    //Quando si fa clic su uno dei valori nella dropdown, searchstring non è più una stringa ma un object ( a causa forse di [value] = "element" in filtri.component.html),
    //quindi non si può più fare searchstring.toLowerCase(), istruzione che si è resa necessaria per cercare in maniera case insensitive
    //dunque, fino a una soluzione migliore, qui testiamo se searchstring sia un object (non una stringa) e in quel caso si restituisce un observable vuoto.
    // if (typeof searchstring === 'string') {
    //   return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni')
    //     .pipe (
    //       map(val=> val.filter(val=>(val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase()).includes(searchstring.toLowerCase()) )),
    //     );
    // } else {
    //   return of();
    // }
        //http://213.215.231.4/SwappX/api/PER_Docenti

  }

  get(docenteID: any): Observable<PER_Docente>{
    return this.http.get<PER_Docente>(environment.apiBaseUrl+'PER_Docenti/'+docenteID);
    //http://213.215.231.4/swappX/api/PER_Docenti/3
  }

  getByPersona(personaID: any): Observable<PER_Docente>{

    return this.http.get<PER_Docente>(environment.apiBaseUrl+'PER_Docenti/GetByPersona/'+personaID)
    .pipe(
      tap(() => {}   ),
        
        catchError((error) => {
          if (error.status === 404 || error == "Not Found") {
            return of(error);
          }
          else {
            //console.log("quando non trova (ad esempio con ID 17) la svcDocenti.getByPersona(ID) dovrebbe rispondere con 0 e non con un NotFound");
            throw error;
          }
      })
    );

    //return this.http.get<PER_Docente>(environment.apiBaseUrl+'PER_Docenti/GetByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/PER_Docenti/GetByPersona/6
  }

  /// AS: handler degli errori
  //TODO!!!!!!
/*
  private handleError(error: HttpErrorResponse) {

    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('ERRORE client-side:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error( `Il WS ritorna il codice ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Persona senza record Docente collegato'));
  }
  */
 
  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_Docenti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_Docenti' , formData);  
  }

  delete(docenteID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_Docenti/' + docenteID);    
  }

  deleteByPersona (personaID: number) {
    return this.http.delete( environment.apiBaseUrl  + 'PER_Docenti/DeletByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/PER_Docenti/DeletByPersona/3
  }

}
