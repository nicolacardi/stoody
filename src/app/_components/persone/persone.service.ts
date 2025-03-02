import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersoneService {

  constructor(private http: HttpClient) { }

  list(): Observable<PER_Persona[]>{
    return this.http.get<PER_Persona[]>(environment.apiBaseUrl+'PER_Persone')
    //http://213.215.231.4/swappX/api/PER_Persone
  }

  listPersonaleScuola(): Observable<PER_Persona[]>{
    return this.http.get<PER_Persona[]>(environment.apiBaseUrl+'PER_Persone/listPersonaleScuola')
    //http://213.215.231.4/swappX/api/PER_Persone/listPersonaleScuola
  }

  listGenitoriByClasseSezioneAnno(classeSezioneAnnoID: number): Observable<PER_Persona[]>{
    return this.http.get<PER_Persona[]>(environment.apiBaseUrl+'PER_Persone/listGenitoriByClasseSezioneAnno/'+classeSezioneAnnoID)
    //http://213.215.231.4/swappX/api/PER_Persone/listGenitoriByClasseSezioneAnno/16
  }

  get(personaID: any): Observable<PER_Persona>{
    return this.http.get<PER_Persona>(environment.apiBaseUrl+'PER_Persone/'+personaID);
    //http://213.215.231.4/swappX/api/PER_Persone/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_Persone/' + formData.id , formData);    
  }

  post(formData: any): Observable <PER_Persona>{
    formData.id = 0;
    return this.http.post<PER_Persona>( environment.apiBaseUrl  + 'PER_Persone' , formData);  
  }

  //era così
  // post(formData: any): Observable <any>{
  //   formData.id = 0;
  //   return this.http.post( environment.apiBaseUrl  + 'PER_Persone' , formData);  
  // }

  delete(personaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_Persone/' + personaID);    
  }

  filterPersone(searchstring: string): Observable<PER_Persona[]> {

    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<PER_Persona[]>(environment.apiBaseUrl+'PER_Persone')
        .pipe (
            map(val=>val.filter(val=>(val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase()).includes(searchstring.toLowerCase()))),
        );
    } 
    else {
      return of()
    }
  }

  filterPersoneNoSoci(searchstring: string): Observable<PER_Persona[]> {

    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<PER_Persona[]>(environment.apiBaseUrl+'PER_Persone/ListNoSoci')
        .pipe (
            map(val=>val.filter(val=>(val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase()).includes(searchstring.toLowerCase()))),
        );
    } 
    else {
      return of()
    }
  }

  listRoles(personaID: number): Observable<string[]> {
    return this.http.get<string[]>(environment.apiBaseUrl+'PER_Persone/listRoles/' + personaID)
        //http://213.215.231.4/swappX/api/PER_Persone/listRoles/3
  }

  getByNomeCognome(nome: string, cognome: string, personaID: number): Observable<PER_Persona> {
    //restituisce PER_Persona in base a nome e cognome ma con PersonaID != dal parametro passato
    return this.http.get<PER_Persona>(environment.apiBaseUrl+'PER_Persone/GetByNomeCognome/' + nome+ '/'+cognome+ '/' +personaID)
  }

  getByCF(cf: string, personaID: number): Observable<PER_Persona> {
    return this.http.get<PER_Persona>(environment.apiBaseUrl+'PER_Persone/GetByCF/' + cf+ '/' +personaID)
  }

  getByMailAddress(mailAddress: string): Observable<PER_Persona>{
    return this.http.get<PER_Persona>(environment.apiBaseUrl+'PER_Persone/GetByMailAddress/' + mailAddress);
    //http://213.215.231.4/swappX/api/PER_Persone/GetByMailAddress/nicola.cardi@gmail.com
  }
  
  getByEmail(email: string, personaID: number): Observable<PER_Persona> {
    return this.http.get<PER_Persona>(environment.apiBaseUrl+'PER_Persone/GetByEMail/' + email+ '/' +personaID)
  }
}
