#!/bin/bash

NAME="docker"
SERVER="docker.io"
USERNAME="user"
PASSWORD="pass"
DESTINATION="docker-config.yaml"
NAMESPACE="default"

kubectl create secret docker-registry $NAME \
    --dry-run=client \
    --docker-server=$SERVER \
    --docker-username=$USERNAME \
    --docker-password=$PASSWORD \
    --namespace=$NAMESPACE \
    -o yaml > $DESTINATION
