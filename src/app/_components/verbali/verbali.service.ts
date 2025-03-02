import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DOC_TipoVerbale, DOC_Verbale, DOC_VerbalePresente } from 'src/app/_models/DOC_Verbale';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VerbaliService {

  constructor(private http: HttpClient) { }

  list(): Observable<DOC_Verbale[]>{
    return this.http.get<DOC_Verbale[]>(environment.apiBaseUrl+'DOC_Verbali');
    //http://213.215.231.4/swappX/api/DOC_Verbali
  }

  listByAnno(annoID: number): Observable<DOC_Verbale[]>{
    return this.http.get<DOC_Verbale[]>(environment.apiBaseUrl+'DOC_Verbali/listByAnno/'+annoID);  
    //http://213.215.231.4/swappX/api/DOC_Verbali/ListByAnno/2
  }

  listByClasseSezioneAnnoID(classeSezioneAnnoID: number): Observable<DOC_Verbale[]>{
    return this.http.get<DOC_Verbale[]>(environment.apiBaseUrl+'DOC_Verbali/listByClasseSezioneAnnoID/'+classeSezioneAnnoID);   
    //http://213.215.231.4/swappX/api/DOC_Verbali/ListByClasseSezioneAnnoID/16 
  }

  lisByPersona(personaID: number): Observable<DOC_Verbale[]>{
    return this.http.get<DOC_Verbale[]>(environment.apiBaseUrl+'DOC_Verbali/ListByPersona/'+personaID);   
    //http://213.215.231.4/swappX/api/DOC_Verbali/ListByPersona/285
  }
  
  get(verbaleID: any): Observable<DOC_Verbale>{
    return this.http.get<DOC_Verbale>(environment.apiBaseUrl+'DOC_Verbali/'+verbaleID);
    //http://213.215.231.4/swappX/api/DOC_Verbali/1
  }

  put(formData: any): Observable <any>{
    return this.http.put(environment.apiBaseUrl  + 'DOC_Verbali/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    //console.log (formData);
    return this.http.post(environment.apiBaseUrl  + 'DOC_Verbali' , formData);  
  }

  delete(verbaleID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'DOC_Verbali/' + verbaleID);    
  }

  listTipiVerbale(): Observable<DOC_TipoVerbale[]>{
    return this.http.get<DOC_TipoVerbale[]>(environment.apiBaseUrl+'DOC_TipiVerbale');   
    //http://213.215.231.4/swappX/api/DOC_TipiVerbale
  }

  getTipoVerbale(verbaleID: any): Observable<DOC_TipoVerbale>{
    return this.http.get<DOC_TipoVerbale>(environment.apiBaseUrl+'DOC_TipiVerbale/'+verbaleID);   
    //http://213.215.231.4/swappX/api/DOC_TipiVerbale/1
  }
}
