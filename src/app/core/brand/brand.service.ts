import { Injectable, computed, signal } from '@angular/core';

export type SiteBrand = 'korath' | 'patelnia';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly brand = signal<SiteBrand>(BrandService.resolveBrand());

  readonly siteBrand = this.brand.asReadonly();
  readonly isPatelnia = computed(() => this.brand() === 'patelnia');
  readonly siteName = computed(() => (this.brand() === 'patelnia' ? 'Patelnia' : 'Korath'));
  readonly mainTitle = computed(() =>
    this.brand() === 'patelnia' ? 'PATELNIA.OVH' : 'KORATH.OVH',
  );
  readonly mainTitleParts = computed(() => {
    const title = this.mainTitle();
    const [left, right] = title.split('.');
    return { left, right: right ?? 'OVH' };
  });
  readonly documentTitle = computed(() => `${this.siteName()}.ovh | Pustynia Korath`);
  readonly metaDescription = computed(
    () =>
      `${this.siteName()}.ovh — pustynna kraina z cyklem dnia i nocy Warszawy. Bezkresne morze piasku, żar lejący się z nieba i fatamorgany.`,
  );

  applyDocumentMeta(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.title = this.documentTitle();

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', this.metaDescription());
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', this.documentTitle());
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      const host = this.brand() === 'patelnia' ? 'https://patelnia.ovh' : 'https://korath.ovh';
      ogUrl.setAttribute('content', host);
    }
  }

  private static resolveBrand(hostname = globalThis.location?.hostname ?? ''): SiteBrand {
    const host = hostname.toLowerCase();
    if (host === 'patelnia.ovh' || host.endsWith('.patelnia.ovh')) {
      return 'patelnia';
    }
    return 'korath';
  }
}
