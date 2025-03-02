import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';

@Injectable({
  providedIn: 'root'
})

export class GenitoriService {

  constructor(private http: HttpClient) { }

  list(): Observable<ALU_Genitore[]>{
      return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori');
    //http://213.215.231.4/swappX/api/ALU_Alunni
  }

  listByAlunno(alunnoID: any): Observable<ALU_Genitore[]>{
      return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori/ListByAlunno/'+alunnoID);
      //http://213.215.231.4/swappX/api/ALU_Genitori/ListByAlunno/3
  }


  listWithChildren(): Observable<ALU_Genitore[]>{
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori/ListWithChildren');
    //http://213.215.231.4/swappX/api/ALU_Genitori/ListWithChildren
  }

  get(genitoreID: any): Observable<ALU_Genitore>{
    return this.http.get<ALU_Genitore>(environment.apiBaseUrl+'ALU_Genitori/'+genitoreID);
    //http://213.215.231.4/swappX/api/ALU_Genitori/3
  }

  getByPersona(personaID: any): Observable<ALU_Genitore>{  //TODO: WS da fare
    return this.http.get<ALU_Genitore>(environment.apiBaseUrl+'ALU_Genitori/getByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/ALU_Genitori/getByPersona/42
  }
  
  //per filtro e paginazione server side (NON USATO)
  findGenitori(filter = '', sortOrder= 'asc', pageNumber = 0, pageSize = 3): Observable<ALU_Genitore[]>{
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori', {
      params: new HttpParams()
                .set('filter', filter)
                .set('sortOrder', sortOrder)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
    });
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'ALU_Genitori/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;

    return this.http.post( environment.apiBaseUrl  + 'ALU_Genitori' , formData);  
  }

  delete(genitoreID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'ALU_Genitori/' + genitoreID);    
  }

  deleteByPersona (personaID: number) {
    return this.http.delete( environment.apiBaseUrl  + 'ALU_Genitori/DeleteByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/ALU_Genitori/DeletByPersona/3
  }

  filterGenitori(searchstring: string): Observable<ALU_Genitore[]>{
    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori')
        .pipe (
          map(val=>val.filter(val=>(val.persona.nome.toLowerCase() + ' ' + val.persona.cognome.toLowerCase()).includes(searchstring.toLowerCase()))),
      );
        } else {
      return of()
      }
  }

  findGenitoreID(searchstring: string) : Observable<any>{
    return this.http.get<ALU_Genitore[]>(environment.apiBaseUrl+'ALU_Genitori')
      .pipe(
        map(val => val.find(val => (val.persona.nome.toLowerCase() + ' ' + val.persona.cognome.toLowerCase())== searchstring.toLowerCase())),
      )
  }

}
