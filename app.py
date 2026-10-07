"""
Snake & Ladder - Flask Web Application Backend
"""

import os
import uuid
from typing import Dict
from game.game_engine import GameEngine

try:
    from flask import Flask, request, jsonify, render_template, send_from_directory
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False

# In-memory storage for active sessions
games: Dict[str, GameEngine] = {}

def create_app():
    if not HAS_FLASK:
        return None

    app = Flask(__name__, static_folder='static', template_folder='templates')

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/api/game/new', methods=['POST'])
    def new_game():
        data = request.get_json() or {}
        mode = data.get('mode', 'pvc')
        players = data.get('players', [])
        exact_finish = data.get('exact_finish', True)
        extra_turn_on_six = data.get('extra_turn_on_six', True)

        game_id = str(uuid.uuid4())
        engine = GameEngine(
            players_data=players,
            mode=mode,
            exact_finish=exact_finish,
            extra_turn_on_six=extra_turn_on_six
        )
        games[game_id] = engine

        state = engine.get_state()
        return jsonify({
            "success": True,
            "game_id": game_id,
            "current_player": state["current_player"],
            "state": state
        })

    @app.route('/api/game/roll', methods=['POST'])
    def roll_dice():
        data = request.get_json() or {}
        game_id = data.get('game_id')
        player_id = data.get('player_id')
        fixed_dice = data.get('fixed_dice') # optional for testing

        if not game_id or game_id not in games:
            return jsonify({
                "success": False,
                "error": "Game session not found."
            }), 404

        engine = games[game_id]
        result = engine.play_turn(player_id=player_id, fixed_dice=fixed_dice)
        return jsonify(result)

    @app.route('/api/game/state', methods=['GET'])
    def get_state():
        game_id = request.args.get('game_id')
        if not game_id or game_id not in games:
            return jsonify({
                "success": False,
                "error": "Game session not found."
            }), 404

        engine = games[game_id]
        return jsonify({
            "success": True,
            "state": engine.get_state()
        })

    @app.route('/api/game/restart', methods=['POST'])
    def restart_game():
        data = request.get_json() or {}
        game_id = data.get('game_id')
        if not game_id or game_id not in games:
            return jsonify({
                "success": False,
                "error": "Game session not found."
            }), 404

        old_engine = games[game_id]
        new_engine = GameEngine(
            players_data=[{"name": p.name, "is_computer": p.is_computer, "color": p.color, "avatar": p.avatar} for p in old_engine.players],
            mode=old_engine.mode,
            exact_finish=old_engine.exact_finish,
            extra_turn_on_six=old_engine.extra_turn_on_six
        )
        games[game_id] = new_engine
        return jsonify({
            "success": True,
            "game_id": game_id,
            "state": new_engine.get_state()
        })

    return app

app = create_app() if HAS_FLASK else None

if __name__ == '__main__':
    if app:
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        print("Flask not installed in runtime environment. Running game engine verification...")
        engine = GameEngine(mode="pvc")
        print("Game initialized successfully:", engine.get_state())
