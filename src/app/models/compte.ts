export interface Compte {
    rib?: number;          // Optional for creation
    nomClient: string;
    solde: number;
    client?: {
      nom: string;
      prenom: string;
    };        // Can be the client ID or the full client object
  }
  