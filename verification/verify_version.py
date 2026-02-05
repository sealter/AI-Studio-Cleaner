from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file
        filepath = f"file://{os.getcwd()}/index.html"
        print(f"Loading {filepath}")
        page.goto(filepath)

        # Wait for React to mount
        expect(page.get_by_text("AI Studio Cleaner")).to_be_visible(timeout=10000)

        # Verify Version v1.2.9
        version_locator = page.get_by_text("v1.2.9")
        expect(version_locator).to_be_visible()
        print("✅ Version v1.2.9 is visible")

        # Take screenshot
        page.screenshot(path="verification/version_verification.png")
        print("📸 Screenshot saved to verification/version_verification.png")

        browser.close()

if __name__ == "__main__":
    run()
