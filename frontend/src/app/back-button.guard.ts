import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BackButtonGuard
  implements CanDeactivate<any>
{
  canDeactivate(): boolean {
    // Check if the user is allowed to navigate away from the game.
    // You may want to prompt the user to confirm leaving the game.
    const confirmExit = window.confirm('Are you sure you want to leave the game?');
    return false;
  }
}