#!/bin/bash
env                                           >> /tmp/.env
cat /tmp/.env                                 >> /etc/cron.d/gmail
echo -n "$TASK_SCHEDULE" | cat - /tmp/crontab >> /etc/cron.d/gmail
cron && tail -f /var/log/cron.log
/etc/init.d/cron restart
