"""
Player model for Snake & Ladder game.
"""

from dataclasses import dataclass, field

@dataclass
class Player:
    id: int
    name: str
    position: int = 0
    is_computer: bool = False
    color: str = "red"
    avatar: str = "🔴"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "position": self.position,
            "is_computer": self.is_computer,
            "color": self.color,
            "avatar": self.avatar
        }
