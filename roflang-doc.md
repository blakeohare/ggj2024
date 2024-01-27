# ROFLang Doc

ROFLang is a function+structs type of programming language.

Whitespace does not matter as most lines end with a semicolon, but generally it follows a consistent indentation scheme.

## Functions

To define a function, you must use the knock-knock construct:

```
kkwt functionName(arg1, arg2, ...) who
    (code for the function goes here)
bdt
```

`kkwt` stands for "Knock knock! Who's there?".

All code blocks end with a `bdt` which stands for "ba-dum-tsss".

## If/Else statements

To create an if statement, use the redneck construct:

```
ymbari (condition)
    (code that runs if the condition is true)
bdt
```

`ymbari` stands for "You might be a redneck if...".

If an else condition is desired (i.e. if the condition is opposite of what was stated) then you use the In-Soviet-Russia construct:

```
ymbari (condition)
    (code if condition is true)
isr
    (code if condition is false)
bdt
```

A `bdt` is still required to close the else block.

These can also be chained:

```
ymbari (condition1)
    (code if condition1 is true)
isr ymbari (condition2)
    (code if condition1 is false and condition2 is true)
isr
    (code if neither is true)
bdt
```

## Ternary

Like an if/else, a ternary also uses the redneck/soviet joke format but abbreviated:

```
(condition) redneck? (value if true) bolshevik? (value if false)
```

## Loops

To create a loop, use a running gag:

```
running gag (condition)
    (code that runs until the condition is no longer true)
bdt
```

## Return

To end a function and return a value, be sure to tip your waitress:

```
kkwt double(value) who?
    tip your waitress value * 2;
bdt
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

> This will likely be changed if I can make it funny.

```
    temperature = $object();
    temperature.amount = 22;
    temperature.scale = 'celsius';

    $print("It is currently " + temperature.amount + " degrees " + temperature.scale[0].toUpper());
```

## Full spellings

All abbreivations can be spelt out:

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
