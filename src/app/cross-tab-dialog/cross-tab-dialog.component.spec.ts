import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossTabDialogComponent } from './cross-tab-dialog.component';

describe('CrossTabDialogComponent', () => {
  let component: CrossTabDialogComponent;
  let fixture: ComponentFixture<CrossTabDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrossTabDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossTabDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
