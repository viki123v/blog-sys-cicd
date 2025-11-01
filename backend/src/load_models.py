# it doesn't provide types
from atlas_provider_sqlalchemy.ddl import print_ddl  # type: ignore

from src.models import Blog, BlogUser

print_ddl("postgresql", [BlogUser, Blog])
