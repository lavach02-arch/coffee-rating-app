import pytest
import os
import sys

basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if basedir not in sys.path:
    sys.path.insert(0, basedir)

from app import create_app
from app.database import db
from app.models import Coffee, Vote
from config import TestConfig


@pytest.fixture
def app():
    """Create and configure a clean application for testing with in-memory DB."""
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        # Seed test data
        c1 = Coffee(
            id=1,
            name="Ethiopian Yirgacheffe",
            origin="Ethiopia",
            roast="Light",
            rating=4.8,
            votes=100,
            initial_rating=4.8,
            initial_votes=100,
            flavor_notes="Jasmine, Bergamot"
        )
        c2 = Coffee(
            id=2,
            name="Colombian Supremo",
            origin="Colombia",
            roast="Medium",
            rating=4.5,
            votes=150,
            initial_rating=4.5,
            initial_votes=150,
            flavor_notes="Caramel, Milk Chocolate"
        )
        c3 = Coffee(
            id=3,
            name="Sumatra Dark Mandheling",
            origin="Indonesia",
            roast="Dark",
            rating=4.2,
            votes=80,
            initial_rating=4.2,
            initial_votes=80,
            flavor_notes="Cedar, Dark Cocoa"
        )
        db.session.add_all([c1, c2, c3])
        db.session.commit()

        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test client fixture."""
    return app.test_client()


def test_health_check(client):
    """Verify GET /api/health endpoint returns status healthy."""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['database'] == 'connected'


def test_get_coffees(client):
    """Verify GET /api/coffees returns all coffees."""
    response = client.get('/api/coffees')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['count'] == 3
    assert len(data['coffees']) == 3


def test_coffee_search(client):
    """Verify search filter by name or origin."""
    response = client.get('/api/coffees?search=Ethiopian')
    assert response.status_code == 200
    data = response.get_json()
    assert data['count'] == 1
    assert data['coffees'][0]['name'] == 'Ethiopian Yirgacheffe'

    # Search by flavor note
    response2 = client.get('/api/coffees?search=Caramel')
    assert response2.status_code == 200
    data2 = response2.get_json()
    assert data2['count'] == 1
    assert data2['coffees'][0]['name'] == 'Colombian Supremo'


def test_coffee_filter_origin(client):
    """Verify filtering by coffee origin."""
    response = client.get('/api/coffees?origin=Colombia')
    assert response.status_code == 200
    data = response.get_json()
    assert data['count'] == 1
    assert data['coffees'][0]['origin'] == 'Colombia'


def test_coffee_filter_roast(client):
    """Verify filtering by roast level."""
    response = client.get('/api/coffees?roast=Dark')
    assert response.status_code == 200
    data = response.get_json()
    assert data['count'] == 1
    assert data['coffees'][0]['roast'] == 'Dark'


def test_coffee_sorting(client):
    """Verify sorting by votes and rating."""
    # Sort by votes descending (Colombian Supremo has 150)
    response = client.get('/api/coffees?sort_by=votes&order=desc')
    assert response.status_code == 200
    coffees = response.get_json()['coffees']
    assert coffees[0]['name'] == 'Colombian Supremo'
    assert coffees[0]['votes'] == 150

    # Sort by rating descending (Ethiopian Yirgacheffe has 4.8)
    response2 = client.get('/api/coffees?sort_by=rating&order=desc')
    assert response2.status_code == 200
    coffees2 = response2.get_json()['coffees']
    assert coffees2[0]['name'] == 'Ethiopian Yirgacheffe'
    assert coffees2[0]['rating'] == 4.8


def test_get_single_coffee(client):
    """Verify GET /api/coffees/<id>."""
    response = client.get('/api/coffees/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['coffee']['id'] == 1
    assert data['coffee']['name'] == 'Ethiopian Yirgacheffe'

    # Nonexistent coffee
    response404 = client.get('/api/coffees/999')
    assert response404.status_code == 404
    assert response404.get_json()['success'] is False


def test_submit_valid_vote_and_recalculate(client):
    """Verify submitting a valid vote recalculates votes and rating."""
    initial = client.get('/api/coffees/1').get_json()['coffee']
    initial_votes = initial['votes']

    # Submit vote: 5 stars
    payload = {
        'voter_id': 'browser_test_user_1',
        'rating': 5
    }
    response = client.post('/api/coffees/1/vote', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True
    assert data['coffee']['votes'] == initial_votes + 1
    assert 'recorded' in data['message']


def test_duplicate_vote_prevention(client):
    """Verify the same voter cannot vote twice for the same coffee."""
    voter_id = 'duplicate_checker_user'
    payload = {'voter_id': voter_id, 'rating': 4}

    # First vote should succeed
    res1 = client.post('/api/coffees/2/vote', json=payload)
    assert res1.status_code == 201

    # Second vote from same voter should be rejected with 409 Conflict
    res2 = client.post('/api/coffees/2/vote', json=payload)
    assert res2.status_code == 409
    data = res2.get_json()
    assert data['success'] is False
    assert 'already voted' in data['error']


def test_vote_validation_errors(client):
    """Verify validation for ratings out of range, missing fields, etc."""
    # Missing voter_id
    res1 = client.post('/api/coffees/1/vote', json={'rating': 5})
    assert res1.status_code == 400

    # Rating < 1
    res2 = client.post('/api/coffees/1/vote', json={'voter_id': 'u1', 'rating': 0})
    assert res2.status_code == 400

    # Rating > 5
    res3 = client.post('/api/coffees/1/vote', json={'voter_id': 'u1', 'rating': 6})
    assert res3.status_code == 400

    # Non-numeric rating
    res4 = client.post('/api/coffees/1/vote', json={'voter_id': 'u1', 'rating': 'super'})
    assert res4.status_code == 400

    # Nonexistent coffee
    res5 = client.post('/api/coffees/999/vote', json={'voter_id': 'u1', 'rating': 5})
    assert res5.status_code == 404


def test_leaderboard(client):
    """Verify leaderboard returns sorted top coffees with ranks."""
    response = client.get('/api/leaderboard?limit=2')
    assert response.status_code == 200
    data = response.get_json()
    assert data['count'] == 2
    leaderboard = data['leaderboard']

    assert leaderboard[0]['rank'] == 1
    assert leaderboard[0]['is_top_three'] is True
    assert leaderboard[0]['name'] == 'Ethiopian Yirgacheffe'  # highest rating 4.8

    assert leaderboard[1]['rank'] == 2
    assert leaderboard[1]['name'] == 'Colombian Supremo'  # 4.5 rating


def test_statistics(client):
    """Verify GET /api/statistics."""
    response = client.get('/api/statistics')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total_coffees'] == 3
    assert data['total_votes'] == 100 + 150 + 80
    assert data['origin_count'] == 3
    assert 'Light' in data['roast_distribution']
    assert 'Medium' in data['roast_distribution']
    assert 'Dark' in data['roast_distribution']


def test_origins_and_roasts(client):
    """Verify GET /api/origins and GET /api/roasts."""
    res_origins = client.get('/api/origins')
    assert res_origins.status_code == 200
    origins = res_origins.get_json()['origins']
    assert 'Colombia' in origins
    assert 'Ethiopia' in origins
    assert 'Indonesia' in origins

    res_roasts = client.get('/api/roasts')
    assert res_roasts.status_code == 200
    roasts = res_roasts.get_json()['roasts']
    assert roasts == ['Light', 'Medium', 'Dark']
