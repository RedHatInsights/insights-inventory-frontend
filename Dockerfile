FROM registry.access.redhat.com/ubi8/nginx-118
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
