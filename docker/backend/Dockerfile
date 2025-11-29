###########
# BUILDER #
###########

FROM harbor.gd-urengoy.gazprom.ru/docker_hub/python:3.11-slim as builder

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./docker/backend/root.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
RUN rm -rf /etc/apt/sources.list && rm -rf /etc/apt/sources.list.d/*
RUN echo "deb [trusted=yes] https://repo.gd-urengoy.gazprom.ru/repository/debian-bookworm/ bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list

COPY ../../../backend/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt

#########
# FINAL #
#########

FROM harbor.gd-urengoy.gazprom.ru/docker_hub/python:3.11-slim

COPY ./docker/backend/root.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
RUN rm -rf /etc/apt/sources.list && rm -rf /etc/apt/sources.list.d/*
RUN echo "deb [trusted=yes] https://repo.gd-urengoy.gazprom.ru/repository/debian-bookworm/ bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list

RUN mkdir -p /home/app

RUN addgroup --system app && useradd -g app app

ENV HOME=/home/app
ENV APP_HOME=/home/app/web
RUN mkdir $APP_HOME
RUN mkdir $APP_HOME/static
RUN mkdir $APP_HOME/media
WORKDIR $APP_HOME

COPY --from=builder /usr/src/app/wheels /wheels

RUN pip install --no-cache /wheels/* -i https://repo.gd-urengoy.gazprom.ru/repository/pypi-org-proxy/simple --trusted-host repo.gd-urengoy.gazprom.ru

COPY ./docker/backend/entrypoint.sh .
RUN sed -i 's/\r$//g' $APP_HOME/entrypoint.sh
RUN chmod +x $APP_HOME/entrypoint.sh

COPY ../../../backend $APP_HOME

RUN chown -R app:app $APP_HOME

USER app

ENTRYPOINT ["/home/app/web/entrypoint.sh"]
