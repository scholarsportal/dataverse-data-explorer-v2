import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VarSumStatDialogComponent } from './var-sum-stat-dialog.component';

describe('VarSumStatDialogComponent', () => {
  let component: VarSumStatDialogComponent;
  let fixture: ComponentFixture<VarSumStatDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VarSumStatDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VarSumStatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
