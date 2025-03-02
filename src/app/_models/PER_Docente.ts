import { PER_Persona } from "./PER_Persone";

export interface PER_Docente {
        id:                     number;
        
        personaID:              number;
        ckAttivo:               boolean;

        note:                   string;
        dtIns:                  string;
        dtUpd:                  string;
        userIns:                number;
        userUpd:                number;

        persona:                PER_Persona;
}
