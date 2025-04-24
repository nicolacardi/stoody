
import { CLS_Iscrizione } from "./CLS_Iscrizione";
import { PAG_PagamentoRetta } from "./PAG_PagamentoRetta";
import { PAG_ScadenzaRetta } from "./PAG_ScadenzaRetta";

export interface PAG_Retta {
        id                 : number,

        iscrizioneID       : number,
        
        // annoRetta:              number,
        // meseRetta:              number,
        quotaDefault       : number,
        quotaConcordata    : number,
        
        note?              : string;
        dtIns?             : string;
        dtUpd?             : string;
        userIns?           : number;
        userUpd?           : number;

        iscrizione?        : CLS_Iscrizione;
        _PagamentiRette?        : PAG_PagamentoRetta[];
        _ScadenzeRette?        : PAG_ScadenzaRetta[];

        totPagamenti?      : number;
}



export interface PAG_RettePagamenti_Sum {
        id                 : number;
        
        annoRetta          : number;
        meseRetta          : number;

        importo            : number;
        quotaDefault       : number;
        quotaConcordata    : number;
}

