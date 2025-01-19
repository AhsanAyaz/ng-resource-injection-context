import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { appRoutes } from './app.routes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, DrawerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  links = appRoutes.filter((r) => !!r.path);
  isDrawerOpen = signal<boolean | undefined>(undefined);

  toggleDrawer() {
    this.isDrawerOpen.update((val) => !Boolean(val));
  }
}
