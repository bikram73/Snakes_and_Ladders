"""
Board configuration and definitions for Snake & Ladder game.
"""

BOARD_SIZE = 100

SNAKES = {
    98: 78,
    95: 75,
    92: 88,
    89: 68,
    74: 53,
    64: 44,
    62: 22,
    49: 11,
    47: 26,
    16: 6
}

LADDERS = {
    3: 22,
    8: 30,
    15: 44,
    21: 42,
    28: 76,
    36: 57,
    51: 67,
    71: 92,
    80: 99
}

class Board:
    def __init__(self, size=BOARD_SIZE, snakes=None, ladders=None):
        self.size = size
        self.snakes = snakes if snakes is not None else SNAKES.copy()
        self.ladders = ladders if ladders is not None else LADDERS.copy()

    def is_snake(self, position: int) -> bool:
        return position in self.snakes

    def is_ladder(self, position: int) -> bool:
        return position in self.ladders

    def get_destination(self, position: int) -> int:
        if self.is_snake(position):
            return self.snakes[position]
        if self.is_ladder(position):
            return self.ladders[position]
        return position
