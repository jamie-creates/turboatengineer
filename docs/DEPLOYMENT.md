# Azure deployment

The user selected Azure and supplied anemkai.com and the GitHub repository. No alternate hosting service is used.

## Provisioned hosting (September 9, 2026)

- Subscription: Visual Studio Enterprise Subscription.
- Resource group: `turboat-engineer-rg`, West US 2.
- Static Web App: `turboat-engineer`, Free plan.
- Azure address: https://red-river-0895c9d1e.5.azurestaticapps.net
- GitHub deployment secret is configured; pushes to main deploy after checks pass.
- Confirmed custom domain: `anemkai.com`. Azure domain validation is pending DNS changes at GoDaddy.

GoDaddy DNS records to connect the root domain:

| Type | Name | Value |
| --- | --- | --- |
| TXT | @ | `_w3b1gvw7sdh320v7lecgf40hkba9pti` |
| A | @ | `20.252.61.163` |

The TXT value is a public domain ownership validation record, not a deployment credential. Keep other TXT and mail records. The A value comes from this app's `stableInboundIP`; do not resolve the generated hostname to guess an IP. This root-domain method uses a regional endpoint rather than global DNS distribution. See [Microsoft's apex-domain instructions](https://learn.microsoft.com/en-us/azure/static-web-apps/apex-domain-external). Verify DNS, Azure domain validation, and HTTPS before treating the custom domain as live.

## First deployment

1. Create an Azure Static Web App named something like `turboat-engineer` in the user's chosen subscription/resource group. Use the Free tier for the initial static prototype if its current limits meet the intended use.
2. The repository already supplies its workflow. Choose a deployment setup that permits using that existing workflow rather than adding a duplicate.
3. Copy the resource's deployment token into the GitHub repository Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN`. Never commit the token.
4. Run the Build and deploy workflow on main. It builds with Node 24, tests the simulation, and uploads only `dist/client`; Azure's app build is skipped.
5. Test the generated HTTPS Azure URL.
6. In Custom domains, add `anemkai.com`. Use TXT ownership validation and the app's stable inbound IP for the GoDaddy apex A record, as recorded above.
7. Wait for validation and the managed HTTPS certificate, then test the custom domain on the iPhone/iPad.
8. Safari → Share → Add to Home Screen.

The deployment step is skipped when the token is not configured. Builds still produce a downloadable artifact in GitHub Actions.

Build and deployment run as separate jobs. Lint, simulation tests, and the production build must pass before deployment. The deployment token is only supplied to the hosting check and Azure upload; dependency installation and game tests do not receive it. Production uploads run one at a time. The Actions summary explicitly says whether hosting is unconfigured or an upload completed.

For a rollback, revert the problematic change on `main` and push. The same checks and deployment then publish the restored source. Existing installed clients may continue using the previous service worker until all game windows are closed and reopened; local saves remain in the browser.

## Planned online architecture

- SWA: public application files, HTTPS, custom domain.
- Identity provider: consumer-friendly sign-in (provider choice still pending).
- Azure Functions API: authorize player-specific access and calculate/validate progression changes.
- Database: players, versioned boat designs, component inventory, engine builds, event results.
- Device cache: offline guest progress, with an explicit merge policy before cross-device synchronization.
- A linked standalone Functions app and custom SWA authentication may require the Standard plan; confirm the current plan requirements when provisioning.
- Real-time multiplayer is outside this prototype. Computer opponents run locally.

No Azure resource, subscription, or DNS record should be assumed to exist merely because these files are present.

References:

- [SWA build configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Custom domains](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain)
- [Authentication](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-authorization)
- [Linked Azure Functions](https://learn.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own)

## Validation notes

The Windows build wrapper allows a successful Vinext CLI run to exit naturally so native bundler handles can close. Nonzero failures are preserved. CI uses Linux.

The production dependency audit reports no advisories. Four development-only advisories remain in the unused Cloudflare tooling dependency chain (sharp/miniflare). These packages are not included in the Azure static artifact.

The optional WebMCP read-back tool is feature-detected. No supported validation context was available; its browser integration is not verified.
