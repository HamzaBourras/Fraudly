import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapiterDetail } from './chapiter-detail';

describe('ChapiterDetail', () => {
  let component: ChapiterDetail;
  let fixture: ComponentFixture<ChapiterDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapiterDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ChapiterDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
