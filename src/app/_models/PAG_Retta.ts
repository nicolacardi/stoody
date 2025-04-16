import { ALU_Alunno } from "./ALU_Alunno";
import { ASC_AnnoScolastico } from "./ASC_AnnoScolastico";
import { CLS_Iscrizione } from "./CLS_Iscrizione";
import { PAG_Pagamento } from "./PAG_Pagamento";

export interface PAG_Retta {
        id:                     number,

        iscrizioneID:           number,
        annoID:                 number,
        alunnoID:               number,
        
        annoRetta:              number,
        meseRetta:              number,
        quotaDefault:           number,
        quotaConcordata:        number,
        
        note?:                   string;
        dtIns?:                  string;
        dtUpd?:                  string;
        userIns?:                number;
        userUpd?:                number;

        iscrizione?:            CLS_Iscrizione;
        anno?:                  ASC_AnnoScolastico;
        alunno?:                ALU_Alunno;
        pagamenti?:             PAG_Pagamento[];
        totPagamenti?:          number;

}



export interface PAG_RettePagamenti_Sum {
        id:                     number;
        
        annoRetta:              number;
        meseRetta:              number;

        importo:                number;
        quotaDefault:           number;
        quotaConcordata:        number;
}

