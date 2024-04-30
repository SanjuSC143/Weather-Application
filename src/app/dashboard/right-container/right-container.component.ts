import { Component } from '@angular/core';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { faFaceSmile } from '@fortawesome/free-solid-svg-icons';
import { faFaceFrown } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../../services/weather.service';
@Component({
  selector: 'app-right-container',
  templateUrl: './right-container.component.html',
  styleUrl: './right-container.component.css'
})
export class RightContainerComponent {
  
  loading: boolean = true; // Variable to track loading state
  faThumbsUp:any = faThumbsUp;
  faThumbsDown:any = faThumbsDown;
  faFaceSmile:any = faFaceSmile;
  faFaceFrown:any = faFaceFrown;
  constructor(public weatherService: WeatherService){

  }
  ngOnInit(): void {
    // Subscribe to dataLoaded$ to update loading state
    this.weatherService.dataLoaded$.subscribe(dataLoaded => {
      this.loading = !dataLoaded; // Set loading to true if dataLoaded is false
    });
  }
  onTodayClick(){
    this.weatherService.today = true;
    this.weatherService.week = false;
  }
  onWeekClick(){
    this.weatherService.today = false;
    this.weatherService.week = true;
  }

  onCelciusClick(){
    this.weatherService.celsius = true;
    this.weatherService.fahrenheit = false;
  }

  onFahrenheitClick(){
    this.weatherService.celsius = false;
    this.weatherService.fahrenheit = true;
  }
}
