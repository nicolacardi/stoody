import { MAT_Obiettivo }                        from "./MAT_Obiettivo";

export interface DOC_PagellaVotoObiettivo {
        id?:                                    number;
        pagellaVotoID?:                         number;
        obiettivoID:                            number;
        livelloObiettivoID:                     number;

        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

        Obiettivo?:                             MAT_Obiettivo; //CI VA?
}






