import { _UT_Domanda } from "./_UT_Domanda";

export interface CLS_IscrizioneRisposta {
        id?:                                     number;
        // tipo:                                   string;
        iscrizioneID:                           number;
        domandaID:                              number;
        rispostaLibera:                         string;
        risposta1:                              boolean;
        risposta2:                              boolean;
        risposta3:                              boolean;
        risposta4:                              boolean;
        risposta5:                              boolean;
        risposta6:                              boolean;
        risposta7:                              boolean;
        risposta8:                              boolean;
        risposta9:                              boolean;
        dtIns?:                                 string;
        userIns?:                               number;
        domanda?:                              _UT_Domanda
}