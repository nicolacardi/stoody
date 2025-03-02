import { PER_Persona } from "./PER_Persone";

export interface PER_Socio {
        id:                                     number;
        personaID:                              number;

        tipoSocioID:                            number;


        dtRichiesta:                            string;
        dtAccettazione:                         string;
        quota:                                  number;
        dtDisiscrizione:                        string;
        dtRestQuota:                            string;
        ckRinunciaQuota:                        string;

        note?:                                  string;
        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

        tipoSocio?:                             PER_TipoSocio;
        persona?:                               PER_Persona;

}

export interface PER_TipoSocio {
        id:                                     number;
        descrizione:                            string;
        descrizioneP:                           string;
        livello:                                number;
}