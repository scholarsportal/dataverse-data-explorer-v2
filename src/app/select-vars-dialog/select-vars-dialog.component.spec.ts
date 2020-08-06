import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectVarsDialogComponent } from './select-vars-dialog.component';

describe('SelectVarsDialogComponent', () => {
  let component: SelectVarsDialogComponent;
  let fixture: ComponentFixture<SelectVarsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectVarsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectVarsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
