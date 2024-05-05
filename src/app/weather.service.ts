import { Injectable, Signal, signal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrentConditions } from './current-conditions/current-conditions.type';
import { ConditionsAndZip } from './conditions-and-zip.type';
import { Forecast } from './forecasts-list/forecast.type';
import { LocationService } from './location.service';
import { HttpCacheService } from './http-cache.service';

@Injectable()
export class WeatherService {
  private country:  'us' | 'de' = 'us';
  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions = signal<ConditionsAndZip[]>([]);

  constructor(readonly httpCacheService: HttpCacheService, private locationService: LocationService) {
    this.locationService.removedLocation$.pipe(
      tap((zipCode) => {
        this.removeCurrentConditions(zipCode);
        httpCacheService.removeCacheDataForSpacificLocation(zipCode)
      }),
      takeUntilDestroyed()
    ).subscribe();
    this.locationService.addedLocation$.pipe(
      tap((zipCode) => this.addCurrentConditions(zipCode)),
      takeUntilDestroyed()
    ).subscribe()
  }

  addCurrentConditions(zipcode: string): void {
    this.httpCacheService.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},${this.country}&units=imperial&APPID=${WeatherService.APPID}`)
    .pipe(
      catchError(() => {
        this.locationService.removeLocation(zipcode);
        return EMPTY;
      })
    ).subscribe(data => this.currentConditions.update(conditions => [...conditions, { zip: zipcode, data }]));
  }

  removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      for (let i in conditions) {
        if (conditions[i].zip == zipcode)
          conditions.splice(+i, 1);
      }
      return conditions;
    })
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    return this.httpCacheService.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},${this.country}&units=imperial&cnt=5&APPID=${WeatherService.APPID}`);

  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }

}
