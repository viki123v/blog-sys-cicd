import os
from pathlib import Path

root_dir = Path(__file__).parent.parent

OBJECT_URL = os.getenv("OBJECT_URL")
TYPE = os.getenv("TYPE")
