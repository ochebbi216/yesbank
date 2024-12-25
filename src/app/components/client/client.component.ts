import { Component, OnInit } from '@angular/core';
import { Client } from 'src/app/models/client';
import { ClientServiceService } from 'src/app/services/client-service.service';
import Swal from 'sweetalert2';
declare var bootstrap: any; // Include Bootstrap for modal handling

import * as $ from 'jquery'; // Import jQuery si nécessaire

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  clients: Client[] = [];
  isEditMode: boolean = false;
  currentClient: Client = {
    nom: '', prenom: '', comptes: [],
  }; // Empty client for adding
  modal: any;
  isLoading: boolean = true;


  constructor(private clientService: ClientServiceService) {}

  ngOnInit():void {
    Promise.all([this.loadClients()]).finally(() => {
      this.isLoading = false;
    });
  }

  loadClients(): Promise<void> {
    return new Promise((resolve)=>{
      this.clientService.getClients().subscribe((data) => {
        this.clients = data;
        resolve()
      });
    })

  }

  calculateTotalBalance(comptes: any[]): number {
    return comptes.reduce((acc, compte) => acc + compte.solde, 0);
  }

  openModal(client?: Client): void {
    this.isEditMode = !!client; // Set edit mode if a client is passed
    this.currentClient = client
      ? { ...client } // Clone client for editing
      : { nom: '', prenom: '', comptes: [] }; // Empty object for adding

    const modalElement = document.getElementById('clientModal');
    this.modal = new bootstrap.Modal(modalElement);
    this.modal.show();
  }
  saveClient(): void {
    // Vérifier si les champs obligatoires sont remplis
    if (!this.currentClient.nom || !this.currentClient.prenom) {
      Swal.fire({
        title: 'Champs obligatoires',
        text: 'Tous les champs doivent être remplis avant de continuer.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return; // Stopper l'exécution si un champ est manquant
    }
  
    if (this.isEditMode) {
      // Comparer les données pour détecter une modification
      const originalClient = this.clients.find(client => client.id === this.currentClient.id);
      if (
        originalClient &&
        originalClient.nom === this.currentClient.nom &&
        originalClient.prenom === this.currentClient.prenom
      ) {
        Swal.fire({
          title: 'Aucune modification détectée',
          text: 'Aucune mise à jour n’a été effectuée.',
          icon: 'info',
          confirmButtonText: 'OK',
        }).then(() => {
          // Fermer automatiquement le modal après le clic sur "OK"
          this.modal.hide();
        });
        return; // Stopper l'exécution si aucune modification n’est faite
      }
  
      // Mettre à jour le client existant
      this.clientService.updateClient(this.currentClient.id!, this.currentClient).subscribe(() => {
        this.loadClients();
        this.modal.hide();
        Swal.fire({
          title: 'Mise à jour réussie',
          text: 'Le client a été mis à jour avec succès.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      });
    } else {
      // Créer un nouveau client
      this.clientService.createClient(this.currentClient).subscribe(() => {
        this.loadClients();
        this.modal.hide();
        Swal.fire({
          title: 'Création réussie',
          text: 'Le client a été ajouté avec succès.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      });
    }
  }
  
  deleteClient(client: Client): void {
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
  
    if (client.id === undefined) {
      console.error("ID du client manquant !");
      return; // Vérification si l'ID est valide
    }
  
    // Confirmation SweetAlert avant suppression
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action supprimera définitivement le client.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        // Requête AJAX pour suppression
        $.ajax({
          url: `http://localhost:8080/api/clients/${client.id}`,
          type: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`, // Ajout du token dans les en-têtes
          },
          success: () => {
            console.log('Suppression réussie');
  
            // Supprimer la ligne correspondante avec JQuery
            $(`#tr${client.id}`).remove();
  
            // Afficher une confirmation de succès avec SweetAlert
            Swal.fire('Supprimé !', 'Le client a été supprimé.', 'success').then(() => {
              window.location.reload(); // Rechargement automatique de la page
            });
          },
          error: (jqXHR) => {
            console.error('Erreur lors de la suppression:', jqXHR.status, jqXHR.statusText);
            if (jqXHR.status === 401) {
              Swal.fire('Session expirée !', 'Veuillez vous reconnecter.', 'error');
            } else {
              Swal.fire('Erreur !', 'Impossible de supprimer le client.', 'error');
            }
          },
        });
      }
    });
  }
  
  
  
  
  
  
}