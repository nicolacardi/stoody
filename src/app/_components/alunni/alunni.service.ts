import { Injectable }           from '@angular/core';
import { HttpClient }           from '@angular/common/http';
import { Observable, of }       from 'rxjs';
import { environment }          from 'src/environments/environment';
import { map}                   from 'rxjs/operators';

import { ALU_Alunno}            from 'src/app/_models/ALU_Alunno';
import { ALU_GenitoreAlunno }   from 'src/app/_models/ALU_GenitoreAlunno';

@Injectable({
  providedIn: 'root'
})

export class AlunniService {

  constructor(private http: HttpClient) { }

  list(): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni');
    //http://213.215.231.4/swappX/api/ALU_Alunni
    //https://213.215.231.4/swappX/api/ALU_Alunni    
  }
  
  listByGenitore(genitoreID: any): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/ListByGenitore/'+genitoreID);
    //http://213.215.231.4/swappX/api/ALU_Alunni/ListByGenitore/3
  }

  listByClasseSezioneAnno(classeSezioneAnnoID: any): Observable<ALU_Alunno[]>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/ListByClasseSezioneAnno/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/ALU_Alunni/ListByClasseSezioneAnno/3
  }

  listWithParents(): Observable<ALU_Alunno[]>{
      return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni/ListWithParents');
      //http://213.215.231.4/swappX/api/ALU_Alunni/ListWithParents
  }

  get(id: any): Observable<ALU_Alunno>{
    return this.http.get<ALU_Alunno>(environment.apiBaseUrl+'ALU_Alunni/'+id);
    //http://213.215.231.4/swappX/api/ALU_Alunni/3
  }

  getWithParents(classeSezioneAnnoID: any): Observable<ALU_Alunno>{
    return this.http.get<ALU_Alunno>(environment.apiBaseUrl+'ALU_Alunni/GetWithParents/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/ALU_Alunni/GetWithParents/3
  }


  getByPersona(personaID: any): Observable<ALU_Alunno>{  //TODO: WS da fare
    return this.http.get<ALU_Alunno>(environment.apiBaseUrl+'ALU_Alunni/getByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/ALU_Alunni/getByPersona/30
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'ALU_Alunni/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'ALU_Alunni' , formData);  
  }

  delete(alunnoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'ALU_Alunni/' + alunnoID);    
  }

  deleteByPersona (personaID: number) {
    return this.http.delete( environment.apiBaseUrl  + 'ALU_Alunni/DeleteByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/ALU_Alunni/DeletByPersona/3
  }

  filterAlunni(searchstring: string): Observable<ALU_Alunno[]>{

    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni')
            .pipe (
            map(val=>val.filter(val=>(val.persona.nome.toLowerCase() + ' ' + val.persona.cognome.toLowerCase()).includes(searchstring.toLowerCase()))),
      );
        } else {
      return of()
      }

    //Quando si fa clic su uno dei valori nella dropdown, searchstring non è più una stringa ma un object ( a causa forse di [value] = "element" in filtri.component.html),
    //quindi non si può più fare searchstring.toLowerCase(), istruzione che si è resa necessaria per cercare in maniera case insensitive
    //dunque, fino a una soluzione migliore, qui testiamo se searchstring sia un object (non una stringa) e in quel caso si restituisce un observable vuoto.
    // if (typeof searchstring === 'string') {
    //   return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni')
    //     .pipe (
    //       map(val=> val.filter(val=>(val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase()).includes(searchstring.toLowerCase()) )),
    //     );
    // } else {
    //   return of();
    // }
  }

  filterAlunniExact(searchstring: string): Observable<boolean>{
    //restituisce un observable di true se il valore ha un match esatto altrimenti false
    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni')
            .pipe (
            map(val=>val.filter(val=>(val.persona.nome.toLowerCase() + ' ' + val.persona.cognome.toLowerCase())===(searchstring.toLowerCase())).length !==0
            ),
      );
        } else {
      return of()
      }
  }

  listByAnnoNoClasse(searchstring: string, annoID: number): Observable<ALU_Alunno[]>{

    //deve restituire l'elenco degli ALUNNI (primo filtro) che in un certo anno (secondo filtro) NON sono iscritti a un'altra classe
    // qui in angular filtriamo in base alla searchstring

    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'CLS_Iscrizioni/ListByAnnoNoClasse/'+annoID)
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByAnnoNoClasse/2
        .pipe (
        map(val=>val.filter(val=>(val.persona.nome.toLowerCase() + ' ' + val.persona.cognome.toLowerCase()).includes(searchstring.toLowerCase()))),
      );
    } else {
      return of()
    }
  }

  //Recupera l'id da nome cognome  
  findAlunnoID(searchstring: string) : Observable<any>{
    return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni')
      .pipe(
        map(val => val.find(val => (val.persona.nome.toLowerCase() + ' ' + val.persona.cognome.toLowerCase())== searchstring.toLowerCase())),
      )
  }

  hasFratelloMaggiore(annoID: number, alunnoID: number): Observable<boolean> {
    //return this.http.get<boolean>( environment.apiBaseUrl  + 'ALU_Alunni/HasFratelloMaggiore/'+alunnoID);
    return this.http.get<boolean>( environment.apiBaseUrl  + 'ALU_Alunni/HasFratelloMaggiore/'+annoID+"/"+alunnoID);
    //http://213.215.231.4/swappX/api/ALU_Alunni/HasFratelloMaggiore/2/3 
  }


//#region -- GenitoreAlunno


  listByGenitoreAlunno (genitoreID: number, alunnoID: number): Observable <any>{
    return this.http.get( environment.apiBaseUrl  + 'ALU_GenitoriAlunni/ListByGenitoreAlunno/'+alunnoID+'/'+genitoreID);
    //http://213.215.231.4/swappX/api/ALU_GenitoriAlunni/ListByGenitoreAlunno/3/4
  }

  postGenitoreAlunno (genitoreID: number, alunnoID: number): Observable <any>{
    const parentela = <ALU_GenitoreAlunno>{};
    parentela.id = 0;
    parentela.alunnoID = alunnoID;
    parentela.genitoreID = genitoreID;
    return this.http.post( environment.apiBaseUrl  + 'ALU_GenitoriAlunni/' , parentela);
  }

  deleteByGenitoreAlunno (genitoreID: number, alunnoID: number) {
    //console.log ("genitoreID:", genitoreID, "alunnoID:", alunnoID)
    return this.http.delete( environment.apiBaseUrl  + 'ALU_GenitoriAlunni/DeleteByGenitoreAlunno/'+genitoreID+'/'+alunnoID);
    //http://213.215.231.4/swappX/api/ALU_GenitoriAlunni/DeleteByGenitoreAlunno/4/3
  }

//#endregion
 

}



  // //per filtro e paginazione server side (NON USATO)
  // findAlunni(filter = '', sortOrder= 'asc', pageNumber = 0, pageSize = 3): Observable<ALU_Alunno[]>{
  //   return this.http.get<ALU_Alunno[]>(environment.apiBaseUrl+'ALU_Alunni', {
  //     params: new HttpParams()
  //               .set('filter', filter)
  //               .set('sortOrder', sortOrder)
  //               .set('pageNumber', pageNumber.toString())
  //               .set('pageSize', pageSize.toString())
  //   });
  // }
