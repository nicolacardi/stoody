import { PAG_Retta } from "./PAG_Retta"

export interface PAG_ScadenzaRetta {
        id              : number,
        rettaID         : number,
        importo         : number,
        dtScadenza      : string

        Retta?          : PAG_Retta
}


