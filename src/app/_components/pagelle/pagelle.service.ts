import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PagelleService {

  constructor(private http: HttpClient) { }

  listByIscrizione(iscrizioneID: number): Observable<DOC_Pagella[]>{
    return this.http.get<DOC_Pagella[]>(environment.apiBaseUrl+'DOC_Pagelle/ListByIscrizione/'+iscrizioneID);   
    //http://213.215.231.4/swappX/api/DOC_Pagelle/ListByIscrizione/285
  }

  listByAlunno(alunnoID: number): Observable<DOC_Pagella[]>{
    return this.http.get<DOC_Pagella[]>(environment.apiBaseUrl+'DOC_Pagelle/ListByAlunno/'+alunnoID);   
    //http://213.215.231.4/swappX/api/DOC_Pagelle/ListByAlunno/27
  }

  
  pubblica(pagellaID: number): Observable <any>{
    const formData = <DOC_Pagella>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_Pagelle/Pubblica/'+pagellaID, formData);
    //http://213.215.231.4/swappX/api/DOC_Pagelle/Pubblica/5
  }

  completa(pagellaID: number): Observable <any>{
    const formData = <DOC_Pagella>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_Pagelle/Completa/'+pagellaID, formData);
    //http://213.215.231.4/swappX/api/DOC_Pagelle/Completa/5
  }

  completaByAnno(annoID: number): Observable <any>{
    //completa tutte le pagelle di un certo annoID
    const formData = <DOC_Pagella>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_Pagelle/CompletaByAnno/'+annoID, formData);
    //http://213.215.231.4/swappX/api/DOC_Pagelle/CompletaByAnno/1
  }


  riapri(pagellaID: number): Observable <any>{
    const formData = <DOC_Pagella>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_Pagelle/Riapri/'+pagellaID, formData);
    //http://213.215.231.4/swappX/api/DOC_Pagelle/Riapri/5
  }


  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'DOC_Pagelle/' + formData.id , formData);    
  }

  post(formData: any): Observable <DOC_Pagella>{
    delete formData.id;
    return this.http.post<DOC_Pagella>( environment.apiBaseUrl  + 'DOC_Pagelle' , formData);  
  }
}
