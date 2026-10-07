import unittest
from game.board import Board, SNAKES, LADDERS, BOARD_SIZE

class TestBoard(unittest.TestCase):
    def setUp(self):
        self.board = Board()

    def test_board_size(self):
        self.assertEqual(self.board.size, 100)

    def test_snakes_exist(self):
        self.assertTrue(self.board.is_snake(98))
        self.assertEqual(self.board.get_destination(98), 78)
        self.assertTrue(self.board.is_snake(16))
        self.assertEqual(self.board.get_destination(16), 6)

    def test_ladders_exist(self):
        self.assertTrue(self.board.is_ladder(28))
        self.assertEqual(self.board.get_destination(28), 76)
        self.assertTrue(self.board.is_ladder(3))
        self.assertEqual(self.board.get_destination(3), 22)

    def test_normal_cell(self):
        self.assertFalse(self.board.is_snake(10))
        self.assertFalse(self.board.is_ladder(10))
        self.assertEqual(self.board.get_destination(10), 10)

if __name__ == '__main__':
    unittest.main()
