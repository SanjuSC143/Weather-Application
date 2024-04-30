import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LocationDetails } from '../models/LocationDetails';
import { WeatherDetails } from '../models/WeatherDetails';
import { TemperatureData } from '../models/TemperatureData';
import { TodayData } from '../models/TodayData';
import { WeekData } from '../models/WeekData';
import { TodaysHighlight } from '../models/TodaysHighlights';
import { EnvironmentVariables } from '../Environment/EnvironmentVariables';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  clearWeatherData() {
    throw new Error('Method not implemented.');
  }
  cityName:string='Nagpur';
  searchedCities: string[] = []; // Initialize an array to store searched city names
  localStorageKey = 'searchedCities';
  locationDetails?: LocationDetails;
  weatherDetails?: WeatherDetails;
  temperatureData?: TemperatureData;
  todayData?:TodayData[]=[];
  weekData?: WeekData[]=[];
  todaysHighlight?:TodaysHighlight;
  language:string='en-US';
  date:string='20200622';
  units:string='m';
  currentTime:Date;

  //variables to control tab
  today:boolean=false;
  week:boolean=true;

  //variables to control metric value
  celsius:boolean=true;
  fahrenheit:boolean=false;
  constructor(private http:HttpClient) {
    this.getData();
    this.loadSearchedCities();
  }
  getSummaryImage(summary:string):string{
    var baseAddress='assets\\';
    var cloudysunny='cloudyandsunny.png';
    var rainSunny='rainy.png';
    var windy='windy.png';
    var sunny='sun.png';
    var rainy='rain.png';

    if(String(summary).includes("Partly Cloudy") || String(summary).includes("P Cloudy"))
      return baseAddress+cloudysunny;
    else if(String(summary).includes("Partly Rainy") || String(summary).includes("P Rainy"))
      return baseAddress+rainSunny;
    else if(String(summary).includes("wind"))
      return baseAddress+windy;
    else if(String(summary).includes("rain"))
      return baseAddress+rainy;
    else if(String(summary).includes("Sun"))
      return baseAddress+sunny;

    return baseAddress+cloudysunny;
    
  }
  fillTemperatureDataModel(){
    this.currentTime=new Date();
    this.temperatureData.day=this.weatherDetails['v3-wx-observations-current'].dayOfWeek;
    this.temperatureData.time=`${String(this.currentTime.getHours()).padStart(2,'0')}:${String(this.currentTime.getMinutes()).padStart(2,'0')}`;
    this.temperatureData.temperature=this.weatherDetails['v3-wx-observations-current'].temperature;
    this.temperatureData.location=`${this.locationDetails.location.city[0]},${this.locationDetails.location.country[0]}`;
    this.temperatureData.rainPercent=this.weatherDetails['v3-wx-observations-current'].precip24Hour;
    this.temperatureData.summaryPhrase=this.weatherDetails['v3-wx-observations-current'].wxPhraseShort;
    this.temperatureData.summaryImage=this.getSummaryImage(this.temperatureData.summaryPhrase);
  }
  

  fillWeekData(){
    var weekCount = 0;
    while(weekCount<7){
      this.weekData.push(new WeekData());
      this.weekData[weekCount].day = this.weatherDetails['v3-wx-forecast-daily-15day'].dayOfWeek[weekCount].slice(0,3);
      this.weekData[weekCount].tempMax = this.weatherDetails['v3-wx-forecast-daily-15day'].calendarDayTemperatureMax[weekCount];
      this.weekData[weekCount].tempMin = this.weatherDetails['v3-wx-forecast-daily-15day'].calendarDayTemperatureMin[weekCount];
      this.weekData[weekCount].summaryImage = this.getSummaryImage(this.weatherDetails['v3-wx-forecast-daily-15day'].narrative[weekCount]);
      weekCount++;
    }
  }
  fillTodayData(){
    var todayCount=0;
    while(todayCount<7){
      this.todayData.push(new TodayData());
      this.todayData[todayCount].time = this.weatherDetails['v3-wx-forecast-hourly-10day'].validTimeLocal[todayCount].slice(11,16);
      this.todayData[todayCount].temperature = this.weatherDetails['v3-wx-forecast-hourly-10day'].temperature[todayCount];
      this.todayData[todayCount].summaryImage = this.getSummaryImage(this.weatherDetails['v3-wx-forecast-hourly-10day'].wxPhraseShort[todayCount]);
      todayCount++;
    }
  }
  getTimeFromString(localTime:string){
    return localTime.slice(11,16);
  }
  //Method to get today's highlight
  fillTodaysHighlight(){
    this.todaysHighlight.airQuality = this.weatherDetails['v3-wx-globalAirQuality'].globalairquality.airQualityIndex;
    this.todaysHighlight.humidity = this.weatherDetails['v3-wx-observations-current'].precip24Hour;
    this.todaysHighlight.sunrise = this.getTimeFromString(this.weatherDetails['v3-wx-observations-current'].sunriseTimeLocal);
    this.todaysHighlight.sunset = this.getTimeFromString(this.weatherDetails['v3-wx-observations-current'].sunsetTimeLocal);
    this.todaysHighlight.uvIndex = this.weatherDetails['v3-wx-observations-current'].uvIndex;
    this.todaysHighlight.visibility = this.weatherDetails['v3-wx-observations-current'].visibility;
    this.todaysHighlight.windStatus = this.weatherDetails['v3-wx-observations-current'].windSpeed;
  }
  //Method to create useful data for UI
  prepareData():void{
    this.fillTemperatureDataModel();
    this.fillWeekData();
    this.fillTodayData();
    this.fillTodaysHighlight();
    console.log(this.todaysHighlight);
    console.log(this.temperatureData);
    console.log(this.weekData);
    console.log(this.todayData);
  }

  celsiusToFahrenheit(celsius:number):number{
    return +((celsius * 1.8) + 32).toFixed(2);
  }
  fahrenheitToCelsius(fahrenheit:number):number{
    return +((fahrenheit - 32) * 0.555).toFixed(2);
  }
  //Method to get location details from the API using the variable city name as input
  getLocationDetails(cityName:string,language:string):Observable<LocationDetails>{
    return this.http.get<LocationDetails>(EnvironmentVariables.weatherApiLocationURL,{
      headers:new HttpHeaders()
      .set(EnvironmentVariables.xRapidApiKeyName, EnvironmentVariables.xRapidApiKeyValue)
      .set(EnvironmentVariables.xRapidApiHostName, EnvironmentVariables.xRapidApiHostValue),
      params : new HttpParams()
      .set('query',cityName)
      .set('language',language)
    })
  }

  getWeatherReport(date:string, latitude:number, longitude:number, language:string, units:string):Observable<WeatherDetails>{
    return this.http.get<WeatherDetails>(EnvironmentVariables.weatherApiForecastURL,{
      headers:new HttpHeaders()
      .set(EnvironmentVariables.xRapidApiKeyName, EnvironmentVariables.xRapidApiKeyValue)
      .set(EnvironmentVariables.xRapidApiHostName, EnvironmentVariables.xRapidApiHostValue),
      params : new HttpParams()
      .set('date',date)
      .set('latitude',latitude)
      .set('longitude',longitude)
      .set('language',language)
      .set('units',units)
    })
  }
  private dataLoadedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public dataLoaded$: Observable<boolean> = this.dataLoadedSubject.asObservable();


  private saveSearchedCity(city: string): void {
    this.searchedCities.push(city);
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.searchedCities));
  }
  private loadSearchedCities(): void {
    const storedCities = localStorage.getItem(this.localStorageKey);
    if (storedCities) {
      this.searchedCities = JSON.parse(storedCities);
    }
  }
  
  getData(): void {
    this.todayData = [];
    this.weekData = [];
    this.temperatureData = new TemperatureData();
    this.todaysHighlight = new TodaysHighlight();
    let latitude = 0;
    let longitude = 0;
    this.getLocationDetails(this.cityName, this.language).subscribe({
      next: (response) => {
        this.locationDetails = response;
        latitude = this.locationDetails?.location.latitude[0];
        longitude = this.locationDetails?.location.longitude[0];
        this.saveSearchedCity(this.cityName);
        this.getWeatherReport(
          this.date,
          latitude,
          longitude,
          this.language,
          this.units
        ).subscribe({
          next: (response) => {
            this.weatherDetails = response;
            this.prepareData();
            this.dataLoadedSubject.next(true);
          }
        })
      }
    });
  }



}
