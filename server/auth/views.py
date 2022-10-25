import os
from flask import Blueprint, request, Response
from flask_cors import CORS
import requests

from .middleware import secure_token_required

from server.user.models import User

ELASTICSEARCH_CONTAINER_URL = os.getenv(
    'ELASTICSEARCH_CONTAINER_URL', "https://www.openml.org/es/")
BACKEND_CONTAINER_URL = os.getenv(
    'BACKEND_CONTAINER_URL', "https://www.openml.org/")
AUTH_URL_PREFIX = os.getenv('AUTH_URL_PREFIX', "/secure")


auth_bluetprint = Blueprint(
    "auth",
    __name__,
    static_folder="server/src/client/app/build",
    url_prefix=AUTH_URL_PREFIX
)

CORS(auth_bluetprint)


@auth_bluetprint.route("/es/", defaults={'u_path': ''})
@auth_bluetprint.route("/es/<path:u_path>", methods=["GET", "POST"])
@secure_token_required
def esAuthRoutes(u_path):
    params = request.args.to_dict()
    print(params)
    if request.method == 'GET':
        response = requests.get(
            ELASTICSEARCH_CONTAINER_URL + u_path, params=params)
        return response.content, response.status_code, {'Content-Type': response.headers.get('content-type')}
    if request.method == 'POST':
        data = request.data
        headers = request.headers
        response = requests.post(
            ELASTICSEARCH_CONTAINER_URL + u_path, data=data, params=params, headers=headers)
        return response.content, response.status_code, {'Content-Type': response.headers.get('content-type')}

    return Response("No data", 404)


@auth_bluetprint.route("/php/", defaults={'u_path': ''})
@auth_bluetprint.route("/php/<path:u_path>", methods=["GET", "POST"])
@secure_token_required
def phpAuthRoutes(u_path):
    params = request.args.to_dict()
    print(params)
    if request.method == 'GET':
        response = requests.get(
            BACKEND_CONTAINER_URL + u_path, params=params)
        return response.content, response.status_code, {'Content-Type': response.headers.get('content-type')}
    if request.method == 'POST':
        data = request.data
        headers = request.headers
        response = requests.post(
            ELASTICSEARCH_CONTAINER_URL + u_path, data=data, params=params, headers=headers)
        return response.content, response.status_code, {'Content-Type': response.headers.get('content-type')}

    return Response("No data", 404)
