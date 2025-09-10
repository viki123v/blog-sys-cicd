from contextlib import contextmanager

import pytest
from fastapi.testclient import TestClient

from src.main import app
from src.models import BlogUser, create_session


@pytest.fixture(scope="module", autouse=True)
def client():
    client = TestClient(app)
    yield client


@pytest.fixture(scope="class")
def mock_username():
    return "testuser"


def delete_user_if_exists(username: str):
    session = next(create_session())
    user = session.query(BlogUser).get(username)
    if user is not None:
        session.delete(user)
        session.commit()

@contextmanager
def register_user_via_json(username: str, password: str, client: TestClient):
    yield client.post(
        "/register",
        headers={"Content-Type": "application/json"},
        json={"username": username, "password": password},
    )
    delete_user_if_exists(username)


class TestRegister:
    def test_when_username_unique_should_succeed(
        self, client: TestClient, mock_username: str
    ):
        with register_user_via_json(mock_username, "test1", client) as response: 
            assert response.status_code == 201

    def test_when_username_already_exists(self, client: TestClient, mock_username: str):
        with register_user_via_json(mock_username, "test1", client) as response1: 
            assert response1.status_code == 201

            with register_user_via_json(mock_username, "test1", client) as response2:
                assert response2.status_code == 400
                assert response2.json()["message"] == "User with this username already exists"


class TestLogin:
    @pytest.fixture(scope='class')
    def mock_password(self):
        return "test1"    

    def test_when_valid_creds_should_login(
        self, client: TestClient, mock_username: str, mock_password:str
    ):
        with register_user_via_json(mock_username, mock_password, client) as _:
            res=client.post("/login", json={"username": mock_username, "password":mock_password})

            assert res.status_code == 200 
            assert 'bearer' in res.json()

    def test_when_invalid_creds_should_not_login(self, mock_username: str, client:TestClient, mock_password):
        with register_user_via_json(mock_username,mock_password,client) as _:
            invalid_username_req=client.post('/login',json={"username":mock_username + '1', "password" :mock_password})

            assert invalid_username_req.status_code==400 
            assert invalid_username_req.json()['message'] == 'Username or password not valid'

            invalid_password = client.post("/login", json={"username":mock_username, "password" : mock_password + '1'})

            assert invalid_password.status_code==400 
            assert invalid_password.json()['message'] == 'Username or password not valid'

class TestBlogs: 
    pass 