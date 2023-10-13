import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Injectable({providedIn: 'root'})
export class CountriesService {

  private baseUrl: URL = new URL('https://restcountries.com/v3.1');
  private regionUrl: URL = new URL(`${this.baseUrl}/region`);
  private alphaCodeUrl: URL = new URL(`${this.baseUrl}/alpha`);
  private query: string = "?fields=cca3,name,borders";

  private _regions: Region[] = Object.values(Region);

  constructor(private http: HttpClient) { }

  public get regions(): Region[]{
    return structuredClone(this._regions);
  }

  public getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if ( !region ) return of([]);

    const url: string = `${this.regionUrl}/${region}${this.query}`;

    return this.http.get<Country[]>(url)
      .pipe(
        map( countries => countries.map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),
      );
  }

  public getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {

    const url = `${this.alphaCodeUrl}/${alphaCode}${this.query}`;
    return this.http.get<Country>(url)
      .pipe(
        map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))
      )
  }

  public getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);

    const countriesRequests: Observable<SmallCountry>[] = [];

    borders.forEach(code => {
      const request = this.getCountryByAlphaCode(code);
      countriesRequests.push(request);
    });

    //Se dispara hasta que no haya mas observables en el arreglo
    return combineLatest(countriesRequests);
  }

}
