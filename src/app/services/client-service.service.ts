import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client';

@Injectable({
  providedIn: 'root'
})
export class ClientServiceService {
  private baseUrl = 'https://bank-server-fbfac4guggamg9h4.northeurope-01.azurewebsites.net/api/clients';

  constructor(private http: HttpClient) { }

  // Get all clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.baseUrl);
  }

  // Get a single client by ID
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  // Create a new client
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, client);
  }

  // Update an existing client
  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, client);
  }

  // Delete a client by ID
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
