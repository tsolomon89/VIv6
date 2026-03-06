# Deployment Guide

This guide describes how to deploy the Victory Initiative v5 (Keimenon) generated sites.

## 1. Build a Specific Tenant Brand

For production, build a single tenant scope to keep artifacts focused.

```bash
# Build the 'keimenon' tenant
npm run build:brand -- --brand=keimenon
```

Output folder resolution:
- `dist/<hostname>/index.html` when the tenant has an active primary domain
- `dist/<tenant_slug>/index.html` when no active primary domain is configured

## 2. Verify All Seeded Brand Builds

Run this CI-equivalent gate before deploy:

```bash
npm run build:verify:brands
```

This reads all tenant slugs from `data/seeds/tenants/*.json`, runs `build:brand` for each, and fails fast if any expected artifact is missing.

## 3. Deploying

### Option A: Static Host (Netlify, Vercel, Surge)
1.  Navigate to the resolved brand output folder (`dist/<hostname>` or `dist/<tenant_slug>`).
2.  Deploy this folder as your site root.
    *   **Netlify**: Drag and drop the folder into the "Deploys" tab.
    *   **Surge**: Run `surge dist/<hostname-or-tenant_slug>`.

### Option B: ZIP Handover
If you need to send the site to a client:

1.  Run the zip script (requires `build:brand` first):
    ```bash
    npm run zip
    ```
    *Note: You may need to adjust the `zip` script in `package.json` to target the specific brand folder if you want a cleaner zip.*

2.  Alternatively, manually zip the resolved output folder.

## 4. SEO & Analytics

*   **Meta Tags**: Managed in the Studio via the Brand record's Settings page.
*   **GTM/Analytics**: Injected automatically during build based on the Brand record configuration.
    *   To update GTM IDs, edit the Brand record in the Studio at `/settings`.

## 5. Troubleshooting

*   **Missing Styles**: Ensure the `assets/` folder is relative to `index.html`. The build output is self-contained.
*   **3D Scene Errors**: Check the console. The theme relies on `window.VI_CONFIG` being present in the HTML.
