import { Component, OnInit } from '@angular/core';
import { Compte } from 'src/app/models/compte';
import { CompteServiceService } from 'src/app/services/compte-service.service';
import { ClientServiceService } from 'src/app/services/client-service.service';
import { Client } from 'src/app/models/client';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-compte',
  templateUrl: './compte.component.html',
  styleUrls: ['./compte.component.css']
})
export class CompteComponent implements OnInit {
  comptes: Compte[] = [];
  clients: Client[] = [];
  filter: string = '';
  isEditMode: boolean = false;
  currentCompte: any = { solde: 0, client_id: null, nomClient: '' };
  modal: any;
  clientMode: 'existing' | 'new' = 'existing'; // For selecting client mode in Add Modal
  newClient: Client = { nom: '', prenom: '', comptes: [] };
  filteredClientSuggestions: Client[] = [];
  isLoading: boolean = true;


  constructor(
    private compteService: CompteServiceService,
    private clientService: ClientServiceService
  ) {}

  ngOnInit(): void {
    Promise.all([this.loadComptes(), this.loadClients()]).finally(() => {
      this.isLoading = false;
    });
  }

  // Load all comptes from the backend
  loadComptes():Promise<void> {
    return new Promise((resolve)=>{
      this.compteService.getAllComptes().subscribe((data) => {
        this.comptes = data;
        resolve();
      });
    })
  }
  // Load all clients for selection in the modal
  loadClients(): Promise<void> {
    return new Promise((resolve)=>{
      this.clientService.getClients().subscribe((data) => {
        this.clients = data;
        resolve();
      });
    })
  
  }

  // Filter comptes based on the search input
  filteredComptes(): Compte[] {
    if (!this.filter) return this.comptes;
    return this.comptes.filter((compte) =>
      (compte.nomClient ?? '').toLowerCase().includes(this.filter.toLowerCase())
    );
  }

  // Open the modal for adding a new compte
  openAddModal(): void {
    this.isEditMode = false;
    this.clientMode = 'existing'; // Default mode is selecting an existing client
    this.currentCompte = { solde: 0, client_id: null, nomClient: '' };
    this.newClient = { nom: '', prenom: '', comptes: [] }; // Réinitialiser le nouveau client

    const modalElement = document.getElementById('addCompteModal');
    this.modal = new bootstrap.Modal(modalElement!);
    this.modal.show();
  }

  // Open the modal for editing an existing compte
  openEditModal(compte: Compte): void {
    this.isEditMode = true;
    this.currentCompte = { ...compte }; // Clone the compte to avoid direct mutation

    const modalElement = document.getElementById('editCompteModal');
    this.modal = new bootstrap.Modal(modalElement!);
    this.modal.show();
  }

  editCompte(): void {
    if (this.currentCompte && this.currentCompte.rib) {
      // Find the original compte object
      const originalCompte = this.comptes.find(
        (compte) => compte.rib === this.currentCompte.rib
      );
  
      // Check if there are no changes
      if (
        originalCompte &&
        originalCompte.solde === this.currentCompte.solde

      ) {
        Swal.fire({
          title: 'Aucune modification détectée',
          text: 'Aucune mise à jour n’a été effectuée.',
          icon: 'info',
          confirmButtonText: 'OK',
        }).then(() => {
          // Close the modal automatically after clicking "OK"
          this.modal.hide();
        });
        return; // Stop execution if no changes are detected
      }
  
      // Prepare the updated compte data
      const rib = this.currentCompte.rib;
      const updatedCompte: Compte = {
        ...this.currentCompte, // Include all other properties of the compte
        solde: this.currentCompte.solde, // Ensure the updated solde is included
      };
  
      // Call the update service
      this.compteService.updateCompte(rib, updatedCompte).subscribe({
        next: () => {
          this.loadComptes(); // Refresh the list of comptes
          this.modal.hide(); // Close the modal
          Swal.fire("Succès", "Compte mis à jour avec succès!", "success");
        },
        error: (err) => {
          console.error("Erreur lors de la mise à jour du compte:", err);
          Swal.fire("Erreur", "Échec de la mise à jour du compte. Vérifiez les journaux du serveur.", "error");
        },
      });
    } else {
      Swal.fire("Erreur", "Données de compte invalides.", "error");
    }
  }
  
  saveCompte(): void {
    if (this.clientMode === 'new') {
      // Create a new client and then the account
      const completeNewClient: Client = {
        nom: this.newClient.nom || '',
        prenom: this.newClient.prenom || '',
        comptes: []
      };
  
      this.clientService.createClient(completeNewClient).subscribe({
        next: (createdClient) => {
          if (createdClient.id) {
            this.createCompte(createdClient.id);
          } else {
            console.error("Error: Client ID is missing.");
            Swal.fire("Error", "Failed to create client. Missing ID.", "error");
          }
        },
        error: (err) => {
          console.error("Client creation failed:", err);
          Swal.fire("Error", "Failed to create new client.", "error");
        }
      });
    } else if (this.currentCompte.client_id) {
      // Create the account for existing client
      this.createCompte(this.currentCompte.client_id);
    } else {
      Swal.fire("Error", "Please select a valid client.", "error");
    }
  }
  
  createCompte(clientId: number | string): void {
    const newCompte = {
      solde: this.currentCompte.solde,
      client_id: Number(clientId) // Ensure client_id is an integer
    };
  
    this.compteService.createCompte(newCompte).subscribe({
      next: () => {
        this.loadComptes();
        this.modal.hide();
        Swal.fire("Success", "Compte created successfully!", "success");
      },
      error: (err) => {
        console.error("Error creating compte:", err);
        Swal.fire("Error", "Failed to create compte. Check server logs.", "error");
      }
    });
  }
  
  
  // Reset client selection based on the chosen mode
  resetClientSelection(): void {
    if (this.clientMode === 'existing') {
      this.currentCompte.client_id = null; // Reset client selection
      this.newClient = { nom: '', prenom: '', comptes: [] }; // Réinitialiser le nouveau client
    } else if (this.clientMode === 'new') {
      this.currentCompte.client_id = null; // Clear client ID
      this.newClient = { nom: '', prenom: '', comptes: [] }; // Réinitialiser le nouveau client
    }
  }

  // Delete a compte with confirmation
  deleteCompte(compte: Compte): void {
    // Vérifier si le token est présent dans le localStorage
    const token = localStorage.getItem('accessToken');
    if (!token) {
      Swal.fire({
        title: 'Non autorisé',
        text: 'Vous devez être authentifié pour effectuer cette action.',
        icon: 'error',
      });
      return; // Arrêter l'exécution si le token est manquant
    }
  
    if (compte.rib === undefined) {
      console.error("RIB du compte manquant !");
      return; // Vérification si le RIB est valide
    }
  
    // Confirmation SweetAlert avant suppression
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action supprimera définitivement le compte.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        // Requête AJAX pour suppression
        $.ajax({
          url: `http://localhost:8080/api/comptes/${compte.rib}`, // URL adaptée pour comptes
          type: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`, // Ajout du token dans les en-têtes
          },
          success: () => {
            console.log('Suppression réussie');
  
            // Supprimer la ligne correspondante avec JQuery
            $(`#tr${compte.rib}`).remove();
  
            // Afficher une confirmation de succès avec SweetAlert
            Swal.fire('Supprimé !', 'Le compte a été supprimé.', 'success').then(() => {
              window.location.reload(); // Rechargement automatique de la page
            });
          },
          error: (jqXHR) => {
            console.error('Erreur lors de la suppression:', jqXHR.status, jqXHR.statusText);
            if (jqXHR.status === 401) {
              Swal.fire('Session expirée !', 'Veuillez vous reconnecter.', 'error');
            } else {
              Swal.fire('Erreur !', 'Impossible de supprimer le compte.', 'error');
            }
          },
        });
      }
    });
  }
    
  filterClients(): void {
    const searchTerm = this.newClient.nom.toLowerCase();
    this.filteredClientSuggestions = this.clients.filter(client =>
      `${client.nom} ${client.prenom}`.toLowerCase().includes(searchTerm)
    );
  }
  
  
}