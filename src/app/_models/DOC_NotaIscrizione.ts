import { CLS_Iscrizione } from "./CLS_Iscrizione";

export interface DOC_NotaIscrizione {
        id:                                     number;
        
        notaID:                                 number;
        iscrizioneID:                           number;

        iscrizione:                             CLS_Iscrizione;
}
