import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable, of }                       from 'rxjs';
import { catchError, map, tap }                 from 'rxjs/operators';
import { environment }                          from 'src/environments/environment';

import { FormatoData, Utility }                 from '../utilities/utility.component';

import { PER_Dirigente }                          from 'src/app/_models/PER_Dirigente';

@Injectable({
  providedIn: 'root'
})

export class DirigentiService {

  constructor(private http: HttpClient) {
  }

  list(swSoloAttivi: boolean = true): Observable<PER_Dirigente[]>{
    
    if(swSoloAttivi)
      return this.http.get<PER_Dirigente[]>(environment.apiBaseUrl+'PER_Dirigenti/ListAttivi' );
    else
      return this.http.get<PER_Dirigente[]>(environment.apiBaseUrl+'PER_Dirigenti');

    //http://213.215.231.4/swappX/api/PER_Dirigenti
    //http://213.215.231.4/swappX/api/PER_Dirigenti/ListAttivi
  }


  get(docenteID: any): Observable<PER_Dirigente>{
    return this.http.get<PER_Dirigente>(environment.apiBaseUrl+'PER_Dirigenti/'+docenteID);
    //http://213.215.231.4/swappX/api/PER_Dirigenti/3
  }

  getByPersona(personaID: any): Observable<PER_Dirigente>{

    return this.http.get<PER_Dirigente>(environment.apiBaseUrl+'PER_Dirigenti/GetByPersona/'+personaID)
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

    //http://213.215.231.4/swappX/api/PER_Dirigenti/GetByPersona/6
  }
 
  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_Dirigenti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_Dirigenti' , formData);  
  }

  delete(docenteID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_Dirigenti/' + docenteID);    
  }

  deleteByPersona (personaID: number) {
    return this.http.delete( environment.apiBaseUrl  + 'PER_Dirigenti/DeletByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/PER_Dirigenti/DeletByPersona/3
  }

}
