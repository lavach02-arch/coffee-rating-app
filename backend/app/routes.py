from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from .database import db
from .models import Coffee, Vote

api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route('/health', methods=['GET'])
def health_check():
    """Returns backend health and database connectivity status."""
    try:
        # Ping the database
        db.session.execute(db.text('SELECT 1'))
        db_status = 'connected'
    except Exception as e:
        db_status = f'disconnected: {str(e)}'

    return jsonify({
        'status': 'healthy',
        'service': 'Coffee Rating API',
        'version': '1.0.0',
        'database': db_status,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 200


@api_bp.route('/coffees', methods=['GET'])
def get_coffees():
    """
    Returns coffee records with optional filtering, searching, and sorting.
    Query Params:
    - search: string (matches name, origin, or flavor_notes)
    - origin: string
    - roast: string (Light, Medium, Dark)
    - sort_by: rating | votes | name (default: rating)
    - order: asc | desc (default: desc)
    - voter_id: string (optional, checks if voter has already voted)
    """
    search = request.args.get('search', '').strip()
    origin = request.args.get('origin', '').strip()
    roast = request.args.get('roast', '').strip()
    sort_by = request.args.get('sort_by', 'rating').strip().lower()
    order = request.args.get('order', 'desc').strip().lower()
    voter_id = request.args.get('voter_id', '').strip() or None

    query = Coffee.query

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Coffee.name.ilike(search_pattern)) |
            (Coffee.origin.ilike(search_pattern)) |
            (Coffee.flavor_notes.ilike(search_pattern))
        )

    # Origin filter
    if origin and origin.lower() != 'all':
        query = query.filter(Coffee.origin.ilike(origin))

    # Roast filter
    if roast and roast.lower() != 'all':
        query = query.filter(Coffee.roast.ilike(roast))

    # Sorting
    sort_column = Coffee.rating
    if sort_by == 'votes':
        sort_column = Coffee.votes
    elif sort_by == 'name':
        sort_column = Coffee.name

    if order == 'asc':
        if sort_by == 'rating':
            query = query.order_by(Coffee.rating.asc(), Coffee.votes.asc())
        elif sort_by == 'votes':
            query = query.order_by(Coffee.votes.asc(), Coffee.rating.asc())
        else:
            query = query.order_by(Coffee.name.asc())
    else:
        if sort_by == 'rating':
            query = query.order_by(Coffee.rating.desc(), Coffee.votes.desc())
        elif sort_by == 'votes':
            query = query.order_by(Coffee.votes.desc(), Coffee.rating.desc())
        else:
            query = query.order_by(Coffee.name.desc())

    coffees = query.all()
    return jsonify({
        'success': True,
        'count': len(coffees),
        'coffees': [c.to_dict(user_voter_id=voter_id) for c in coffees]
    }), 200


@api_bp.route('/coffees/<int:coffee_id>', methods=['GET'])
def get_coffee(coffee_id):
    """Returns detailed information about a specific coffee."""
    voter_id = request.args.get('voter_id', '').strip() or None
    coffee = db.session.get(Coffee, coffee_id)

    if not coffee:
        return jsonify({
            'success': False,
            'error': f'Coffee with ID {coffee_id} was not found.'
        }), 404

    return jsonify({
        'success': True,
        'coffee': coffee.to_dict(user_voter_id=voter_id)
    }), 200


@api_bp.route('/coffees/<int:coffee_id>/vote', methods=['POST'])
def vote_coffee(coffee_id):
    """
    Submits a rating for a coffee.
    Body JSON:
    - voter_id: string (required)
    - rating: int (1 to 5, required)
    """
    coffee = db.session.get(Coffee, coffee_id)
    if not coffee:
        return jsonify({
            'success': False,
            'error': f'Coffee with ID {coffee_id} does not exist.'
        }), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            'success': False,
            'error': 'Invalid request body. JSON payload is required.'
        }), 400

    voter_id = str(data.get('voter_id', '')).strip()
    rating = data.get('rating')

    # Validate voter_id
    if not voter_id:
        return jsonify({
            'success': False,
            'error': 'Missing or empty voter_id. A unique voter ID is required.'
        }), 400

    if len(voter_id) > 100:
        return jsonify({
            'success': False,
            'error': 'voter_id is too long (maximum 100 characters).'
        }), 400

    # Validate rating
    try:
        rating_int = int(rating)
    except (ValueError, TypeError):
        return jsonify({
            'success': False,
            'error': 'Rating must be an integer between 1 and 5.'
        }), 400

    if rating_int < 1 or rating_int > 5:
        return jsonify({
            'success': False,
            'error': 'Rating must be between 1 and 5 stars.'
        }), 400

    # Duplicate vote check before transaction
    existing_vote = Vote.query.filter_by(coffee_id=coffee_id, voter_id=voter_id).first()
    if existing_vote:
        return jsonify({
            'success': False,
            'error': 'You have already voted for this coffee blend.',
            'existing_vote': existing_vote.to_dict()
        }), 409

    # Use database transaction to safely record vote and update aggregates
    try:
        new_vote = Vote(
            coffee_id=coffee_id,
            voter_id=voter_id,
            rating=rating_int
        )
        db.session.add(new_vote)
        db.session.flush()  # Ensures foreign key and unique constraint checks pass

        # Recalculate coffee average rating and vote count
        coffee.recalculate_rating()

        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Duplicate vote detected. You have already rated this coffee.'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Database error while recording vote: {str(e)}'
        }), 500

    return jsonify({
        'success': True,
        'message': f'Thank you! Your rating of {rating_int} stars for "{coffee.name}" was recorded.',
        'coffee': coffee.to_dict(user_voter_id=voter_id),
        'vote': new_vote.to_dict()
    }), 201


@api_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """
    Returns the top-rated coffees.
    Primary sort: rating DESC
    Secondary sort: votes DESC
    """
    limit = request.args.get('limit', 10, type=int)
    voter_id = request.args.get('voter_id', '').strip() or None

    top_coffees = Coffee.query.order_by(
        Coffee.rating.desc(),
        Coffee.votes.desc()
    ).limit(limit).all()

    leaderboard = []
    for rank, c in enumerate(top_coffees, start=1):
        item = c.to_dict(user_voter_id=voter_id)
        item['rank'] = rank
        item['is_top_three'] = rank <= 3
        leaderboard.append(item)

    return jsonify({
        'success': True,
        'count': len(leaderboard),
        'leaderboard': leaderboard
    }), 200


@api_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Returns overall platform statistics."""
    total_coffees = db.session.query(func.count(Coffee.id)).scalar() or 0
    total_votes = db.session.query(func.sum(Coffee.votes)).scalar() or 0
    
    # Calculate overall platform average rating weighted by votes
    avg_row = db.session.query(
        func.sum(Coffee.rating * Coffee.votes),
        func.sum(Coffee.votes)
    ).first()
    
    overall_avg = 0.0
    if avg_row and avg_row[1] and avg_row[1] > 0:
        overall_avg = round(avg_row[0] / avg_row[1], 2)
    elif total_coffees > 0:
        simple_avg = db.session.query(func.avg(Coffee.rating)).scalar() or 0.0
        overall_avg = round(simple_avg, 2)

    # Roast distribution
    roast_counts = db.session.query(
        Coffee.roast,
        func.count(Coffee.id)
    ).group_by(Coffee.roast).all()
    roast_distribution = {roast: count for roast, count in roast_counts}

    # Distinct origins count
    origin_count = db.session.query(func.count(func.distinct(Coffee.origin))).scalar() or 0

    # Top origin by coffee count
    top_origin_row = db.session.query(
        Coffee.origin,
        func.count(Coffee.id).label('c_count')
    ).group_by(Coffee.origin).order_by(db.desc('c_count')).first()

    top_origin = top_origin_row[0] if top_origin_row else 'None'

    return jsonify({
        'success': True,
        'total_coffees': total_coffees,
        'total_votes': int(total_votes),
        'average_rating': overall_avg,
        'origin_count': origin_count,
        'top_origin': top_origin,
        'roast_distribution': roast_distribution
    }), 200


@api_bp.route('/origins', methods=['GET'])
def get_origins():
    """Returns list of distinct coffee origins available."""
    origins = [r[0] for r in db.session.query(Coffee.origin).distinct().order_by(Coffee.origin.asc()).all()]
    return jsonify({
        'success': True,
        'origins': origins
    }), 200


@api_bp.route('/roasts', methods=['GET'])
def get_roasts():
    """Returns list of available roast types."""
    roasts = ['Light', 'Medium', 'Dark']
    return jsonify({
        'success': True,
        'roasts': roasts
    }), 200
