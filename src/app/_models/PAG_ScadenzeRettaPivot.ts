import { CLS_Iscrizione } from "./CLS_Iscrizione";

export interface PAG_ScadenzeRettaPivot {
        alunnoID:                               number;
        //alunno:                                 ALU_Alunno;
        //nome:                                   string;
        //cognome:                                string;
        //annoID:                                 number;
        
        c_SET:    number;
        c_OTT:    number;
        c_NOV:    number;
        c_DIC:    number;
        c_GEN:    number;
        c_FEB:    number;
        c_MAR:    number;
        c_APR:    number;
        c_MAG:    number;
        c_GIU:    number;
        c_LUG:    number;
        c_AGO:    number;

        c_TOT:    number;

        // d_SET:    number;
        // d_OTT:    number;
        // d_NOV:    number;
        // d_DIC:    number;
        // d_GEN:    number;
        // d_FEB:    number;
        // d_MAR:    number;
        // d_APR:    number;
        // d_MAG:    number;
        // d_GIU:    number;
        // d_LUG:    number;
        // d_AGO:    number;

        d_TOT:    number;


        p_SET:    number;
        p_OTT:    number;
        p_NOV:    number;
        p_DIC:    number;
        p_GEN:    number;
        p_FEB:    number;
        p_MAR:    number;
        p_APR:    number;
        p_MAG:    number;
        p_GIU:    number;
        p_LUG:    number;
        p_AGO:    number;

        p_TOT:    number;

        iscrizione?:                            CLS_Iscrizione;
        //classeSezioneAnno?:                     CLS_ClasseSezioneAnno; 

}
