FROM node:latest
RUN apt-get update && apt-get install -y cron

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

ADD ./crontab /tmp/crontab

RUN touch /etc/cron.d/gmail
RUN chmod 0644 /etc/cron.d/gmail
RUN touch /var/log/cron.log

ADD ./scripts/setup-cron.sh /tmp/setup-cron.sh
RUN chmod +x /tmp/setup-cron.sh
RUN /etc/init.d/cron start

CMD ["/tmp/setup-cron.sh"]
