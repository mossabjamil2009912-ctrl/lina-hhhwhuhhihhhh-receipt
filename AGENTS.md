<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Offline Android app (PWA for PWABuilder): service worker comes only from vite-plugin-pwa generateSW in vite.config.ts with outDir/globDirectory `dist/client`, registered only from `src/lib/pwa.ts`. Why: the client build lives in dist/client; anywhere else the worker is not served.
- All app data and the login check stay on the device (localStorage + hashed password in `src/lib/gate.ts`), with no server calls. Why: the app must work fully offline.
- Service worker updates are forced: UpdatePrompt checks on open and applies any downloaded version immediately (findUpdate/applyUpdate in src/lib/pwa.ts); Profile's «تحديث بيانات التطبيق» still checks manually. Why: user wants mandatory updates.
