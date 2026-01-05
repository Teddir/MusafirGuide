import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsSheet } from './results-sheet';

describe('ResultsSheet', () => {
  let component: ResultsSheet;
  let fixture: ComponentFixture<ResultsSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsSheet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
