data "external_schema" "sqlalchemy" {
  program = [
    "python3",
    "-m",
    "src.load_models"
  ]
}

env "sqlalchemy" {
  src = data.external_schema.sqlalchemy.url
  dev = "postgresql://env.POSTGRES_USER:env.POSTGRES_PASSWORD@env.DB_HOST:env.DB_PORT/env.POSTGRES_DB?search_path=public"

  migration {
    dir = "file://migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
