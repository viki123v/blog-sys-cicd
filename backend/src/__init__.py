import os
from pathlib import Path

from dotenv import load_dotenv

root_dir=Path(__file__).parent.parent

load_dotenv(dotenv_path=root_dir / ".security.env")
load_dotenv(dotenv_path=root_dir / ".db.env")
load_dotenv(dotenv_path=root_dir / '.object-storage.env')

OBJECT_URL=os.getenv("OBJECT_URL")
TYPE=os.getenv("TYPE")