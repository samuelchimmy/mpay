from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # 1. Verify "Claim Faucet" in Testnet
    print("Switching to Testnet...")
    page.get_by_role("button", name="MAINNET").click()
    page.wait_for_timeout(500)
    page.get_by_text("testnet").last.click()
    page.wait_for_timeout(1000)

    # Check if Claim Faucet button is there
    faucet_btn = page.get_by_role("button", name="Claim Faucet")
    if faucet_btn.is_visible():
        print("SUCCESS: Claim Faucet button visible in Testnet.")
    else:
        print("FAILURE: Claim Faucet button NOT visible.")

    # 2. Verify "Quick Paste" button
    print("Checking Quick Paste button...")
    paste_btn = page.get_by_role("button", name="Quick Paste")
    if paste_btn.is_visible():
        print("SUCCESS: Quick Paste button visible.")
        # Note: Testing actual clipboard in headless playwright is flaky,
        # so we mostly verify the UI and that it doesn't crash.
    else:
        print("FAILURE: Quick Paste button NOT visible.")

    page.screenshot(path="/home/jules/verification/screenshots/final_verify.png")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant clipboard permissions
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800},
            permissions=['clipboard-read', 'clipboard-write']
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
