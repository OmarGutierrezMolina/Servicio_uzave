#Dockerfile nodejs-8 RHEL

#FROM harbor.sb.cl/imagenes-rhel/rhel7-nodejs8
FROM harbor.sb.cl/imagenes-nodejs/node-instantclient:8-centos

# Autor
MAINTAINER Mauricio Villagran Mora

# Se define como variable de ambiente directorio de trabajo
ENV appDir /opt/app-root/src

#Se especifica directorio de trabajo
WORKDIR ${appDir}

#RUN yum install npm -y
RUN adduser dockeruser

# Se crea el directorio antes definido
RUN mkdir -p $appDir

# Se empaqueta el código fuente
ADD . $appDir

# Se instalan dependencias especificadas en package.json
RUN npm install

# Se define puerto a exponer
EXPOSE 8080

USER dockeruser

# Se inicia aplicacion
ENTRYPOINT ["npm"]
CMD ["start"] 
