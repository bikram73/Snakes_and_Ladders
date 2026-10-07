import unittest
from game.game_engine import GameEngine

class TestGameEngine(unittest.TestCase):
    def setUp(self):
        self.engine = GameEngine(mode="two")

    def test_initial_state(self):
        state = self.engine.get_state()
        self.assertEqual(len(state["players"]), 2)
        self.assertEqual(state["players"][0]["position"], 0)
        self.assertEqual(state["players"][1]["position"], 0)
        self.assertEqual(state["current_player"], 0)
        self.assertFalse(state["game_over"])

    def test_normal_movement(self):
        # Start at 0, roll 4 -> moves to 4
        res = self.engine.play_turn(player_id=0, fixed_dice=4)
        self.assertTrue(res["success"])
        self.assertEqual(res["final_position"], 4)
        self.assertEqual(res["next_player"], 1)

    def test_ladder_climb(self):
        # Ladder at 28 -> 76
        # Player 0 at position 24, rolls 4 -> lands on 28 -> climbs to 76
        self.engine.players[0].position = 24
        self.engine.current_player_idx = 0
        res = self.engine.play_turn(player_id=0, fixed_dice=4)
        self.assertTrue(res["success"])
        self.assertEqual(res["landing_position"], 28)
        self.assertEqual(res["final_position"], 76)
        self.assertEqual(res["event"], "ladder")

    def test_snake_slide(self):
        # Snake at 98 -> 78
        # Player 0 at position 93, rolls 5 -> lands on 98 -> slides to 78
        self.engine.players[0].position = 93
        self.engine.current_player_idx = 0
        res = self.engine.play_turn(player_id=0, fixed_dice=5)
        self.assertTrue(res["success"])
        self.assertEqual(res["landing_position"], 98)
        self.assertEqual(res["final_position"], 78)
        self.assertEqual(res["event"], "snake")

    def test_exact_winner(self):
        # Position 97 + roll 3 = 100 -> Win!
        self.engine.players[0].position = 97
        self.engine.current_player_idx = 0
        res = self.engine.play_turn(player_id=0, fixed_dice=3)
        self.assertTrue(res["success"])
        self.assertEqual(res["final_position"], 100)
        self.assertEqual(res["event"], "winner")
        self.assertTrue(res["game_over"])
        self.assertEqual(res["winner"]["id"], 0)

    def test_overshoot_rule(self):
        # Position 97 + roll 5 = 102 -> Player stays at 97
        self.engine.players[0].position = 97
        self.engine.current_player_idx = 0
        res = self.engine.play_turn(player_id=0, fixed_dice=5)
        self.assertTrue(res["success"])
        self.assertEqual(res["final_position"], 97)
        self.assertEqual(res["event"], "overshoot")
        self.assertFalse(res["game_over"])

    def test_six_grants_extra_turn(self):
        # If extra_turn_on_six is True, rolling 6 keeps current_player_idx on 0
        self.engine.extra_turn_on_six = True
        self.engine.current_player_idx = 0
        res = self.engine.play_turn(player_id=0, fixed_dice=6)
        self.assertTrue(res["extra_turn"])
        self.assertEqual(res["next_player"], 0)

    def test_turn_alternation(self):
        self.engine.extra_turn_on_six = False
        self.engine.current_player_idx = 0
        res1 = self.engine.play_turn(player_id=0, fixed_dice=3)
        self.assertEqual(res1["next_player"], 1)
        res2 = self.engine.play_turn(player_id=1, fixed_dice=2)
        self.assertEqual(res2["next_player"], 0)

if __name__ == '__main__':
    unittest.main()
