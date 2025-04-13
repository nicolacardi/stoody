import { Injectable }      from '@angular/core';
import { HttpClient }      from '@angular/common/http';
import { Observable }      from 'rxjs';

import { environment }     from 'src/environments/environment';
import { Utility }         from '../utilities/utility.component';

import { CAL_Lezione }     from 'src/app/_models/CAL_Lezione';
import { map }             from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LezioniService {

  constructor(private http: HttpClient) { }


  list(): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni');  
    //http://213.215.231.4/swappX/api/CAL_Lezioni
  }

  listByClasseSezioneAnno(classeSezioneAnnoID: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByClasseSezioneAnno/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/ListByClasseSezioneAnno/16
  }

  listByCSAAndDate(classeSezioneAnnoID: number, start: string, end: string): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByCSAAndDate/'+classeSezioneAnnoID+'/'+start+'/'+end);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/ListByCSAAndDate/16/2024-01-01/2024-10-01
  }

  listByDocenteAndDate(docenteID: number, start: string, end: string): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByDocenteAndDate/'+docenteID+'/'+start+'/'+end);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/ListByDocenteAndDate/1001/2024-01-01/2024-10-01
  }


  //NON USATA
  listByClasseSezioneAnnoCkCompito(classeSezioneAnnoID: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByClasseSezioneAnno/'+classeSezioneAnnoID)
    .pipe (
      map(val=>val.filter(val=>(val.ckCompito == true))),  
    );
    //http://213.215.231.4/swappX/api/CAL_Lezioni/ListByClasseSezioneAnno/16
  }

  listCompiti(classeSezioneAnnoID: number, docenteID: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListCompiti/'+classeSezioneAnnoID+"/"+docenteID)
    .pipe(
      map(compiti=> compiti.sort((a,b) => { return a.dtCalendario < b.dtCalendario ? 1 : -1;})) //dal compito più recente al meno recente
    )
    //http://213.215.231.4/swappX/api/CAL_Lezioni/listCompiti/21/1010
  }

  listByDocente(docenteID: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByDocente/'+ docenteID);
    //http://213.215.231.4/SwappX/api/CAL_Lezioni/ListByDocente/3
  }

  listByDocenteClasseSezioneAnno(docenteID: number, classeSezioneAnnoID: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByDocenteClasseSezioneAnno/'+ docenteID + '/' + classeSezioneAnnoID);
    //http://213.215.231.4/SwappX/api/CAL_Lezioni/ListByDocenteClasseSezioneAnno/3/16
  }


  listByDocenteClasseSezioneAnnoNoCompito(docenteID: number, classeSezioneAnnoID: number): Observable<CAL_Lezione[]>{
    return this.http.get<CAL_Lezione[]>(environment.apiBaseUrl+'CAL_Lezioni/ListByDocenteClasseSezioneAnno/'+ docenteID + '/' + classeSezioneAnnoID)
    .pipe (
      map(val=>val.filter(val=>(val.ckCompito == false))),  
    );
    //http://213.215.231.4/SwappX/api/CAL_Lezioni/ListByDocenteClasseSezioneAnno/3/16
  }


  listByDocenteAndOraOverlap(lezioneID: number, docenteID: number, dtCalendario: string, h_Ini: string, h_End: string): Observable<CAL_Lezione[]>{
    let strQuery = environment.apiBaseUrl+'CAL_Lezioni/ListByDocenteAndOraOverlap/'+ lezioneID + '/' + docenteID + '/' + dtCalendario + '/' + Utility.URL_FormatHour(h_Ini) + '/' + Utility.URL_FormatHour( h_End);
    //console.log (strQuery);
    return this.http.get<CAL_Lezione[]>(strQuery);
    //http://213.215.231.4/SwappX/api/CAL_Lezioni/ListByDocenteAndOraOverlap/160/3/2022-03-16/11%3A00%3A00/12%3A00%3A00
  }

  get(lezioneID: any): Observable<CAL_Lezione>{
    return this.http.get<CAL_Lezione>(environment.apiBaseUrl+'CAL_Lezioni/'+lezioneID);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/160
  }


  toggleEpoca (lezioneID: number) {
    return this.http.get( environment.apiBaseUrl  + 'CAL_Lezioni/ToggleEpoca/' + lezioneID);
    //http://213.215.231.4/swappX/api/CAL_Lezioni/4

  }

  copyByClasseSezioneAnnoToDate (classeSezioneAnnoID: number, dtFromStart: any, dtFromEnd: any, dtToStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/CopyByClasseSezioneAnnoToDate/' + classeSezioneAnnoID + '/' + dtFromStart + '/' + dtFromEnd + '/' + dtToStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/CopyByClasseSezioneAnnoAndDate/16/2022-03-14/2022-03-19/2022-03-21
  }

  copyToDate (dtFromStart: any, dtFromEnd: any, dtToStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/CopyToDate/' + dtFromStart + '/' + dtFromEnd + '/' + dtToStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/CopyToDate/2022-03-14/2022-03-19/2022-03-21
  }

  copyUntilDate (dtFromStart: any, dtFromEnd: any, dtUntilStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/copyUntilDate/' + dtFromStart + '/' + dtFromEnd + '/' + dtUntilStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/copyUntilDate/2022-03-14/2022-03-19/2022-03-21
  }

  copyByClasseSezioneAnnoUntilDate (classeSezioneAnnoID: number, dtFromStart: any, dtFromEnd: any, dtUntilStart: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/copyByClasseSezioneAnnoUntilDate/' + classeSezioneAnnoID + '/' + dtFromStart + '/' + dtFromEnd + '/' + dtUntilStart, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/copyByClasseSezioneAnnoUntilDate/16/2022-03-14/2022-03-19/2022-03-21
  }

  propagaEpocaByClasseSezioneAnnoUntilDate (classeSezioneAnnoID: number, dtFromStart: any, dtUntilEnd: any) {
    let formData = {};
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/propagaEpocaByClasseSezioneAnnoUntilDate/' + classeSezioneAnnoID + '/' + dtFromStart + '/' + dtUntilEnd, formData);
  //http://213.215.231.4/SwappX/api/CAL_Lezioni/propagaEpocaByClasseSezioneAnnoUntilDate/16/2022-03-28/2022-04-02

  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_Lezioni/' + formData.id , formData);    
  }

  setAppello(lezioneID: number): Observable <any>{
    let formData = {};
    console.log("lezioni.service setAppello, lezioneID",lezioneID);
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni/SetAppello/' + lezioneID, formData); 

  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CAL_Lezioni' , formData);  
  }

  delete(lezioneID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/' + lezioneID);    
  }

  deleteByClasseSezioneAnnoAndDate (classeSezioneAnnoID: number, dtStart: any, dtEnd: any) {
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/DeleteByClasseSezioneAnnoAndDate?classeSezioneAnnoID=' + classeSezioneAnnoID + '&dtStart=' + dtStart + '&dtEnd=' + dtEnd);
    //DeleteByClasseSezioneAnnoAndDate?classeSezioneAnnoID=16&dtStart=2022-03-28&dtEnd=2022-04-02
  }

  deleteByDate (dtStart: any, dtEnd: any) {
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Lezioni/DeleteByDate?dtStart=' + dtStart + '&dtEnd=' + dtEnd);
  }



}
