import { Component, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type City = 'Stockholm' | 'Milan';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  city?: City;
}

type WeatherRequestState = 'idle' | 'ready' | 'simulateError';

type WeatherResourceConfig = {
  requestState: WeatherRequestState;
  city?: City;
  isMultiCityMode: boolean;
};

@Component({
  selector: 'app-weather-info',
  imports: [FormsModule],
  template: `
    <div class="card bg-base-200 w-96 shadow-xl mx-auto">
      <div class="card-body flex flex-col items-center gap-4">
        <div class="form-control w-full">
          <label class="label cursor-pointer">
            <span class="label-text">Multicity</span>
            <input
              (ngModelChange)="getWeatherInfo()"
              [(ngModel)]="isMultiCityMode"
              type="checkbox"
              class="toggle toggle-primary"
            />
          </label>
        </div>
        @if (isMultiCityMode()) {
        <select [(ngModel)]="selectedCity" class="select select-primary w-full">
          @for(city of cities; track city) {
          <option [value]="city">{{ city }}</option>
          }
        </select>
        } @else {
        <button
          class="btn btn-block btn-primary btn-outline"
          (click)="getWeatherInfo()"
        >
          Get Weather Info
        </button>
        }
        <button
          class="btn btn-block btn-error btn-outline"
          (click)="getWeatherInfoWithError()"
        >
          Get Weather Info with error
        </button>
        @if (weatherResource.isLoading()) {
        <span class="loading loading-spinner loading-lg"></span>
        } @else if (weatherResource.error()) {
        <div role="alert" class="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ weatherResource.error() }}</span>
        </div>
        } @else if (weatherResource.value()) {
        <img
          [src]="weatherResource.value()?.icon"
          class="w-20 object-fit"
          alt="weather icon"
        />
        <p class="text-2xl">
          Temperature: {{ weatherResource.value()?.temperature }}
        </p>
        <p class="text-xl">
          Condition: {{ weatherResource.value()?.condition }}
        </p>
        }
      </div>
    </div>
  `,
})
export class WeatherInfoComponent {
  cities: City[] = ['Stockholm', 'Milan'];
  isMultiCityMode = signal<boolean>(false);
  selectedCity = signal<City>(this.cities[0]);
  weatherRequestState = signal<WeatherRequestState>('idle');
  weatherResource = resource<
    WeatherData | undefined,
    WeatherResourceConfig | undefined
  >({
    request: () => {
      if (this.weatherRequestState() == 'idle') {
        return undefined;
      }
      return {
        requestState: this.weatherRequestState(),
        city: this.selectedCity(),
        isMultiCityMode: this.isMultiCityMode(),
      };
    },
    loader: async ({ abortSignal, request: requestConfig }) => {
      if (!requestConfig) {
        return undefined;
      }
      const { requestState, city, isMultiCityMode } = requestConfig;
      const response = await new Promise<Response>((resolve) => {
        setTimeout(() => {
          const url = isMultiCityMode
            ? 'assets/weather-multi.json'
            : 'assets/weather.json';
          fetch(url, { signal: abortSignal }).then((r) => resolve(r));
        }, 1500);
      });
      if (!response.ok) {
        throw new Error('Could not fetch data');
      }
      if (requestState === 'simulateError') {
        throw new Error('Something went wrong');
      }
      const data = await response.json();
      if (isMultiCityMode) {
        const weatherInfo = (data as WeatherData[]).find(
          (info) => info.city === city
        );
        if (!weatherInfo) {
          throw new Error('Weather info not found');
        }
        return weatherInfo;
      }
      return data as WeatherData;
    },
  });

  getWeatherInfo() {
    if (this.weatherRequestState() !== 'ready') {
      this.weatherRequestState.set('ready');
    } else {
      this.weatherResource.reload();
    }
  }

  getWeatherInfoWithError() {
    this.weatherRequestState.set('simulateError');
  }
}
