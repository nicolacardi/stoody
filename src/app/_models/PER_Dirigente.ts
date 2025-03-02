import { PER_Persona }                          from "./PER_Persone";

export interface PER_Dirigente {
        id:                                     number;
        
        personaID:                              number;

        note?:                                  string;
        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

        persona:                                PER_Persona;
}
