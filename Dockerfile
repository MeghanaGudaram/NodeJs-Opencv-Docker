FROM ubuntu

WORKDIR /opencv4nodejs

ADD . /opencv4nodejs

RUN apt-get update && apt-get install -y libgtk2.0-dev pkg-config cmake curl git

RUN apt-get install -y npm && npm install -g n && n stable

RUN npm install

RUN echo "/opencv4nodejs/node_modules/opencv-build/opencv/build/lib" > /etc/ld.so.conf.d/opencv.conf && ldconfig -v

#sudo docker run --net=host -ti d073fd2256bd /bin/bash
