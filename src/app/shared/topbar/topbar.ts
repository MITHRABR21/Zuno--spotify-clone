import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {

  constructor(
    private readonly router: Router
  ) {}

  goBack(): void {
    window.history.back();
  }

  goForward(): void {
    window.history.forward();
  }

  onSearchInput(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const query =
      input.value.trim();

    if (!query) {

      this.router.navigate(
        ['/search']
      );

      return;
    }

    this.router.navigate(
      ['/search'],
      {
        queryParams: {
          q: query
        },
        replaceUrl: true
      }
    );

  }

  openSearch(): void {

    this.router.navigate(
      ['/search']
    );

  }

}