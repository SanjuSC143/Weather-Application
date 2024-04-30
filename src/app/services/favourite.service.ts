import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'favoriteLocations';

  constructor() { }

  saveFavoriteLocation(location: string): Observable<any> {
    return new Observable((observer) => {
    localStorage.getItem<string[]>(this.FAVORITES_KEY).subscribe((favorites: string[]) => {
        if (!favorites) {
          favorites = [];
        }
        if (!favorites.includes(location)) {
          favorites.push(location);
          this.localStorage.setItem(this.FAVORITES_KEY, favorites).subscribe(() => {
            observer.next(favorites);
            observer.complete();
          });
        } else {
          observer.error('Location already exists in favorites.');
        }
      });
    });
  }

  removeFavoriteLocation(location: string): Observable<any> {
    return new Observable((observer) => {
      this.localStorage.getItem<string[]>(this.FAVORITES_KEY).subscribe((favorites: string[]) => {
        if (!favorites) {
          observer.error('No favorite locations found.');
          return;
        }
        const index = favorites.indexOf(location);
        if (index !== -1) {
          favorites.splice(index, 1);
          this.localStorage.setItem(this.FAVORITES_KEY, favorites).subscribe(() => {
            observer.next(favorites);
            observer.complete();
          });
        } else {
          observer.error('Location not found in favorites.');
        }
      });
    });
  }

  getFavoriteLocations(): Observable<string[]> {
    return this.localStorage.getItem<string[]>(this.FAVORITES_KEY);
  }
}

