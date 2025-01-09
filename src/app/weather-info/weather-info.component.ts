import {
  Component,
  effect,
  EnvironmentInjector,
  inject,
  Resource,
  resource,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

type City = 'Stockholm' | 'Milan';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  city: City;
}

@Component({
  selector: 'app-weather-info',
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center gap-4">
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Multicity</span>
          <input
            (ngModelChange)="onModeChange($event)"
            [(ngModel)]="multiMode"
            type="checkbox"
            class="toggle"
          />
        </label>
      </div>
      @if (multiMode()) {
      <select [(ngModel)]="city" class="select select-primary w-full max-w-xs">
        @for(city of cities; track city) {
        <option [value]="city">{{ city }}</option>
        }
      </select>
      } @else {
      <button class="btn btn-primary btn-outline" (click)="fetch()">
        Fetch Weather
      </button>
      }

      <button class="btn btn-error btn-outline" (click)="fetchWithError()">
        Fetch Weather with error
      </button>
      @if (weatherResource.isLoading()) {
      <div>Loading...</div>
      } @else if (weatherResource.error()) {
      <div>Error: {{ weatherResource.error() }}</div>
      } @else if (weatherResource.value()) {
      <img
        [src]="weatherResource.value()?.icon"
        class="w-20 object-fit"
        alt="weather icon"
      />
      <p>Temperature: {{ weatherResource.value()?.temperature }}</p>
      <p>Condition: {{ weatherResource.value()?.condition }}</p>
      }
    </div>
  `,
})
export class WeatherInfoComponent {
  cities: City[] = ['Milan', 'Stockholm'];
  city = signal<City>(this.cities[0]);
  multiMode = signal<boolean>(false);
  weatherResource!: Resource<WeatherData>;
  injector = inject(EnvironmentInjector);

  constructor() {
    this.fetch();
  }

  fetch(url = 'assets/weather.json') {
    runInInjectionContext(this.injector, () => {
      this.weatherResource = resource<WeatherData, City>({
        loader: async ({ abortSignal }) => {
          const response = await new Promise<Response>((resolve) => {
            setTimeout(() => {
              fetch(url, { signal: abortSignal }).then((r) => resolve(r));
            }, 1500);
          });
          if (!response.ok) {
            throw new Error('Could not fetch data');
          }
          const data = await response.json();
          return data;
        },
      });
    });
  }

  onModeChange(val: boolean) {
    if (val) {
      this.switchToMultiMode();
    } else {
      this.fetch();
    }
  }

  fetchWithError() {
    this.fetch('assets/weatherx.json');
  }

  switchToMultiMode() {
    const url = 'assets/weather-multi.json';
    runInInjectionContext(this.injector, () => {
      this.weatherResource = resource<WeatherData, City>({
        request: () => {
          return this.city();
        },
        loader: async ({ abortSignal }) => {
          const response = await new Promise<Response>((resolve) => {
            setTimeout(() => {
              fetch(url, { signal: abortSignal }).then((r) => resolve(r));
            }, 1500);
          });
          if (!response.ok) {
            throw new Error('Could not fetch data');
          }
          const data = await response.json();
          const weatherInfo = (data as WeatherData[]).find(
            (obj) => obj.city === this.city()
          );
          if (!weatherInfo) {
            throw new Error('Weather info not found');
          }
          return weatherInfo;
        },
      });
    });
  }
}
