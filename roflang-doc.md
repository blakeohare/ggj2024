# ROFLang Doc

ROFLang is a function+structs type of programming language.

Whitespace does not matter as most lines end with a semicolon, but generally it follows a consistent indentation scheme.

## Functions

To define a function, you must use the **knock-knock** construct:

```
knock knock who's there functionName(arg1, arg2, ...) who
    (code for the function goes here)
ba dum tsss
```

All code blocks end with a `ba dum tsss`. The number of `s`'s at the end does not matter
e.g. `ba dum tsssssss` is equivalent to `ba dum ts`.

## If/Else statements

To create an if statement, use the **redneck** construct:

```
you might be a redneck if (condition)
    (code that runs if the condition is true)
ba dum tss
```

If an **else** condition is desired (i.e. if the condition is opposite of what was stated) then you use the **Soviet-Russia** construct:

```
you might be a redneck if (condition)
    (code if condition is true)
in soviet russia
    (code if condition is false)
ba dum tsss
```

A `ba dum tsss` is still required to close the else block.

These can also be chained:

```
you might be a redneck if (condition1)
    (code if condition1 is true)
in soviet russia you might be a redneck if (condition2)
    (code if condition1 is false and condition2 is true)
in soviet russia
    (code if neither is true)
ba dum tss
```

## Ternary

Like an if/else, a ternary also uses the **redneck**/**soviet** joke format but abbreviated:

```
(condition) redneck? (value if true) bolshevik? (value if false)
```

## Loops

To create a loop, use a **running gag**:

```
running gag (condition)
    (code that runs until the condition is no longer true)
ba dum tsss
```

## Return

To end a function and return a value, be sure to **tip your waitress**:

```
knock knock who's there double(value) who?
    tip your waitress value * 2;
ba dum tsss
```

## Invert a boolean

To invert a boolean, use the `NOT` suffix. This is akin to a typical `!` prefix in other languages.

`PSYCH` is an alias for `NOT`.

## Generate a random number

To generate a floating point number between 0 (inclusive) and 1 (exclusive), use the `lol whatever` keywords.

```
    diceRoll = $floor(6 * lol whatever + 1);
```

## Structs

You can create a blank struct using the $object(). You can apply and extract fields from this using dot notation.

> This will likely be changed if I can figure out how to make it funnier.

```
    temperature = $object();
    temperature.amount = 22;
    temperature.scale = 'celsius';

    $print("It is currently " + temperature.amount + " degrees " + temperature.scale[0].toUpper());
```

## Abbreviations

If the syntax is too heavy, most syntax can be abbreviated:

- `kkwt ____ who?`: `knock knock who's there ____ who?`
- `gag`: `running gag`
- `bdt`: `ba dum tsss` - any number of `s`'s is allowed
- `ymbari`: `you might be a redneck if`
- `isr`: `in soviet russia`
- `tyw`: `tip your waitress`

All abbreviations and initial words of full spellings are reserved keywords and cannot be used as variable, field, or function names.

## Booleans and null

Booleans are defined with the following keyword constants: `yup` (true) and `nope` (false)

Null is defined with the following keyword constant: `nada`

## Comments

To add a multi line comment, use the `heckle` keyword.

To end the comment, use the `call security`.

```
heckle
    This is a multi-line comment
    All text here will be ignored by the parser.
call security
```
