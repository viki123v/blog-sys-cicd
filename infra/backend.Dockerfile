FROM ubuntu:22.04
LABEL org.opencontainers.image.description="Backend Docker image for Blog Sys application"

WORKDIR /app
RUN apt-get update && \
    apt-get install -y curl 

ADD https://astral.sh/uv/0.9.2/install.sh uv-installer.sh

RUN sh uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"
RUN rm uv-installer.sh 

COPY ./backend . 

RUN uv sync --locked --no-dev 

EXPOSE 80

ENTRYPOINT [ "uv", "run", "--no-dev", "fastapi" , "run", "src/main.py", "--port", "80" ]

