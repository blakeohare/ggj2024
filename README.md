# GGJ 2024

Repo for Global Game Jam 2024 (will be renamed, hopefully)

The theme is "Make Me Laugh".

The working title of the game is *A chicken crosses the road and walks into a bar*.

This is basically like Frogger but with a chicken trying to cross the road instead of a frog. After you cross the road you walk into the bar and your vision gets progressively more impaired as you proceed to cross the road to the next bar.

The source for the game is located under the `game/` directory.

# ROFLang

This game is written in a custom programming language that was created for this jam called **ROFLang**. It uses cliche joke templates for basic language constructs.

See `roflang-doc.md` for more information.

The source for the ROFLang compiler/interpreter is under the `rofl/` directory.

# Building/Running

This source for this language, despite being JavaScript is assembled together using a text-preprocessor. To do this, run the `build.py` Python script to create `bin/rofl.js`.

Additionally, this will consolidate and encode all game resources into a single JavaScript file called `bin/resources.js`. The file `index.html` is hardcoded to point to these two files.

# Distribution

To distribute the game, copy `index.html` along with the `bin` folder after running `build.py`. The game itself contains no compiled build files and instead the .rofl source code is included in the resources bundle.



