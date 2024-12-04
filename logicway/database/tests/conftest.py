import logging
import pytest

@pytest.fixture(autouse=True)
def setup_logging():
    # Настройка уровня логирования
    logging.basicConfig(
        level=logging.INFO,  # Можно заменить на DEBUG, WARNING и т.д.
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
