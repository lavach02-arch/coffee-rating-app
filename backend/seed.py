import json
import os
import sys

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Add current directory to path so imports work cleanly
basedir = os.path.abspath(os.path.dirname(__file__))
if basedir not in sys.path:
    sys.path.insert(0, basedir)

from app import create_app
from app.database import db
from app.models import Coffee, Vote

SAMPLE_COFFEES = [
    # Specialty & Origin Highlights
    {
        "id": 1,
        "name": "Ethiopian Yirgacheffe Reserve",
        "origin": "Ethiopia",
        "roast": "Light",
        "rating": 4.8,
        "votes": 312,
        "description": "Exquisite washed heirloom varietals with vibrant floral aroma and bright bergamot sweetness.",
        "flavor_notes": "Jasmine, Bergamot, Meyer Lemon, Peach"
    },
    {
        "id": 2,
        "name": "Colombian Huila Supremo",
        "origin": "Colombia",
        "roast": "Medium",
        "rating": 4.6,
        "votes": 284,
        "description": "Classic sweet Colombian cup with silky body, panela sugar undertones, and crisp red apple acidity.",
        "flavor_notes": "Caramel, Red Apple, Milk Chocolate"
    },
    {
        "id": 3,
        "name": "Sumatra Mandheling Grade 1",
        "origin": "Indonesia",
        "roast": "Dark",
        "rating": 4.4,
        "votes": 195,
        "description": "Full-bodied wet-hulled Indonesian roast famous for its earthy herbal richness and dark cocoa finish.",
        "flavor_notes": "Dark Chocolate, Cedar, Clove, Earthy"
    },
    {
        "id": 4,
        "name": "Guatemala Antigua Los Pastores",
        "origin": "Guatemala",
        "roast": "Medium",
        "rating": 4.7,
        "votes": 240,
        "description": "Volcanic soil cultivated Bourbon beans yielding a smoky cocoa aroma with subtle orange blossom notes.",
        "flavor_notes": "Smoky Cocoa, Orange Peel, Honey"
    },
    {
        "id": 5,
        "name": "Kenya AA Nyeri Hill",
        "origin": "Kenya",
        "roast": "Light",
        "rating": 4.9,
        "votes": 420,
        "description": "Prized SL28 and SL34 varietals packed with juicy blackcurrant complexity and sparkling wine acidity.",
        "flavor_notes": "Blackcurrant, Grapefruit, Brown Sugar"
    },
    {
        "id": 6,
        "name": "Costa Rica Tarrazú Honey",
        "origin": "Costa Rica",
        "roast": "Medium",
        "rating": 4.5,
        "votes": 168,
        "description": "Yellow honey processed micro-lot featuring delicate tropical notes and sweet golden raisin.",
        "flavor_notes": "Honey, Apricot, Golden Raisin, Vanilla"
    },
    {
        "id": 7,
        "name": "Panama Geisha Boquete Estate",
        "origin": "Panama",
        "roast": "Light",
        "rating": 4.9,
        "votes": 510,
        "description": "Legendary high-altitude Geisha offering tea-like delicacy, jasmine bouquet, and lemongrass brightness.",
        "flavor_notes": "White Flowers, Lemongrass, Papaya"
    },
    {
        "id": 8,
        "name": "Brazilian Cerrado Santos Bourbon",
        "origin": "Brazil",
        "roast": "Medium",
        "rating": 4.3,
        "votes": 220,
        "description": "Naturally processed Bourbon with velvety crema, low acidity, toasted hazelnut, and buttery praline.",
        "flavor_notes": "Hazelnut, Toffee, Dark Cocoa"
    },
    {
        "id": 9,
        "name": "Indian Monsooned Malabar AA",
        "origin": "India",
        "roast": "Dark",
        "rating": 4.1,
        "votes": 182,
        "description": "Exposed to Arabian Sea monsoon winds for months, giving an ultra-mellow, heavy body and spice profile.",
        "flavor_notes": "Bakers Spice, Pipe Tobacco, Malty"
    },
    {
        "id": 10,
        "name": "Jamaican Blue Mountain Clydesdale",
        "origin": "Jamaica",
        "roast": "Medium",
        "rating": 4.7,
        "votes": 365,
        "description": "World-renowned mist-shrouded mountain harvest noted for total balance, lack of bitterness, and clean sweetness.",
        "flavor_notes": "Sweet Herb, Cream, Mild Walnut"
    },
    {
        "id": 11,
        "name": "Rwanda Lake Kivu Bourbon",
        "origin": "Rwanda",
        "roast": "Light",
        "rating": 4.5,
        "votes": 134,
        "description": "Washed Red Bourbon offering vibrant red currant vibrancy with a sweet mandarin orange aftertaste.",
        "flavor_notes": "Red Currant, Mandarin, Black Tea"
    },
    {
        "id": 12,
        "name": "Hawaiian Kona Extra Fancy",
        "origin": "United States",
        "roast": "Medium",
        "rating": 4.8,
        "votes": 290,
        "description": "Slopes of Mauna Loa harvest featuring radiant golden caramel, roasted macadamia, and mild floral hints.",
        "flavor_notes": "Macadamia Nut, Milk Chocolate, Honey"
    },
    {
        "id": 13,
        "name": "Mexican Chiapas Organic Finca",
        "origin": "Mexico",
        "roast": "Medium",
        "rating": 4.2,
        "votes": 115,
        "description": "Fair-trade shade-grown harvest with a gentle milk chocolate warmth and sweet pear crispness.",
        "flavor_notes": "Milk Chocolate, Pear, Brown Sugar"
    },
    {
        "id": 14,
        "name": "Yemeni Mocha Matari Ancient",
        "origin": "Yemen",
        "roast": "Dark",
        "rating": 4.6,
        "votes": 210,
        "description": "Centuries-old terraced crop delivering deep dried fruit pungency, dark baker's cocoa, and exotic spices.",
        "flavor_notes": "Cardamom, Dried Fig, Dark Chocolate"
    },
    {
        "id": 15,
        "name": "Tanzanian Peaberry Kilimanjaro",
        "origin": "Tanzania",
        "roast": "Light",
        "rating": 4.4,
        "votes": 178,
        "description": "Single round peaberry beans concentrating high acidity, cedar freshness, and sharp black plum sweetness.",
        "flavor_notes": "Black Plum, Cedar, Red Currant"
    },
    {
        "id": 16,
        "name": "Vietnamese Da Lat Arabica Highlands",
        "origin": "Vietnam",
        "roast": "Dark",
        "rating": 4.1,
        "votes": 142,
        "description": "Pine-covered Lang Biang plateau beans roasted deep with bittersweet chocolate, almond, and chicory.",
        "flavor_notes": "Bittersweet Chocolate, Almond, Chicory"
    },
    {
        "id": 17,
        "name": "Peruvian Chanchamayo High Altitude",
        "origin": "Peru",
        "roast": "Medium",
        "rating": 4.3,
        "votes": 128,
        "description": "Andean eastern slope crop displaying a clean sweet finish, roasted almond, and bright green grape.",
        "flavor_notes": "Almond, Green Grape, Sweet Panela"
    },
    {
        "id": 18,
        "name": "Burundi Ngozi Red Bourbon",
        "origin": "Burundi",
        "roast": "Light",
        "rating": 4.6,
        "votes": 156,
        "description": "Double-fermented African specialty bursting with sweet pomegranate, hibiscus floral, and honey.",
        "flavor_notes": "Hibiscus, Pomegranate, Honey"
    },
    {
        "id": 19,
        "name": "Honduras Marcala Micro-Lot",
        "origin": "Honduras",
        "roast": "Medium",
        "rating": 4.2,
        "votes": 98,
        "description": "High altitude Montecillos range beans featuring warm gingerbread, nutmeg, and stewed plum.",
        "flavor_notes": "Gingerbread, Nutmeg, Plum"
    },
    {
        "id": 20,
        "name": "Ugandan Bugisu Mount Elgon",
        "origin": "Uganda",
        "roast": "Dark",
        "rating": 4.3,
        "votes": 164,
        "description": "Thick syrupy body with dark chocolate, molasses, and subtle cedar smoke.",
        "flavor_notes": "Molasses, Dark Cacao, Cedar Smoke"
    },
    {
        "id": 21,
        "name": "Italian Espresso Barista Blend",
        "origin": "Italy",
        "roast": "Dark",
        "rating": 4.7,
        "votes": 380,
        "description": "Traditional northern Italian espresso blend engineered for rich hazelnut crema and lingering cacao finish.",
        "flavor_notes": "Dark Cacao, Toasted Brioche, Hazelnut"
    },
    {
        "id": 22,
        "name": "Viennese Cinnamon Roast Blend",
        "origin": "Austria",
        "roast": "Light",
        "rating": 4.0,
        "votes": 85,
        "description": "Lightly dropped right after first crack, accentuating snappy grain sweetness and soft floral warmth.",
        "flavor_notes": "Cinnamon Bark, Sweet Grain, Honeysuckle"
    },
    {
        "id": 23,
        "name": "French Roast Midnight Velvet",
        "origin": "France",
        "roast": "Dark",
        "rating": 4.2,
        "votes": 215,
        "description": "Deeply caramelized profile showcasing glistening essential oils, smoky charred oak, and dark fudge.",
        "flavor_notes": "Charred Oak, Dark Fudge, Molasses"
    },
    {
        "id": 24,
        "name": "Morning Sunrise Breakfast Blend",
        "origin": "Colombia",
        "roast": "Light",
        "rating": 4.4,
        "votes": 190,
        "description": "An uplifting early-morning brew balancing citrus sparkle with a comforting butter biscuit base.",
        "flavor_notes": "Lemon Zest, Butter Biscuit, Brown Sugar"
    },
    {
        "id": 25,
        "name": "Cacao & Caramel Velvet Roast",
        "origin": "Brazil",
        "roast": "Medium",
        "rating": 4.5,
        "votes": 260,
        "description": "Rich confluence of toasted nuts and dulce de leche sweetness crafted for milk-based lattes.",
        "flavor_notes": "Dulce de Leche, Cashew, Cacao Nib"
    },
    {
        "id": 26,
        "name": "Ethiopian Sidama Natural",
        "origin": "Ethiopia",
        "roast": "Light",
        "rating": 4.8,
        "votes": 340,
        "description": "Sun-dried natural processed coffee exploding with wild blueberry jam and dark strawberry aromatics.",
        "flavor_notes": "Blueberry Jam, Ripe Strawberry, Milk Chocolate"
    },
    {
        "id": 27,
        "name": "Papua New Guinea Sigri Estate",
        "origin": "Papua New Guinea",
        "roast": "Medium",
        "rating": 4.5,
        "votes": 175,
        "description": "Descended from Jamaican Blue Mountain stock, offering a gentle acidity with sweet tropical mango notes.",
        "flavor_notes": "Mango, Green Apple, Sweet Walnut"
    },
    {
        "id": 28,
        "name": "Nicaraguan Matagalpa Maragogype",
        "origin": "Nicaragua",
        "roast": "Medium",
        "rating": 4.3,
        "votes": 130,
        "description": "Famous 'Elephant Bean' varietal producing a delicate silky cup with mellow pear and roasted pecan.",
        "flavor_notes": "Pecan, Pear, Caramel Butter"
    },
    {
        "id": 29,
        "name": "Salvadoran Santa Ana Bourbon",
        "origin": "El Salvador",
        "roast": "Medium",
        "rating": 4.4,
        "votes": 145,
        "description": "Volcano slope harvested sweet Bourbon with milk chocolate creaminess and dried cherry accents.",
        "flavor_notes": "Dried Cherry, Milk Chocolate, Honey"
    },
    {
        "id": 30,
        "name": "Indian Mysore Gold Nuggets Extra",
        "origin": "India",
        "roast": "Medium",
        "rating": 4.2,
        "votes": 110,
        "description": "Washed Arabica beans sorted to the highest grading standards with smooth body and cardamom notes.",
        "flavor_notes": "Cardamom, Cocoa, Almond"
    },
    {
        "id": 31,
        "name": "Timor-Leste Organic Wild Forest",
        "origin": "Timor-Leste",
        "roast": "Dark",
        "rating": 4.1,
        "votes": 92,
        "description": "Forest-collected heirloom Arabica-Robusta natural cross delivering heavy cedar, dark pepper, and malt.",
        "flavor_notes": "Black Pepper, Cedar, Dark Chocolate"
    },
    {
        "id": 32,
        "name": "Ecuador Galapagos San Cristobal",
        "origin": "Ecuador",
        "roast": "Medium",
        "rating": 4.6,
        "votes": 204,
        "description": "Island microclimate cultivated harvest with mineral purity, silky caramel, and ripe melon sweetness.",
        "flavor_notes": "Melon, Sea Salt Caramel, White Chocolate"
    },
    {
        "id": 33,
        "name": "Madagascar Bourbon Pointu Rare",
        "origin": "Madagascar",
        "roast": "Light",
        "rating": 4.7,
        "votes": 160,
        "description": "Naturally low-caffeine Laurina heirloom providing a delicate floral cup with lychee and wild honey.",
        "flavor_notes": "Lychee, Wild Honey, Rose Water"
    },
    {
        "id": 34,
        "name": "Bolivian Yungas Caranavi Organic",
        "origin": "Bolivia",
        "roast": "Medium",
        "rating": 4.3,
        "votes": 118,
        "description": "Indigenous cooperative produced beans featuring sweet citrus zest, golden syrup, and roasted Brazil nut.",
        "flavor_notes": "Golden Syrup, Brazil Nut, Tangerine"
    },
    {
        "id": 35,
        "name": "Malawi Sable Farms Peaberry",
        "origin": "Malawi",
        "roast": "Light",
        "rating": 4.2,
        "votes": 88,
        "description": "Rare southern African harvest yielding subtle white peach sweetness and crisp green tea notes.",
        "flavor_notes": "White Peach, Green Tea, Raw Cane"
    },
    {
        "id": 36,
        "name": "Java Estate Kayumas Reserve",
        "origin": "Indonesia",
        "roast": "Dark",
        "rating": 4.4,
        "votes": 172,
        "description": "Government estate washed crop with classic clean spice, sweet tobacco leaf, and baker's unsweetened chocolate.",
        "flavor_notes": "Tobacco Leaf, Baker's Cocoa, Clove"
    },
    {
        "id": 37,
        "name": "Costa Rica Monteverde Cloud Forest",
        "origin": "Costa Rica",
        "roast": "Light",
        "rating": 4.6,
        "votes": 198,
        "description": "High canopy mist-bathed coffee with crisp green apple acidity, brown sugar, and sweet lavender.",
        "flavor_notes": "Green Apple, Lavender, Brown Sugar"
    },
    {
        "id": 38,
        "name": "Kenyan Kirinyaga Peaberry",
        "origin": "Kenya",
        "roast": "Light",
        "rating": 4.8,
        "votes": 275,
        "description": "Mt. Kenya volcanic slopes harvest showcasing brilliant blackberry notes and complex savory-sweet balance.",
        "flavor_notes": "Blackberry, Hibiscus, Lime Cordial"
    },
    {
        "id": 39,
        "name": "Guatemala Huehuetenango Highland",
        "origin": "Guatemala",
        "roast": "Medium",
        "rating": 4.5,
        "votes": 210,
        "description": "Non-volcanic high mountain origin shielded by hot winds, bursting with candied orange and milk chocolate.",
        "flavor_notes": "Candied Orange, Milk Chocolate, Toffee"
    },
    {
        "id": 40,
        "name": "Colombian Nariño Supremo Especial",
        "origin": "Colombia",
        "roast": "Medium",
        "rating": 4.7,
        "votes": 315,
        "description": "Deep canyons and high ridges of Nariño give exceptional sweetness, crisp cherry, and buttery toffee.",
        "flavor_notes": "Cherry, Buttery Toffee, Panela"
    },
    {
        "id": 41,
        "name": "Brazil Mogiana Yellow Catuai",
        "origin": "Brazil",
        "roast": "Light",
        "rating": 4.3,
        "votes": 140,
        "description": "Pulp-natural process highlighting yellow stone fruit sweetness, macadamia butter, and mild lemon.",
        "flavor_notes": "Yellow Peach, Macadamia Butter, Honey"
    },
    {
        "id": 42,
        "name": "Ethiopian Guji Natural Uraga",
        "origin": "Ethiopia",
        "roast": "Light",
        "rating": 4.9,
        "votes": 460,
        "description": "Stunning micro-region cup with intense tropical passionfruit, raspberry syrup, and lilac floral perfume.",
        "flavor_notes": "Passionfruit, Raspberry, Lilac"
    },
    {
        "id": 43,
        "name": "Sulawesi Toraja Kalosi Heritage",
        "origin": "Indonesia",
        "roast": "Dark",
        "rating": 4.4,
        "votes": 185,
        "description": "Traditional Giling Basah processing with dense herbal richness, cinnamon stick, and dark maple finish.",
        "flavor_notes": "Maple, Cinnamon Stick, Dark Cocoa"
    },
    {
        "id": 44,
        "name": "Mexican Oaxaca Pluma Hidalgo",
        "origin": "Mexico",
        "roast": "Medium",
        "rating": 4.4,
        "votes": 150,
        "description": "Pacific breeze kissed Typica and Bourbon beans with milk chocolate, toasted walnut, and orange zest.",
        "flavor_notes": "Milk Chocolate, Walnut, Orange Zest"
    },
    {
        "id": 45,
        "name": "Panama Volcan Baru Caturra",
        "origin": "Panama",
        "roast": "Medium",
        "rating": 4.6,
        "votes": 230,
        "description": "Rich volcanic soils on the slopes of Baru Volcano with crisp red apple, sweet cane, and jasmine hint.",
        "flavor_notes": "Red Apple, Cane Sugar, Jasmine"
    },

    # Dataset samples matching requirements exactly
    {
        "id": 46,
        "name": "Sample Roast 46",
        "origin": "India",
        "roast": "Light",
        "rating": 3.0,
        "votes": 146,
        "description": "Sample dataset record 46 featuring a light roast profile with balanced Indian origin notes.",
        "flavor_notes": "Malt, Roasted Peanut, Caramel"
    },
    {
        "id": 47,
        "name": "Sample Roast 47",
        "origin": "Brazil",
        "roast": "Dark",
        "rating": 4.3,
        "votes": 33,
        "description": "Sample dataset record 47 featuring a bold dark roast with traditional Brazilian nutty cocoa.",
        "flavor_notes": "Dark Cocoa, Roasted Walnut, Molasses"
    },
    {
        "id": 48,
        "name": "Sample Roast 48",
        "origin": "Colombia",
        "roast": "Medium",
        "rating": 2.9,
        "votes": 112,
        "description": "Sample dataset record 48 with approachable medium roast profile and mild caramel finish.",
        "flavor_notes": "Caramel, Brown Sugar, Mild Citrus"
    },
    {
        "id": 49,
        "name": "Sample Roast 49",
        "origin": "Ethiopia",
        "roast": "Dark",
        "rating": 3.5,
        "votes": 4,
        "description": "Sample dataset record 49 offering a smoky dark roasted Ethiopian bean.",
        "flavor_notes": "Smoked Berry, Dark Chocolate, Clove"
    },
    {
        "id": 50,
        "name": "Sample Roast 50",
        "origin": "India",
        "roast": "Light",
        "rating": 4.2,
        "votes": 149,
        "description": "Sample dataset record 50 delivering a bright and smooth light roast cup.",
        "flavor_notes": "Spiced Tea, Raw Honey, Biscuit"
    },
    {
        "id": 51,
        "name": "Sample Roast 51",
        "origin": "Guatemala",
        "roast": "Dark",
        "rating": 4.0,
        "votes": 88,
        "description": "Sample dataset record 51 featuring deep cocoa and roasted almond notes.",
        "flavor_notes": "Deep Cocoa, Roasted Almond, Oak"
    },
    {
        "id": 52,
        "name": "Sample Roast 52",
        "origin": "Kenya",
        "roast": "Medium",
        "rating": 4.6,
        "votes": 165,
        "description": "Sample dataset record 52 balancing currant fruit sweetness and brown sugar warmth.",
        "flavor_notes": "Blackcurrant, Brown Sugar, Grapefruit"
    },
    {
        "id": 53,
        "name": "Sample Roast 53",
        "origin": "Costa Rica",
        "roast": "Light",
        "rating": 3.8,
        "votes": 74,
        "description": "Sample dataset record 53 with floral sweetness and crisp citrus acidity.",
        "flavor_notes": "Lemon, Honey, White Flower"
    },
    {
        "id": 54,
        "name": "Sample Roast 54",
        "origin": "Indonesia",
        "roast": "Medium",
        "rating": 4.1,
        "votes": 120,
        "description": "Sample dataset record 54 offering smooth cedar and dark caramel tones.",
        "flavor_notes": "Cedar, Caramel, Dark Spice"
    },
    {
        "id": 55,
        "name": "Sample Roast 55",
        "origin": "Brazil",
        "roast": "Light",
        "rating": 3.7,
        "votes": 95,
        "description": "Sample dataset record 55 highlighting light golden nuttiness and gentle panela sweetness.",
        "flavor_notes": "Toasted Peanut, Cane Sugar, Vanilla"
    }
]


def load_seed_json(json_path=None):
    """
    Attempts to load seed records from JSON file.
    Falls back to SAMPLE_COFFEES if file is not found.
    """
    if json_path and os.path.exists(json_path):
        print(f"📄 Loading coffee seed data from '{json_path}'...")
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    print(f"✅ Successfully read {len(data)} records from JSON file.")
                    return data
        except Exception as e:
            print(f"⚠️ Error reading JSON file: {e}. Falling back to default dataset.")

    # Check for seed_data.json in backend directory
    default_json = os.path.join(basedir, 'seed_data.json')
    if os.path.exists(default_json):
        print(f"📄 Loading coffee seed data from '{default_json}'...")
        try:
            with open(default_json, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    print(f"✅ Successfully read {len(data)} records from seed_data.json.")
                    return data
        except Exception as e:
            print(f"⚠️ Error reading seed_data.json: {e}")

    print(f"ℹ️ Using built-in synthetic coffee dataset ({len(SAMPLE_COFFEES)} items).")
    return SAMPLE_COFFEES


def seed_database(json_path=None):
    """
    Initializes database tables and populates coffee records without duplicating.
    Preserves initial ratings and votes.
    """
    app = create_app()

    with app.app_context():
        # Ensure tables exist
        db.create_all()

        records = load_seed_json(json_path)
        added_count = 0
        updated_count = 0
        skipped_count = 0

        for item in records:
            coffee_id = item.get('id')
            name = item.get('name')
            origin = item.get('origin', 'Unknown Origin')
            roast = item.get('roast', 'Medium')
            rating = float(item.get('rating', 0.0))
            votes = int(item.get('votes', 0))
            description = item.get('description')
            flavor_notes = item.get('flavor_notes')

            # Check if coffee exists by id or by name
            existing = None
            if coffee_id:
                existing = db.session.get(Coffee, coffee_id)
            if not existing and name:
                existing = Coffee.query.filter_by(name=name).first()

            if existing:
                # Record exists; preserve its state, or ensure initial baseline matches
                if existing.initial_votes == 0 and existing.initial_rating == 0.0 and votes > 0:
                    existing.initial_votes = votes
                    existing.initial_rating = rating
                    existing.votes = votes
                    existing.rating = rating
                    updated_count += 1
                else:
                    skipped_count += 1
            else:
                new_coffee = Coffee(
                    id=coffee_id,
                    name=name,
                    origin=origin,
                    roast=roast,
                    rating=rating,
                    votes=votes,
                    initial_rating=rating,
                    initial_votes=votes,
                    description=description,
                    flavor_notes=flavor_notes
                )
                db.session.add(new_coffee)
                added_count += 1

        db.session.commit()
        total = Coffee.query.count()
        print(f"🎉 Seeding complete! Added: {added_count}, Updated: {updated_count}, Skipped: {skipped_count}.")
        print(f"☕ Total coffees in database: {total}")


if __name__ == '__main__':
    custom_path = sys.argv[1] if len(sys.argv) > 1 else None
    seed_database(custom_path)
