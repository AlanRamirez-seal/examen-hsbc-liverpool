# Test Automation Strategy - Liverpool Challenge

## 1. What would you not automate in this flow, and why?
* **Third-Party CAPTCHA / Anti-Bot Muros:** I wouldn't waste time trying to automate a bypass for Akamai or Cloudflare security walls. These systems update constantly, which makes automated scripts extremely flaky and prone to breaking every single day.
* **Visual Marketing Elements:** Banners and promotional carousels inside Liverpool change all the time. Automating checks for them adds zero value to the actual search or checkout flow and just creates a huge maintenance headache.
* **Tracking & Analytics Tags:** Checking if Google Analytics or pixel payloads fire correctly on every single E2E run slows down the execution significantly. This should be handled with isolated API/Contract testing, not full UI integration.

## 2. How to handle CAPTCHA if added to the search flow?
If Liverpool forces a CAPTCHA screen into the main search flow, I would address it using these industry workarounds:
* **Whitelisting in QA Environments:** Work with the DevOps/SecOps teams to completely disable Akamai or CAPTCHA inside the staging environment, or whitelist the specific IP addresses of our CI/CD pipeline.
* **Cookie and Token Injection:** Capture a valid session token or authentication cookie from a real browser session and inject it directly into Playwright's context before the test starts to completely skip the security checkpoint.
* **Custom Headers (Feature Flags):** Ask the backend team to enable a specific bypass header (like `X-Automation-Testing: True`) that allows our automation scripts to jump the CAPTCHA logic safely during automated runs.

## 3. Flakiness Risks & Mitigation Strategies
We ran into two major flakiness issues during development on Liverpool and fixed them directly in the framework:
* **Responsive Layout Hiding Elements:** Depending on the viewport or when running in headless mode, the standard "Sort by" dropdown gets hidden or restructured in the DOM, making traditional `.click()` events fail after a timeout.
  * *Mitigation:* Built an internal **URL Parameter Fallback** (`sortBy=price|0`). If the UI click fails, the framework automatically catches the error and forces a native query parameter redirect to keep the test moving forward.
* **Asynchronous Decimal (Centavos) Rendering:** Liverpool loads price containers in a legacy structure that sometimes duplicates numbers or renders centavos in separate accessibility hidden layers, returning `$0` or weird numbers like `2202600`.
  * *Mitigation:* Swapped out blind string splitting for a tight regex match (`match(/\d+/)`) mixed with a hybrid API validation layer to cross-check numbers against the raw service layer data.

## 4. Scaling in a CI Pipeline (50+ Test Suites)
To scale this project so it can run efficiently alongside 50 or more test suites in a continuous deployment pipeline, I would implement:
* **Parallel Workers and Sharding:** Leverage Playwright's native sharding capability to split up test files across multiple Docker containers running concurrently, reducing the total pipeline run time from hours to minutes.
* **API Blending (Smart Pre-conditions):** Instead of forcing every single test case to navigate the UI, search, and filter from scratch, I would use direct API requests to inject the required state or cart items, leaving full UI automation exclusively for critical smoke paths.
* **Smart Failure Artifacts:** Set `retries: 2` inside `playwright.config.js` only for CI environments, and configure video/trace recording to save *only on failure* to save storage and keep the execution light.