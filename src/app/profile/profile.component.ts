import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { WeatherService } from '../services/weather.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  constructor(public loginService: LoginService, public weatherService: WeatherService, private route : Router) {}
  cities: string[] = [];

  ngOnInit(): void {
    // Create a Set to store unique city names
    const uniqueCitiesSet = new Set<string>();

    // Add each searched city to the Set
    this.weatherService.searchedCities.forEach(city => {
      uniqueCitiesSet.add(city);
    });

    // Convert the Set back to an array and assign it to cities
    this.cities = Array.from(uniqueCitiesSet);
  }
  public logout() {
    this.loginService.logout();
    window.location.reload();
    this.route.navigate(['/'])
  }
}
