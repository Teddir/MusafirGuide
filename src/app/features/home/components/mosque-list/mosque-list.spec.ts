import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MosqueList } from './mosque-list';

describe('MosqueList', () => {
  let component: MosqueList;
  let fixture: ComponentFixture<MosqueList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MosqueList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MosqueList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
