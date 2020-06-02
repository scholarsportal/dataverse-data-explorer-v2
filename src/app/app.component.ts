import { Component } from '@angular/core';
import { MatomoInjector } from 'ngx-matomo';
import { ConfigService } from './config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private config: ConfigService,
    private matomoInjector: MatomoInjector
  ) {
    this.matomoInjector.init(this.config.baseUrl, this.config.id);
  }
  title = 'data-explorer';
}

