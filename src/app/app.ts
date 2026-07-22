import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandService } from '@app/core/brand';
import { SolarEnvironmentService } from '@app/core/solar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly solar = inject(SolarEnvironmentService);
  private readonly brand = inject(BrandService);

  constructor() {
    // Bootstrap global solar theme once for the whole app.
    this.solar.currentHours();
    this.brand.applyDocumentMeta();
  }
}
