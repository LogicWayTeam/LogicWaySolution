from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By

from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
# from webdriver_manager.firefox import GeckoDriverManager
# from webdriver_manager.microsoft import EdgeChromiumDriverManager

def fetch_schedule_table(url):
    options = Options()
    options.headless = True
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)

    try:
        driver.get(url)

        element = driver.find_element(By.XPATH,
                                      '/html/body/app-root/div/div/app-schedules-line/app-bottom-sheet/div/div[2]/div/app-schedules-line-tabs/app-tab-group/div/app-tab-body[1]/div/div/app-schedules-graph')
        data = element.text
    except Exception as e:
        data = f"Error: {e}"
    finally:
        driver.quit()

    return data
