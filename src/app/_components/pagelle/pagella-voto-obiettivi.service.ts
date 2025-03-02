import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DOC_PagellaVotoObiettivo } from 'src/app/_models/DOC_PagellaVotoObiettivo';
import { MAT_LivelloObiettivo } from 'src/app/_models/MAT_LivelloObiettivo';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PagellaVotoObiettiviService {

  constructor(private http: HttpClient) { }

  ListByPagellavotoMateriaCsa(pagellaVotoID: number, materiaID: number, classeSezioneAnnoID: number): Observable<DOC_PagellaVotoObiettivo[]>{
    return this.http.get<DOC_PagellaVotoObiettivo[]>(environment.apiBaseUrl+'DOC_PagellaVotoObiettivi/ListByPagellavotoMateriaCsa/'+pagellaVotoID+'/'+materiaID+'/'+classeSezioneAnnoID);   
    //http://213.215.231.4/swappX/api/DOC_PagellaVotoObiettivi/ListByPagellavotoMateriaCsa/130/1010/16
  }

  ListByObiettivo(obiettivoID: number): Observable<DOC_PagellaVotoObiettivo[]>{
    return this.http.get<DOC_PagellaVotoObiettivo[]>(environment.apiBaseUrl+'DOC_PagellaVotoObiettivi/ListByObiettivo/'+obiettivoID);   
    //http://213.215.231.4/swappX/api/DOC_PagellaVotoObiettivi/ListByObiettivo/19
  }
  
  put(formData: any): Observable <any>{
    //console.log ("formdata", formData );
    return this.http.put( environment.apiBaseUrl  + 'DOC_PagellaVotoObiettivi/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    delete formData.id;
    return this.http.post( environment.apiBaseUrl  + 'DOC_PagellaVotoObiettivi' , formData);  
  }

  listTipiLivelliObiettivo(): Observable<MAT_LivelloObiettivo[]>{
    return this.http.get<MAT_LivelloObiettivo[]>(environment.apiBaseUrl+'MAT_LivelliObiettivo/');   
    //http://213.215.231.4/swappX/api/MAT_LivelliObiettivo
  }
}
