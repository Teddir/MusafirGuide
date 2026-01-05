import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { ComparisonComponent } from './features/comparison/comparison';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'comparison', component: ComparisonComponent },
  { path: '**', redirectTo: '' }
];
