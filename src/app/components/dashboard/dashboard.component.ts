import { Component, OnInit } from '@angular/core';
import { ClientServiceService } from 'src/app/services/client-service.service';
import { CompteServiceService } from 'src/app/services/compte-service.service';
import { Client } from 'src/app/models/client';
import { Compte } from 'src/app/models/compte';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  clients: Client[] = [];
  comptes: Compte[] = [];
  clientChartData: any[] = [];
  compteChartData: any[] = [];
  soldeRangeChartData: any[] = [];
  totalMoneyChartData: any[] = []; // Chart data for total money
  colorScheme: string = 'vivid';
  isLoading: boolean = true;

  constructor(
    private clientService: ClientServiceService,
    private compteService: CompteServiceService
  ) {}

  ngOnInit(): void {
    Promise.all([this.loadClients(), this.loadComptes()]).finally(() => {
      this.isLoading = false;
    });
  }
  
  loadClients(): Promise<void> {
    return new Promise((resolve) => {
      this.clientService.getClients().subscribe((clients) => {
        this.clients = clients;
        this.clientChartData = clients.map((client) => ({
          name: `${client.nom} ${client.prenom}`,
          value: client.comptes.reduce((sum, compte) => sum + compte.solde, 0),
        }));
        resolve();
      });
    });
  }
  
  loadComptes(): Promise<void> {
    return new Promise((resolve) => {
      this.compteService.getAllComptes().subscribe((comptes) => {
        this.comptes = comptes;
        this.compteChartData = comptes.map((compte) => ({
          name: `RIB: ${compte.rib}`,
          value: compte.solde,
        }));
        this.calculateTotalMoney();
        this.prepareSoldeRanges();
        resolve();
      });
    });
  }
  

  calculateTotalMoney(): void {
    const totalMoney = this.comptes.reduce((sum, compte) => sum + compte.solde, 0);
    this.totalMoneyChartData = [
      {
        name: 'Total Money',
        value: totalMoney
      }
    ];
  }

  prepareSoldeRanges(): void {
    const ranges = {
      '0-1000': 0,
      '1000-5000': 0,
      '5000-10000': 0,
      '10000+': 0
    };
    this.comptes.forEach((compte) => {
      if (compte.solde <= 1000) ranges['0-1000']++;
      else if (compte.solde <= 5000) ranges['1000-5000']++;
      else if (compte.solde <= 10000) ranges['5000-10000']++;
      else ranges['10000+']++;
    });
    this.soldeRangeChartData = Object.entries(ranges).map(([range, count]) => ({
      name: range,
      value: count
    }));
  }
}
  