import { PER_Persona } from "../_models/PER_Persone";

export interface User {
    id:                                         string;
    userID:                                     string;
    userName:                                   string; 
    email:                                      string;
    normalizedEmail:                            string;

    fullname:                                   string;         //Da PER_Persona

    token?:                                     string;         //token restituito da EF
    // isLoggedIn?:                                boolean;        //dinamico: impostato da behaviour subject
    
    //tipoPersonaID:                              number;

    tmpPassword:                                string;
    // TipoPersona?:                               PER_TipoPersona;

    personaID:                                  number;
    persona?:                                   PER_Persona;

}


