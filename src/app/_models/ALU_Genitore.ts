import { ALU_Alunno }                           from "./ALU_Alunno";
import { ALU_TipoGenitore }                     from "./ALU_Tipogenitore";
import { PER_Persona }                          from "./PER_Persone";

export interface ALU_Genitore {
        id:                                     number;     
        personaID:                              number;

        //tipo:                                   string;
        tipoGenitoreID:                         number;
        titoloStudio:                           string;
        professione:                            string;

        note?:                                  string;
        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

        persona:                                PER_Persona;
        tipoGenitore?:                          ALU_TipoGenitore;

        _Figli?:                                ALU_Alunno[];
}


export interface ALU_GenitoreExtended extends ALU_Genitore {
        isChecked: boolean; // Aggiungi la proprietà per gestire le caselle di controllo
}