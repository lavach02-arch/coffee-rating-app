import sys
import os

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, basedir)

from app import create_app
from config import Config

def run_integration_tests():
    app = create_app(Config)
    client = app.test_client()

    print("========================================")
    print("STARTING FULL INTEGRATION VERIFICATION")
    print("========================================")

    # 1. Health check
    res = client.get('/api/health')
    print("1. Health check:", res.status_code, res.get_json())
    assert res.status_code == 200

    # 2. Coffees list
    res = client.get('/api/coffees')
    data = res.get_json()
    print(f"2. Total seeded coffees in DB: {data['count']}")
    assert data['count'] >= 50

    # 3. Leaderboard
    res = client.get('/api/leaderboard?limit=10')
    lb = res.get_json()
    print("3. Leaderboard Top 3:")
    for c in lb['leaderboard'][:3]:
        print(f"   Rank {c['rank']}: {c['name']} ({c['origin']}, {c['roast']}) -> {c['rating']} stars ({c['votes']} votes)")
    assert lb['count'] == 10
    assert lb['leaderboard'][0]['rank'] == 1
    assert lb['leaderboard'][0]['is_top_three'] is True

    # 4. Search and filter
    res = client.get('/api/coffees?search=Ethiopian&roast=Light')
    data = res.get_json()
    print(f"4. Filtered search (Ethiopian + Light): {data['count']} items found")
    assert data['count'] > 0

    # 5. Live vote submission on coffee #46
    coffee_before = client.get('/api/coffees/46').get_json()['coffee']
    initial_votes = coffee_before['votes']
    initial_rating = coffee_before['rating']
    print(f"5. Sample Roast 46 before vote: {initial_rating} stars, {initial_votes} votes")

    # Submit 5-star rating
    voter_id = 'integration_verify_voter_01'
    vote_res = client.post('/api/coffees/46/vote', json={'voter_id': voter_id, 'rating': 5})
    print(f"   Vote POST status: {vote_res.status_code}")
    assert vote_res.status_code == 201

    coffee_after = vote_res.get_json()['coffee']
    print(f"   Sample Roast 46 after vote: {coffee_after['rating']} stars, {coffee_after['votes']} votes")
    assert coffee_after['votes'] == initial_votes + 1

    # 6. Test duplicate prevention with same voter_id
    dup_res = client.post('/api/coffees/46/vote', json={'voter_id': voter_id, 'rating': 4})
    print(f"6. Duplicate vote attempt status: {dup_res.status_code} (Expected 409 Conflict)")
    assert dup_res.status_code == 409
    assert 'already voted' in dup_res.get_json()['error']

    # 7. Check statistics
    stats = client.get('/api/statistics').get_json()
    print("7. Platform Statistics:")
    print(f"   Total Coffees: {stats['total_coffees']}")
    print(f"   Total Votes: {stats['total_votes']}")
    print(f"   Average Rating: {stats['average_rating']}")
    print(f"   Top Origin: {stats['top_origin']}")
    print(f"   Roasts Breakdown: {stats['roast_distribution']}")
    assert stats['total_coffees'] >= 50
    assert stats['total_votes'] > 0

    # 8. Check frontend index.html served
    frontend_res = client.get('/')
    print(f"8. Frontend Static Serving: Status {frontend_res.status_code}")
    assert frontend_res.status_code == 200

    print("========================================")
    print("SUCCESS: ALL FULL-STACK INTEGRATION TESTS PASSED!")
    print("========================================")

if __name__ == '__main__':
    run_integration_tests()
