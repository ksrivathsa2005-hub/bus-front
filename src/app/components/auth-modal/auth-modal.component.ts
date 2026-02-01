import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss'
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();

  private router = inject(Router);

  goToLogin(): void {
    this.close.emit();
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.close.emit();
    this.router.navigate(['/register']);
  }

  closeModal(): void {
    this.close.emit();
  }
}
