import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable, of }                       from 'rxjs';
import { catchError, map, tap }                 from 'rxjs/operators';
import { environment }                          from 'src/environments/environment';

import { FormatoData, Utility }                 from '../utilities/utility.component';

import { PER_NonDocente }                          from 'src/app/_models/PER_NonDocente';

@Injectable({
  providedIn: 'root'
})

export class NonDocentiService {

  constructor(private http: HttpClient) {
  }

  list(swSoloAttivi: boolean = true): Observable<PER_NonDocente[]>{
    
    if(swSoloAttivi)
      return this.http.get<PER_NonDocente[]>(environment.apiBaseUrl+'PER_NonDocenti/ListAttivi' );
    else
      return this.http.get<PER_NonDocente[]>(environment.apiBaseUrl+'PER_NonDocenti');

    //http://213.215.231.4/swappX/api/PER_NonDocenti
    //http://213.215.231.4/swappX/api/PER_NonDocenti/ListAttivi
  }

   get(docenteID: any): Observable<PER_NonDocente>{
    return this.http.get<PER_NonDocente>(environment.apiBaseUrl+'PER_NonDocenti/'+docenteID);
    //http://213.215.231.4/swappX/api/PER_NonDocenti/3
  }

  getByPersona(personaID: any): Observable<PER_NonDocente>{

    return this.http.get<PER_NonDocente>(environment.apiBaseUrl+'PER_NonDocenti/GetByPersona/'+personaID)
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

    //http://213.215.231.4/swappX/api/PER_NonDocenti/GetByPersona/6
  }
 
  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_NonDocenti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_NonDocenti' , formData);  
  }

  delete(docenteID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_NonDocenti/' + docenteID);    
  }

  // deleteByPersona (personaID: number) {
  //   return this.http.delete( environment.apiBaseUrl  + 'PER_NonDocenti/DeletByPersona/'+personaID);
  //   //http://213.215.231.4/swappX/api/PER_NonDocenti/DeletByPersona/3
  // }

}
