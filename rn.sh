# docker-machine start default
eval $(docker-machine env default)
docker build -t some-nginx -f Dockerfile .
docker run -d -p 8000:80 some-nginx 
