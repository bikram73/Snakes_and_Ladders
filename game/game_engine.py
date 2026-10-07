"""
Game Engine module containing core business logic for Snake & Ladder.
"""

import random
from typing import List, Dict, Any, Optional, Tuple
from .board import Board
from .player import Player

class GameRules:
    BOARD_SIZE = 100
    DICE_MIN = 1
    DICE_MAX = 6
    EXACT_FINISH = True
    EXTRA_TURN_ON_SIX = True

class GameEngine:
    def __init__(
        self,
        players_data: Optional[List[Dict[str, Any]]] = None,
        mode: str = "pvc",
        exact_finish: bool = True,
        extra_turn_on_six: bool = True
    ):
        self.board = Board()
        self.mode = mode
        self.exact_finish = exact_finish
        self.extra_turn_on_six = extra_turn_on_six
        
        self.players: List[Player] = []
        self.current_player_idx = 0
        self.game_over = False
        self.winner: Optional[Player] = None
        self.last_dice: Optional[int] = None
        self.move_history: List[Dict[str, Any]] = []

        self._initialize_players(players_data)

    def _initialize_players(self, players_data: Optional[List[Dict[str, Any]]]):
        color_map = [
            ("red", "🔴"),
            ("blue", "🔵"),
            ("green", "🟢"),
            ("yellow", "🟡")
        ]

        if not players_data:
            if self.mode == "pvc":
                players_data = [
                    {"name": "Player 1", "is_computer": False},
                    {"name": "Computer", "is_computer": True}
                ]
            elif self.mode == "four":
                players_data = [
                    {"name": "Player 1", "is_computer": False},
                    {"name": "Player 2", "is_computer": False},
                    {"name": "Player 3", "is_computer": False},
                    {"name": "Player 4", "is_computer": False}
                ]
            else: # two players
                players_data = [
                    {"name": "Player 1", "is_computer": False},
                    {"name": "Player 2", "is_computer": False}
                ]

        for i, p_info in enumerate(players_data):
            color, avatar = color_map[i % len(color_map)]
            is_comp = p_info.get("is_computer", False)
            if self.mode == "pvc" and i == 1:
                is_comp = True
            
            player = Player(
                id=i,
                name=p_info.get("name", f"Player {i + 1}"),
                position=0,
                is_computer=is_comp,
                color=p_info.get("color", color),
                avatar=p_info.get("avatar", avatar)
            )
            self.players.append(player)

    def roll_dice(self) -> int:
        return random.randint(GameRules.DICE_MIN, GameRules.DICE_MAX)

    def play_turn(self, player_id: Optional[int] = None, fixed_dice: Optional[int] = None) -> Dict[str, Any]:
        """
        Executes a turn for the current player.
        """
        if self.game_over:
            return {
                "success": False,
                "error": "This game has already ended.",
                "game_over": True,
                "winner": self.winner.to_dict() if self.winner else None
            }

        curr_player = self.players[self.current_player_idx]
        if player_id is not None and player_id != curr_player.id:
            return {
                "success": False,
                "error": "It is not your turn.",
                "current_player": curr_player.id
            }

        dice = fixed_dice if fixed_dice is not None else self.roll_dice()
        self.last_dice = dice

        old_position = curr_player.position
        landing_position = old_position + dice

        event = "normal"
        message = f"{curr_player.name} rolled a {dice} and moved from {old_position} to {landing_position}."
        final_position = landing_position

        # Check exact 100 finish rule
        if self.exact_finish and landing_position > self.board.size:
            final_position = old_position
            event = "overshoot"
            message = f"{curr_player.name} rolled a {dice}. You need an exact roll to reach 100."
        elif landing_position == self.board.size:
            final_position = self.board.size
            curr_player.position = final_position
            self.game_over = True
            self.winner = curr_player
            event = "winner"
            message = f"🏆 {curr_player.name} wins!"
        elif landing_position < self.board.size:
            # Check for Snake or Ladder
            if self.board.is_ladder(landing_position):
                final_position = self.board.get_destination(landing_position)
                event = "ladder"
                message = f"🪜 Ladder! {curr_player.name} climbed from {landing_position} to {final_position}."
            elif self.board.is_snake(landing_position):
                final_position = self.board.get_destination(landing_position)
                event = "snake"
                message = f"🐍 Snake! {curr_player.name} slid down from {landing_position} to {final_position}."
            
            curr_player.position = final_position
        else: # not exact_finish and landing_position > size
            final_position = self.board.size
            curr_player.position = final_position
            self.game_over = True
            self.winner = curr_player
            event = "winner"
            message = f"🏆 {curr_player.name} wins!"

        # Determine next player turn
        grant_extra_turn = (self.extra_turn_on_six and dice == 6 and not self.game_over)
        if not grant_extra_turn:
            self.current_player_idx = (self.current_player_idx + 1) % len(self.players)

        next_player = self.players[self.current_player_idx]

        log_entry = {
            "player_id": curr_player.id,
            "player_name": curr_player.name,
            "dice": dice,
            "old_position": old_position,
            "landing_position": landing_position if event != "overshoot" else old_position,
            "final_position": final_position,
            "event": event,
            "message": message,
            "extra_turn": grant_extra_turn
        }
        self.move_history.append(log_entry)

        response = {
            "success": True,
            "dice": dice,
            "player_id": curr_player.id,
            "player_name": curr_player.name,
            "old_position": old_position,
            "landing_position": landing_position if event != "overshoot" else old_position,
            "final_position": final_position,
            "event": event,
            "message": message,
            "next_player": next_player.id,
            "next_player_name": next_player.name,
            "is_computer_turn": next_player.is_computer and not self.game_over,
            "extra_turn": grant_extra_turn,
            "game_over": self.game_over,
            "winner": self.winner.to_dict() if self.winner else None,
            "players": [p.to_dict() for p in self.players]
        }
        return response

    def get_state(self) -> Dict[str, Any]:
        curr = self.players[self.current_player_idx]
        return {
            "mode": self.mode,
            "players": [p.to_dict() for p in self.players],
            "current_player": curr.id,
            "current_player_name": curr.name,
            "is_computer_turn": curr.is_computer and not self.game_over,
            "game_over": self.game_over,
            "winner": self.winner.to_dict() if self.winner else None,
            "last_dice": self.last_dice,
            "rules": {
                "board_size": self.board.size,
                "exact_finish": self.exact_finish,
                "extra_turn_on_six": self.extra_turn_on_six
            },
            "move_history": self.move_history[-20:]
        }
