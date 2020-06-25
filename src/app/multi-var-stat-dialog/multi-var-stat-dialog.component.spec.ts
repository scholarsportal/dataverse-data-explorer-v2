import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiVarStatDialogComponent } from './multi-var-stat-dialog.component';

describe('MultiVarStatDialogComponent', () => {
  let component: MultiVarStatDialogComponent;
  let fixture: ComponentFixture<MultiVarStatDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiVarStatDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiVarStatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
