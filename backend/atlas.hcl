data "external_schema" "sqlalchemy" {
  program = [
    "python3",
    "-m",
    "src.load_models"
  ]
}

env "sqlalchemy" {
  src = data.external_schema.sqlalchemy.url

  migration {
    dir = "file://migrations"
  }

  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
