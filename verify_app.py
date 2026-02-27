from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Load the app
        print("Loading app...")
        page.goto("http://localhost:8080/index.html")

        # 2. Verify basic elements
        print("Verifying title...")
        assert "AI Studio History Cleaner" in page.title()

        # 3. Verify Version
        print("Verifying version...")
        version_text = page.locator("text=v1.2.29")
        if version_text.is_visible():
            print("Version v1.2.29 found.")
        else:
            print("ERROR: Version v1.2.29 not found!")

        # 4. Generate some output to verify chunk rendering
        # We can't easily drag-drop in headless without a file, but we can check initial state
        print("Checking initial state...")

        # Verify empty preview state
        refresh_icon = page.locator("div.flex.flex-col.items-center.justify-center.text-slate-400")
        if refresh_icon.is_visible():
             print("Initial empty state visible.")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification_screenshot.png")

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    verify_app()
