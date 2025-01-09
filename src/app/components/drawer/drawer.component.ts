import { Component, input } from '@angular/core';
import { Route, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-drawer',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent {
  links = input.required<Route[]>();
}
