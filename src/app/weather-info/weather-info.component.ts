import { Component, resource } from '@angular/core';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

@Component({
  selector: 'app-weather-info',
  template: `
    <div class="card bg-base-200 w-96 shadow-xl mx-auto">
      <div class="card-body flex flex-col items-center gap-4">
        <button
          class="btn btn-block btn-primary btn-outline"
          (click)="weatherResource.reload()"
        >
          Fetch Weather
        </button>
        @if (weatherResource.isLoading()) {
        <span class="loading loading-spinner loading-lg"></span>
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
  weatherResource = resource<WeatherData, string>({
    loader: async ({ abortSignal }) => {
      const response = await new Promise<Response>((resolve) => {
        setTimeout(() => {
          fetch('assets/weather.json', { signal: abortSignal }).then((r) =>
            resolve(r)
          );
        }, 1500);
      });
      if (!response.ok) {
        throw new Error('Could not fetch data');
      }
      const data = await response.json();
      return data as WeatherData;
    },
  });
}
