import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { concatMap, finalize, tap } from "rxjs/operators";
import { ALU_Alunno } from "src/app/_models/ALU_Alunno";

@Injectable({
    providedIn: 'root'
  })
export class NavigationService {

    private pageSubject = new BehaviorSubject<string>('');
    pageObs$: Observable<string> = this.pageSubject.asObservable();

    passPage(data:string){
        this.pageSubject.next(data);
    }

    getPage() {
        return this.pageObs$;
    }

    private AlunnoSubject = new BehaviorSubject<string>('');
    AlunnoObs$: Observable<string> = this.AlunnoSubject.asObservable();
    
    passAlunno(data: string) {
        this.AlunnoSubject.next(data);
    }

    getAlunno () {
        return this.AlunnoObs$;
    }


    private GenitoreSubject = new BehaviorSubject<string>('');
    GenitoreObs$: Observable<string> = this.GenitoreSubject.asObservable();
    
    passGenitore(data: string) {
        this.GenitoreSubject.next(data);
    }

    getGenitore () {
        return this.GenitoreObs$;
    }


    private AnnoSubject = new BehaviorSubject<number>(0);
    AnnoObs$: Observable<number> = this.AnnoSubject.asObservable();
    
    passAnnoScolastico(data: number) {
        this.AnnoSubject.next(data);
    }

    getAnnoScolastico () {
        return this.AnnoObs$;
    }

    private ClasseSezioneAnnoSubject = new BehaviorSubject<number>(0);
    ClasseSezioneAnnoObs$: Observable<number> = this.ClasseSezioneAnnoSubject.asObservable();
    
    passClasseSezioneAnno(data: number) {
        this.ClasseSezioneAnnoSubject.next(data);
    }

    getClasseSezioneAnno () {
        return this.ClasseSezioneAnnoObs$;
    }


}