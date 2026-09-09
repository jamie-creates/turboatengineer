# Azure deployment

The user selected Azure and supplied anemkai.com and the GitHub repository. No alternate hosting service is used.

## First deployment

1. Create an Azure Static Web App named something like `turboat-engineer` in the user's chosen subscription/resource group. Use the Free tier for the initial static prototype if its current limits meet the intended use.
2. The repository already supplies its workflow. Choose a deployment setup that permits using that existing workflow rather than adding a duplicate.
3. Copy the resource's deployment token into the GitHub repository Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN`. Never commit the token.
4. Run the Build and deploy workflow on main. It builds with Node 24, tests the simulation, and uploads only `dist/client`; Azure's app build is skipped.
5. Test the generated HTTPS Azure URL.
6. In Custom domains, add `boats.anemkai.com`. Add the exact CNAME/TXT values Azure provides at the domain's DNS provider. Do not guess those targets or overwrite the apex domain.
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
