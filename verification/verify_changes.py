from playwright.sync_api import sync_playwright, expect
import re
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file
        filepath = f"file://{os.getcwd()}/index.html"
        print(f"Loading {filepath}")
        page.goto(filepath)

        # Wait for React to mount (look for text that React renders)
        # "AI Studio Cleaner" is rendered by React
        expect(page.get_by_text("AI Studio Cleaner")).to_be_visible(timeout=10000)

        # 1. Verify Version
        version_locator = page.get_by_text("v1.2.8")
        expect(version_locator).to_be_visible()
        print("✅ Version v1.2.8 is visible")

        # 2. Verify Touch Manipulation on Input
        # The input is hidden (opacity-0), so we might need to be careful with visibility checks.
        # It's an input[type='file'].
        file_input = page.locator("input[type='file']")

        # Check if class contains 'touch-manipulation'
        # We can use get_attribute
        class_attr = file_input.get_attribute("class")
        if "touch-manipulation" in class_attr:
            print("✅ Input has touch-manipulation class")
        else:
            print(f"❌ Input missing touch-manipulation class. Found: {class_attr}")
            exit(1)

        # Take screenshot
        page.screenshot(path="verification/verification.png")
        print("📸 Screenshot saved to verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run()
