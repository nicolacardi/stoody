import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

import { MAT_MacroMateria } from 'src/app/_models/MAT_MacroMateria';


@Injectable({
  providedIn: 'root'
})
export class MacroMaterieService {

  constructor(private http: HttpClient) { }


  list(): Observable<MAT_MacroMateria[]>{
    return this.http.get<MAT_MacroMateria[]>(environment.apiBaseUrl+'MAT_MacroMaterie');
    //http://213.215.231.4/swappX/api/MAT_MacroMaterie
  }

  get(macroMateriaID: any): Observable<MAT_MacroMateria>{
    return this.http.get<MAT_MacroMateria>(environment.apiBaseUrl+'MAT_MacroMaterie/'+macroMateriaID);
    //http://213.215.231.4/swappX/api/MAT_MacroMaterie/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'MAT_MacroMaterie/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'MAT_MacroMaterie' , formData);  
  }

  delete(macroMateriaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'MAT_MacroMaterie/' + macroMateriaID);    
  }



}
