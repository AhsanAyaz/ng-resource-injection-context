import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'weather-info',
    pathMatch: 'full',
  },
  {
    path: 'weather-info',
    loadComponent: () =>
      import('./weather-info/weather-info.component').then(
        (m) => m.WeatherInfoComponent
      ),
    data: {
      name: 'Weather Info',
    },
  },
];
