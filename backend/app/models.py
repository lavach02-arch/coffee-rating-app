from datetime import datetime, timezone
from sqlalchemy import UniqueConstraint, func
from .database import db

def utc_now():
    return datetime.now(timezone.utc)

class Coffee(db.Model):
    """Coffee model representing coffee blends and single origins."""
    __tablename__ = 'coffees'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    origin = db.Column(db.String(80), nullable=False, index=True)
    roast = db.Column(db.String(20), nullable=False, index=True)  # Light, Medium, Dark
    rating = db.Column(db.Float, nullable=False, default=0.0)
    votes = db.Column(db.Integer, nullable=False, default=0)
    initial_rating = db.Column(db.Float, nullable=False, default=0.0)
    initial_votes = db.Column(db.Integer, nullable=False, default=0)
    description = db.Column(db.String(300), nullable=True)
    flavor_notes = db.Column(db.String(150), nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)

    # Relationship to individual votes
    user_votes = db.relationship(
        'Vote',
        backref='coffee',
        lazy=True,
        cascade='all, delete-orphan'
    )

    def recalculate_rating(self):
        """
        Recalculates average rating and total vote count.
        Combines initial seeded values with live votes in the database.
        """
        user_votes_count = db.session.query(func.count(Vote.id)).filter(Vote.coffee_id == self.id).scalar() or 0
        user_votes_sum = db.session.query(func.sum(Vote.rating)).filter(Vote.coffee_id == self.id).scalar() or 0

        total_votes = self.initial_votes + user_votes_count
        if total_votes > 0:
            total_score = (self.initial_votes * self.initial_rating) + user_votes_sum
            self.rating = round(total_score / total_votes, 1)
            self.votes = total_votes
        else:
            self.rating = 0.0
            self.votes = 0

    def to_dict(self, user_voter_id=None):
        """Converts coffee instance to JSON-serializable dictionary."""
        data = {
            'id': self.id,
            'name': self.name,
            'origin': self.origin,
            'roast': self.roast,
            'rating': round(self.rating, 1),
            'votes': self.votes,
            'description': self.description or f"A balanced {self.roast.lower()} roast coffee from {self.origin}.",
            'flavor_notes': self.flavor_notes or "Chocolate, Caramel, Nuts",
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        # Check if the requested voter has already voted for this coffee
        if user_voter_id:
            user_vote = Vote.query.filter_by(coffee_id=self.id, voter_id=user_voter_id).first()
            data['has_voted'] = user_vote is not None
            data['user_rating'] = user_vote.rating if user_vote else None
        else:
            data['has_voted'] = False
            data['user_rating'] = None

        return data

    def __repr__(self):
        return f"<Coffee id={self.id} name='{self.name}' roast='{self.roast}' rating={self.rating}>"


class Vote(db.Model):
    """Vote model storing individual ratings submitted by users."""
    __tablename__ = 'votes'

    id = db.Column(db.Integer, primary_key=True)
    coffee_id = db.Column(
        db.Integer,
        db.ForeignKey('coffees.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    voter_id = db.Column(db.String(100), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint('coffee_id', 'voter_id', name='uq_coffee_voter'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'coffee_id': self.coffee_id,
            'voter_id': self.voter_id,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<Vote coffee_id={self.coffee_id} voter_id='{self.voter_id}' rating={self.rating}>"
