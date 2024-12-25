import { Compte } from "./compte";

export interface Client {
  id?: number;
  nom: string;
  prenom: string;
  comptes: Compte[];  

}