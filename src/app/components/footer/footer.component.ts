import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {

  currentYear = new Date().getFullYear();
  currentQuote = '';

  retroQuotes = [
    "Not all journeys arrive on time.",
    "The road knows secrets we've forgotten.",
    "Every ticket is a promise to the horizon.",
    "We don't travel to escape life, but for life not to escape us.",
    "The night bus carries more than passengers.",
    "Some destinations only exist after midnight.",
    "Trust the route. Trust the journey.",
    "Every empty seat has a story waiting.",
    "The best views come after the hardest climbs.",
    "A traveler without observation is a bird without wings."
  ];

  ngOnInit(): void {
    this.currentQuote = this.retroQuotes[Math.floor(Math.random() * this.retroQuotes.length)];
  }

  get dynamicYear(): string {
    const baseYear = 1952;
    const yearsActive = this.currentYear - baseYear;
    return `${baseYear} - ${this.currentYear} (${yearsActive} years of journeys)`;
  }
}
