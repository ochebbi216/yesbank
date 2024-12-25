function deleteAccount(rib, row) {
    // Afficher la boîte de dialogue de confirmation
    Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer ce compte ?',
        text: "Cette action est irréversible !",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer !',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            // Requête AJAX pour supprimer le compte
            $.ajax({
                url: 'http://localhost:8080/api/comptes/' + rib,
                type: 'DELETE',
                success: function(response) {
                    // Supprimer la ligne du tableau
                    row.remove();
                    // Afficher une alerte de succès
                    Swal.fire(
                        'Supprimé !',
                        'Le compte a été supprimé avec succès.',
                        'success'
                    );
                },
                error: function(xhr, status, error) {
                    // Gérer les erreurs
                    Swal.fire(
                        'Erreur !',
                        'Une erreur est survenue lors de la suppression du compte.',
                        'error'
                    );
                }
            });
        }
    });
}
