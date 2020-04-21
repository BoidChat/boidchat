import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SketchScreenComponent } from './sketch-screen.component';

describe('SketchScreenComponent', () => {
  let component: SketchScreenComponent;
  let fixture: ComponentFixture<SketchScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SketchScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SketchScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
