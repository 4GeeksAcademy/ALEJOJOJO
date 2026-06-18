"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_jwt_extended import JWTManager

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
def signup():
    body = request.get_json(silent=True)
    if body is None:
        raise APIException("Debes enviar un body con email y password", status_code=400)

    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        raise APIException("El email y la contraseña son obligatorios", status_code=400)

    existing_user = User.query.filter_by(email=email).first()
    if existing_user is not None:
        raise APIException("Ya existe un usuario con ese email", status_code=409)

    new_user = User(
        email=email,
        password=generate_password_hash(password),
        is_active=True
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado correctamente", "user": new_user.serialize()}), 201


@api.route('/login', methods=['POST'])
def login():
    body = request.get_json(silent=True)
    if body is None:
        raise APIException("Debes enviar un body con email y password", status_code=400)

    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        raise APIException("El email y la contraseña son obligatorios", status_code=400)

    user = User.query.filter_by(email=email).first()
    if user is None or not check_password_hash(user.password, password):
        raise APIException("Email o contraseña incorrectos", status_code=401)

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"token": access_token, "user": user.serialize()}), 200


@api.route('/private', methods=['GET'])
@jwt_required()
def private():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user is None:
        raise APIException("Usuario no encontrado", status_code=404)

    return jsonify({"msg": "Acceso autorizado a la zona privada", "user": user.serialize()}), 200