import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DOC_ConsOrientativo } from 'src/app/_models/DOC_ConsOrientativo';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ConsOrientativiService {

  constructor(private http: HttpClient) { }

  listByIscrizione(consOrientativoID: number): Observable<DOC_ConsOrientativo[]>{
    return this.http.get<DOC_ConsOrientativo[]>(environment.apiBaseUrl+'DOC_ConsOrientativi/ListByIscrizione/'+consOrientativoID);   
    //http://213.215.231.4/swappX/api/DOC_ConsOrientativi/ListByIscrizione/285
  }

  listByAlunno(alunnoID: number): Observable<DOC_ConsOrientativo[]>{
    return this.http.get<DOC_ConsOrientativo[]>(environment.apiBaseUrl+'DOC_ConsOrientativi/ListByAlunno/'+alunnoID);   
    //http://213.215.231.4/swappX/api/DOC_ConsOrientativi/ListByAlunno/27
  }

  
  pubblica(consOrientativoID: number): Observable <any>{
    const formData = <DOC_ConsOrientativo>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_ConsOrientativi/Pubblica/'+consOrientativoID, formData);
    //http://213.215.231.4/swappX/api/DOC_ConsOrientativi/Pubblica/5
  }

  completa(consOrientativoID: number): Observable <any>{
    const formData = <DOC_ConsOrientativo>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_ConsOrientativi/Completa/'+consOrientativoID, formData);
    //http://213.215.231.4/swappX/api/DOC_ConsOrientativi/Completa/5
  }

  riapri(consOrientativoID: number): Observable <any>{
    const formData = <DOC_ConsOrientativo>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_ConsOrientativi/Riapri/'+consOrientativoID, formData);
    //http://213.215.231.4/swappX/api/DOC_ConsOrientativi/Riapri/5
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'DOC_ConsOrientativi/' + formData.id , formData);    
  }

  post(formData: any): Observable <DOC_ConsOrientativo>{
    delete formData.id;
    return this.http.post<DOC_ConsOrientativo>( environment.apiBaseUrl  + 'DOC_ConsOrientativi' , formData);  
  }
}
