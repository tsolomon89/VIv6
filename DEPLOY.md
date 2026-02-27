# Deployment Guide

This guide describes how to deploy the Victory Initiative v5 (Keimenon) generated sites.

## 1. Build a Specific Brand

For production, you typically want to build a single brand to keep the artifact small and focused.

```bash
# Build the 'oblio' brand
npm run build:brand -- --brand=oblio
```

This will create:
`dist/oblio/index.html` (and associated assets)

## 2. Deploying

### Option A: standard Static Host (Netlify, Vercel, Surge)
1.  Navigate to `dist/oblio`.
2.  Deploy this folder as your site root.
    *   **Netlify**: Drag and drop the folder into the "Deploys" tab.
    *   **Surge**: Run `surge dist/oblio`.

### Option B: ZIP Handover
If you need to send the site to a client:

1.  Run the zip script (requires `build:brand` first):
    ```bash
    npm run zip
    ```
    *Note: You may need to adjust the `zip` script in `package.json` to target the specific brand folder if you want a cleaner zip.*

2.  Alternatively, manually zip `dist/oblio`.

## 3. SEO & Analytics

*   **Meta Tags**: Managed via the Admin UI in the Brand entity.
*   **GTM/Analytics**: Injected automatically during build based on the "Brand Config" entity in the database.
    *   To update GTM IDs, edit the Brand entity in the Admin UI.

## 4. Troubleshooting

*   **Missing Styles**: Ensure the `assets/` folder is relative to `index.html`. The build output is self-contained.
*   **3D Scene Errors**: Check the console. The theme relies on `window.VI_CONFIG` being present in the HTML.
