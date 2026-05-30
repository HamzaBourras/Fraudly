import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterForm } from './chapter-form';

describe('ChapterForm', () => {
  let component: ChapterForm;
  let fixture: ComponentFixture<ChapterForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ChapterForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
