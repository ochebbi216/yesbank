import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Compte } from '../models/compte';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class CompteServiceService {
  private baseUrl = 'https://bank-server-fbfac4guggamg9h4.northeurope-01.azurewebsites.net/api/comptes';

  constructor(private http: HttpClient) { }

  getAllComptes(): Observable<Compte[]> {
    return this.http.get<Compte[]>(this.baseUrl);
  }

  getCompteByRIB(rib: number): Observable<Compte> {
    return this.http.get<Compte>(`${this.baseUrl}/${rib}`);
  }

  createCompte(compteData: { solde: number; client_id: number }): Observable<Compte> {
    return this.http.post<Compte>(this.baseUrl, compteData);
  }
  

  updateCompte(rib: number, compteData: Compte): Observable<Compte> {
    return this.http.put<Compte>(`${this.baseUrl}/${rib}`, compteData);
  }

  deleteCompte(rib: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${rib}`);
  }
}