from functools import wraps

from flask import request, Response
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request_optional
from werkzeug.datastructures import ImmutableMultiDict

from server.user.models import User


def secure_token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if Optional JWT token is present and make it available
        verify_jwt_in_request_optional()
        current_user = get_jwt_identity()
        jwt_user = User.query.filter_by(email=current_user).first()

        # Get API token from request params
        params = request.args.to_dict()
        api_key = params.get('api_key')
        api_key_user = User.query.filter_by(session_hash=api_key).first()

        # If JWT and ApiKey users are both None return unauthenticated response
        if jwt_user == None and api_key_user == None:
            return Response("Unauthenticated", 401)

        # Authenticated and prepare for actual request
        # Remove api key from request to make it the the original unsecured route params
        params.pop('api_key', params)
        request.args = ImmutableMultiDict(params)

        # Return to function
        return f(*args, **kwargs)
    return decorated_function
