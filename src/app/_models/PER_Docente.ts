import { CLS_ClasseSezioneAnno } from "./CLS_ClasseSezioneAnno";
import { MAT_Materia } from "./MAT_Materia";
import { PER_Persona } from "./PER_Persone";

export interface PER_Docente {
        id:                     number;
        
        personaID:              number;
        abilitazione:           string;
        ckAttivo:               boolean;

        note:                   string;
        dtIns:                  string;
        dtUpd:                  string;
        userIns:                number;
        userUpd:                number;

        _Materie?:               MAT_Materia[];
        _CSA?:                   CLS_ClasseSezioneAnno[];
        persona:                PER_Persona;
}
