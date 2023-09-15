import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BackButtonGuard
  implements CanDeactivate<any>
{
  constructor(private router: Router){}
  canDeactivate(): boolean {
    this.router.navigate([`/game/`]);
    return false;
  }
}