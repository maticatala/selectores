import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Region, SmallCountry, Country } from '../../interfaces/country.interfaces';
import { CountriesService } from '../../services/countries.service';
import { filter, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public myForm: FormGroup = this.fb.group({
    region: ['', [Validators.required]],
    country: ['', [Validators.required]],
    border: ['', [Validators.required]],
  })

  public countriesByRegion: SmallCountry[] = [];
  public bordersByCountry: SmallCountry[] = [];

  // public regions: Region[] = this.countriesService.regions;

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService,
  ) { }

  ngOnInit(): void {

    this.onRegionChanged();
    this.onCountryChanged();

  }

  get regions(): Region[]{
    return this.countriesService.regions;
  }

  private onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap( ()  => this.myForm.get('country')!.reset('') ),
        tap( ()  => this.bordersByCountry = [] ),
        switchMap( (region) => this.countriesService.getCountriesByRegion(region) ),
      )
      .subscribe(countries => {
        console.log({ countries });
        this.countriesByRegion = countries.sort((a, b) => a.name > b.name ? 1 : -1);
      });
  }

  // private onCountryChanged(): void{
  //   this.myForm.get('country')!.valueChanges
  //     .pipe(
  //       tap(() => this.myForm.get('border')!.reset('')),
  //       filter( (value: string) => value.length > 0),
  //       switchMap((alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode)),
  //       switchMap( country => this.countriesService.getCountryBordersByCodes(country.borders))
  //     )
  //     .subscribe( countries => {
  //       this.bordersByCountry = countries;
  //     });
  // }

  private onCountryChanged(): void{
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('border')!.reset('')),
        map(value => this.countriesByRegion.filter(country => country.cca3 === value)[0]),
        filter(country => !!country),
        switchMap( country => this.countriesService.getCountryBordersByCodes(country.borders)),
      )
      .subscribe(countries => {
        if (countries.length === 0) {
          this.myForm.get('border')?.clearValidators();
          this.myForm.get('border')?.updateValueAndValidity();
        }
        this.bordersByCountry = countries;
      });
  }


}
