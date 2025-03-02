import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DOC_CertCompetenze } from 'src/app/_models/DOC_CertCompetenze';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class CertCompetenzeService {

  constructor(private http: HttpClient) { }

  listByIscrizione(iscrizioneID: number): Observable<DOC_CertCompetenze[]>{
    return this.http.get<DOC_CertCompetenze[]>(environment.apiBaseUrl+'DOC_CertCompetenze/ListByIscrizione/'+iscrizioneID);   
    //http://213.215.231.4/swappX/api/DOC_CertCompetenze/ListByIscrizione/285
  }

  listByAlunno(alunnoID: number): Observable<DOC_CertCompetenze[]>{
    return this.http.get<DOC_CertCompetenze[]>(environment.apiBaseUrl+'DOC_CertCompetenze/ListByAlunno/'+alunnoID);   
    //http://213.215.231.4/swappX/api/DOC_CertCompetenze/ListByAlunno/27
  }

  
  pubblica(certcompetenzeID: number): Observable <any>{
    const formData = <DOC_CertCompetenze>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_CertCompetenze/Pubblica/'+certcompetenzeID, formData);
    //http://213.215.231.4/swappX/api/DOC_CertCompetenze/Pubblica/5
  }

  completa(certcompetenzeID: number): Observable <any>{
    const formData = <DOC_CertCompetenze>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_CertCompetenze/Completa/'+certcompetenzeID, formData);
    //http://213.215.231.4/swappX/api/DOC_CertCompetenze/Completa/5
  }

  riapri(certcompetenzeID: number): Observable <any>{
    const formData = <DOC_CertCompetenze>{};
    return this.http.put( environment.apiBaseUrl  + 'DOC_CertCompetenze/Riapri/'+certcompetenzeID, formData);
    //http://213.215.231.4/swappX/api/DOC_CertCompetenze/Riapri/5
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'DOC_CertCompetenze/' + formData.id , formData);    
  }

  post(formData: any): Observable <DOC_CertCompetenze>{
    delete formData.id;
    return this.http.post<DOC_CertCompetenze>( environment.apiBaseUrl  + 'DOC_CertCompetenze' , formData);  
  }

  deleteByIscrizione(iscrizioneID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_Iscrizioni/' + iscrizioneID); 
  }
}
